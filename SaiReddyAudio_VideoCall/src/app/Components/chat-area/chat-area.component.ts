import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../Services/chat.service';
import { UserInfo , Message} from '../../Interfaces/user-info';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './chat-area.component.html',
  styleUrl: './chat-area.component.css'
})
export class ChatAreaComponent {
  messages = [
    { text: 'Hello!', time: '10:00 AM', sent: true },
    { text: 'Hi there!', time: '10:01 AM', sent: false }
  ];
  newMessage = '';

  // sendMessage() {
  //   if (this.newMessage.trim()) {
  //     this.messages.push({ text: this.newMessage, time: new Date().toLocaleTimeString(), sent: true });
  //     this.newMessage = '';
  //   }
  // }
  

  userName: string = ''; // Set this dynamically for real applications
  messagesSignal: Message[] = [];
  messageText: string = '';
  selectedUser: string = '';
  currentUserId:string = "";
  constructor(private chatService: ChatService) {
  }
  @Input() selectedUsers: UserInfo = new UserInfo(); // Receive user from parent

  ngOnInit() {
    let storedUserId = localStorage.getItem('userId');
    
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substr(2, 9); // Generate a unique userId
      localStorage.setItem('userId', storedUserId);
    }
    
    this.currentUserId = storedUserId;  // Ensure it's set before use
    this.userName = prompt('Enter your name') || `User${Math.random().toString(36).substr(2, 5)}`;
  
    this.chatService.startConnection(this.currentUserId, this.userName);
  
     
    // // Subscribe to message updates
    this.chatService.messages$.subscribe(messages => {
      this.messagesSignal = messages; // Correctly update UI
      console.log(this.messagesSignal, 'messages');
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
        read: false
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
}
