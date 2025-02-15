import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../Services/chat.service';
import { UserInfo , Message, UserCallInfo} from '../../Interfaces/user-info';
import { Subscription } from 'rxjs/internal/Subscription';
import { PickerModule } from '@ctrl/ngx-emoji-mart'; 
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { CemeraComponent } from '../cemera/cemera.component';
import { CallerComponent } from '../caller/caller.component';


@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, PickerModule, MatMenuModule ],
  templateUrl: './chat-area.component.html',
  styleUrl: './chat-area.component.css'
})
export class ChatAreaComponent {
  messages = [
    { text: 'Hello!', time: '10:00 AM', sent: true },
    { text: 'Hi there!', time: '10:01 AM', sent: false }
  ];
  newMessage = '';
  showEmojiPicker = false;
  showMoreInfo =  false;  
  @Input() selectedUsers: UserInfo = new UserInfo();
  @ViewChild('chatMessages', { static: false }) private chatMessagesContainer!: ElementRef;
  @ViewChild('video', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvas', { static: false }) canvasElement!: ElementRef;
  capturedImage: string | null = null;
  stream: MediaStream | null = null;
  messagesSubscription?: Subscription; // Receive user from parent
  private mediaRecorder!: MediaRecorder;
  
  userName: string = ''; // Set this dynamically for real applications
  messagesSignal: Message[] = [];
  messageText: string = '';
  selectedUser: string = '';
  currentUserId:string = "";
  typingUser: string | null = null;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;
  currentChatUser: UserInfo | undefined;
  emojiPickerContainer: HTMLElement | any;
  private audioChunks: Blob[] = [];
  public isRecording = false;
  public recordedAudio: string | null = null;
  public WholeAudioBlob: Blob | null = null;
  constructor(private chatService: ChatService,
              private elementRef: ElementRef,
              private dialog: MatDialog,
              private cdr:ChangeDetectorRef,
  ) {
  }
  

  ngOnInit() {
    let storedUserId = localStorage.getItem('userId');
    this.emojiPickerContainer = this.elementRef.nativeElement.querySelector('.emoji-picker-container');

    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substr(2, 9); // Generate a unique userId
      localStorage.setItem('userId', storedUserId);
    }
    
    this.currentUserId = storedUserId;  // Ensure it's set before use
    this.userName = prompt('Enter your name') || `User${Math.random().toString(36).substr(2, 5)}`;
  
    this.chatService.startConnection(this.currentUserId, this.userName);
    
    this.chatService.typingUsers$.subscribe(user => {
      this.typingUser = user;
      console.log(this.typingUser, 'typesof');
    });
     
    // // Subscribe to message updates
    // if(this.selectedUsers){
    //   this.chatService.messages$.subscribe(messages => {
    //     this.messagesSignal = messages; // Correctly update UI
    //     if(this.messagesSignal){
    //             //this.closeChat(true);
    //           }
    //     console.log(this.messagesSignal, 'messages');
    //   });
    // }
    this.chatService.selectedUser$.subscribe(selectedUser => {
      if (selectedUser) {
        
        this.currentChatUser = selectedUser;
        this.closeChat(true);
        // Unsubscribe from previous chat messages before switching users
        this.messagesSubscription?.unsubscribe();

        // Load messages for the selected user
        this.messagesSignal = this.chatService.getMessagesForSelectedUser(selectedUser.userId);

        // Subscribe to messages$ for real-time updates
        this.messagesSubscription = this.chatService.messages$.subscribe(() => {
          // Fetch latest messages when a new message arrives
          this.messagesSignal = this.chatService.getMessagesForSelectedUser(selectedUser.userId);
        });
        
        //Mark messages as read when opening chat
       this.chatService.markMessagesAsRead(selectedUser.userId, this.chatService.getCurrentUserId());
      }
    });
    
    // Subscribe to incoming call notifications
    this.chatService.incomingCall$.subscribe(fromUser => {
      if (fromUser) {
        this.ReceiveCall(fromUser);
      }
    });
  // Subscribe to selected user changes and fetch messages dynamically
  // this.chatService.getMessagesForSelectedUser(this.currentUserId).subscribe(messages => {
  //   this.messagesSignal = messages;
  // });
  // this.messagesSignal = this.chatService.getMessagesForSelectedUser(this.currentUserId)
  // // this.chatService.selectedUser$.subscribe(user => {
  // //   this.selectedUser = user;
  // // });
  }

  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log('Scroll error:', err);
    }
  }
  sendMessage() {
    if (this.userName && this.messageText.trim()) {
      this.currentUserId = this.chatService.getCurrentUserId();
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
      const message: Message = {
        from: this.currentUserId,
        to: this.selectedUsers?.userId,
        body: this.messageText,
        time: time,
        sent: true,
        delivered: false,
        read: false,
        type: 'text'
      };
  
      console.log(this.selectedUsers?.userId, this.messageText, this.currentUserId, 'send');
  
      // // Get the current stored messages for this user
      // const storedMessages = JSON.parse(localStorage.getItem(`userId:${this.currentUserId}`) || '[]');
  
      // // Add the new message
      // storedMessages.push(message);
  
      // // Save messages in localStorage
      // localStorage.setItem(`userId:${this.currentUserId}`, JSON.stringify(storedMessages));
  
      // // Update BehaviorSubject
      // this.chatService.messages$.next(storedMessages);
      this.messagesSignal.push(message)
      // Send message via SignalR
      this.chatService.sendMessage(this.currentUserId, this.selectedUsers?.userId, message);
  
      // // Clear the input field
      this.messageText = '';
  
      // // Stop typing indicator
      // this.chatService.stopTyping(this.currentUserId, this.selectedUsers?.userId);
    }else{
      console.error(this.userName,'err')
    }
  }
  closeChat(chatPannel:boolean) {
    if(chatPannel){
      // Hide chat messages
    document.getElementById("chat-pannel")?.classList.remove("d-none");
    // Show right panel
    document.getElementById("chatInfoPanel")?.classList.add("d-none");
    }else{
      // Unsubscribe from previous chat messages before switching users
      this.messagesSubscription?.unsubscribe();
      // Hide chat messages
    document.getElementById("chat-pannel")?.classList.add("d-none");
    // Show right panel
    document.getElementById("chatInfoPanel")?.classList.remove("d-none");
    }
  }
  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    this.messagesSubscription?.unsubscribe();
  }
  
  
  toggleMoreInfo(){
    this.showMoreInfo = !this.showMoreInfo;
  }
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  // Add selected emoji to input field
  addEmoji(event: any) {
    console.log(event,'ddemokiji')
  if (event.emoji && event.emoji.native) {
    this.messageText += event.emoji.native;
    //this.showEmojiPicker = false; // Close picker after selection
    //this.messageInput.nativeElement.focus();
  } else {
    console.error("Emoji data is missing:", event);
  }
  }
  async startRecording() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Audio recording is not supported in this browser.');
        return;
      }

  try {
    // 🔥 Request audio stream with echo cancellation
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true }
    });

    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    // 🔥 Ensure `ondataavailable` runs before `start()`
    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
        console.log('🔴 Audio chunk recorded:', event.data.size, 'bytes');
      } else {
        console.warn('⚠️ Empty audio chunk received.');
      }
    };

    // 🔥 Use timeslice to generate chunks continuously
    this.mediaRecorder.start();
    this.isRecording = true;
    console.log('🎤 Recording started...');
  } catch (error) {
    console.error('❌ Error accessing microphone:', error);
  }
}

stopRecording() {
  if (!this.isRecording || !this.mediaRecorder) return;
  
  this.isRecording = false;
  this.mediaRecorder.stop();

  this.mediaRecorder.onstop = () => {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.recordedAudio = URL.createObjectURL(audioBlob);
       this.WholeAudioBlob = audioBlob;
       this.cdr.detectChanges()
  };
}

deleteRecording() {
  this.recordedAudio = null;
  this.WholeAudioBlob = null
}

  async sendVoiceMessage() {
    if(this.WholeAudioBlob != null){
      const reader = new FileReader();
    reader.readAsDataURL(this.WholeAudioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      this.currentUserId = this.chatService.getCurrentUserId();
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      //this.recordedAudio = base64Audio;
        const message: Message = {
          from: this.currentUserId,
          to: this.selectedUsers?.userId,
          body: base64Audio,
          time: time,
          sent: true,
          delivered: false,
          read: false,
          type: 'audio'
        };
        this.messagesSignal.push(message)
      this.chatService.shareAudio(this.currentUserId, this.selectedUsers?.userId, base64Audio)
            console.log('Voice message sent via SignalR.', base64Audio);
            this.recordedAudio = null;
    };
    }
  }

ConvertstringToBlob(basetoBlob:string){
  const byteCharacters = atob(basetoBlob.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const audioBlob = new Blob([byteArray], { type: 'audio/webm' });
 //  const recod = URL.createObjectURL(audioBlob);
   return audioBlob;
}

  onTyping() {
    if (this.userName) {
      this.currentUserId = this.chatService.getCurrentUserId();
      console.log(this.selectedUsers?.userId,  this.currentUserId, 'ontyoein')
      this.chatService.startTyping(this.currentUserId, this.selectedUsers?.userId);
    }
  }

  onStopTyping() {
    if (this.userName) {
      this.currentUserId = this.chatService.getCurrentUserId();
      console.log(this.selectedUsers?.userId,  this.currentUserId,'stop')
      this.chatService.stopTyping(this.currentUserId, this.selectedUsers?.userId);
    }
  }
  openCamera() {
    const dialogRef = this.dialog.open(CemeraComponent, {
      width: '450px',
      height: '500px',
      panelClass: 'custom-dialog'
    });
    // After the dialog is closed, receive the image bytes
    dialogRef.afterClosed().subscribe((imageBytes: string) => {
      if (imageBytes) {
        this.capturedImage = imageBytes;
        console.log("Received Image Bytes: ", imageBytes);

        // Send Image Bytes to Chat Message
        this.sendImageToUser(imageBytes);
      }
    });
  }
  // Function to Send Image as Message
  sendImageToUser(imageBytes: string) {
    // const base64String = this.chatService.byteArrayToBase64(imageBytes);
    // console.log("Base64 Image for Preview: ", base64String);
    this.currentUserId = this.chatService.getCurrentUserId();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
      const message: Message = {
        from: this.currentUserId,
        to: this.selectedUsers?.userId,
        body: imageBytes,
        time: time,
        sent: true,
        delivered: false,
        read: false,
        type: 'image'
      };
      this.messagesSignal.push(message)
    this.chatService.shareImage(this.currentUserId, this.selectedUsers?.userId, imageBytes)
  }
  byteArrayToBase64(ImageBytes:any):string{
    return this.chatService.byteArrayToBase64(ImageBytes);
  }
  public isAudioLoading = true;

  onAudioLoaded(audio: HTMLAudioElement) {
    this.isAudioLoading = false;
  }
  
  StartCall(isAudioCall:boolean = true){
    try{
      const usercall: UserCallInfo = {
        userId: this.selectedUsers?.userId,
        connectionId: this.selectedUsers?.connectionId,
        userName:this.selectedUsers?.userName,
        lastMessage: this.selectedUsers?.userId,
        isOnline: true,
        isReceiving: false,
        IsAudioCall: isAudioCall
      };      
      this.chatService.callUser(this.chatService.getCurrentUserId(), this.selectedUsers?.userId)
     const dialogRef = this.dialog.open(CallerComponent, {
        width: '300px',
        data: usercall,
        disableClose: true
      });
  
    }catch(er){
      console.error
      (er);
    }
  }

  ReceiveCall(fromUser: UserInfo, isAudioCall:boolean = true){
    try{
      const usercall: UserCallInfo = {
        userId: fromUser?.userId,
        connectionId: fromUser?.connectionId,
        userName: fromUser?.userName,
        lastMessage: fromUser?.userId,
        isOnline: true,
        isReceiving: true,
        IsAudioCall: isAudioCall
      };      
     const dialogRef = this.dialog.open(CallerComponent, {
        width: '300px',
        data: usercall,
        disableClose: true
      });
  
    }catch(er){
      console.error
      (er);
    }
  }
}
