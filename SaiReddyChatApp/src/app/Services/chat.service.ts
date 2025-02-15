import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Message, UserInfo } from '../Interfaces/user-info';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private currentUserId: string = "";

    //private baseUrl = 'https://sr-audio-videosignalr.onrender.com'; // Replace with your API URL
  private baseUrl = 'https://localhost:7252'; // Backend SignalR Hub URL

  // Observables for real-time data
  public activeUsers$ = new BehaviorSubject<UserInfo[]>([]);
  public messages$ = new BehaviorSubject<Message[]>([]);
  public typingUsers$ = new BehaviorSubject<string | null>(null);
  public selectedUser$ = new BehaviorSubject<UserInfo | null>(null);
  private selectedItemSource = new BehaviorSubject<string>('messages'); // Default value
  selectedItem$ = this.selectedItemSource.asObservable();

  constructor() {
    this.loadStoredMessages();
  }

   // Select a user and update BehaviorSubject
   selectUser(user: UserInfo) {
    this.selectedUser$.next(user);
  }
  // Initialize SignalR connection
  startConnection(userId: string, userName: string) {
    this.currentUserId = userId; // Store the userId in the service
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/SaiReddychatHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR Connected', userId, userName);
        this.connectUser(userId, userName);
      })
      .catch((err) => console.error('❌ SignalR Connection Error: ', err));

    this.registerHandlers();
  }
    // Method to get the current userId
    getCurrentUserId(): string {
      return this.currentUserId;
    }
  // Send user information on connection
  connectUser(userId: string, userName: string) {
    this.hubConnection.invoke('ConnectUser', userId, userName).catch((err) => console.error(err));
  }

  private registerHandlers() {
    // Handle active users update
    this.hubConnection.on('UpdateActiveUsers', (users: any[]) => {
      this.activeUsers$.next(users);
    });

   // Handle incoming messages
    // Handle incoming messages
this.hubConnection.on('ReceiveMessage', (from: string, message: { body: string, time: string, sent: boolean, to:string, from:string}) => {
  const receivedMessage: Message = {
    from: message.from,
    to: message.to, // Receiver's user ID
    body: message.body,
    time: message.time,
    sent: message.sent,
    delivered: true, // Mark as delivered when it is received
    read: false,
    type: 'text'
  };
  this.saveMessages(receivedMessage)
  

  // ✅ If the user is already viewing the chat, mark it as read immediately
  if (this.selectedUser$.value?.userId === message.from) {
    this.markMessagesAsRead(message.from, message.to);
  }
});


   // Message delivered acknowledgment
   // Message delivered acknowledgment
// Message delivered acknowledgment
this.hubConnection.on('MessageDelivered', (toUser: string) => {
  const storedMessages = JSON.parse(localStorage.getItem(`userId:${toUser}`) || '[]');

  // Update only the specific message as delivered
  const updatedMessages = storedMessages.map((msg: Message) => {
    if (msg.to === toUser && msg.sent === true && msg.delivered === false) {
      return { ...msg, delivered: true };
    }
    return msg;
  });

  //this.saveMessages(updatedMessages);

  console.log(`📩 Message delivered to ${toUser}`);
});



    // Message read acknowledgment
// Message read acknowledgment
// Message read acknowledgment
this.hubConnection.on('MessageRead', (fromUser: string, toUser: string) => {
  const storedMessages = JSON.parse(localStorage.getItem(`userId:${toUser}`) || '[]');

  const updatedMessages = storedMessages.map((msg: Message) => {
    if (msg.from === fromUser && msg.to === toUser && msg.sent === true && msg.read === false) {
      return { ...msg, read: true };
    }
    return msg;
  });

  localStorage.setItem(`userId:${toUser}`, JSON.stringify(updatedMessages));

  if (this.selectedUser$.value && this.selectedUser$.value.userId === fromUser) {
    console.log(fromUser, 'Read Receipts')
    this.messages$.next(this.getMessagesForSelectedUser(this.selectedUser$.value.userId));
    this.messages$.asObservable();
  }
});


    // Handle typing indicator
    this.hubConnection.on('UserTyping', (user: any) => {
      this.typingUsers$.next(user);
    });

    this.hubConnection.on('UserStoppedTyping', () => {
      this.typingUsers$.next(null);
    });

    // Handle call events
    this.hubConnection.on('IncomingCall', (fromUser: string) => {
      console.log(`📞 Incoming call from ${fromUser}`);
    });

    this.hubConnection.on('CallAccepted', (user: string) => {
      console.log(`✅ Call accepted by ${user}`);
    });

    this.hubConnection.on('CallRejected', (user: string) => {
      console.log(`❌ Call rejected by ${user}`);
    });

    this.hubConnection.on('CallEnded', (user: string) => {
      console.log(`🔴 Call ended by ${user}`);
    });

    // Handle Image and Video Sharing (imageBytes: Uint8Array)
    this.hubConnection.on('ReceiveImage', (fromUserId: string, toUserId: string, imageBytes: string) => {
      console.log(`🖼 Image received from ${fromUserId}: ${imageBytes}`);
      const receivedMessage:Message = {
        body: imageBytes,
        sent: false, // Mark as received
        time: new Date().toLocaleTimeString(),
        from: fromUserId,
        to: toUserId,
        delivered: false,
        read: false,
        type: 'image'
      };
      this.saveMessages(receivedMessage)
    });
     // Handle Image and Video Sharing (imageBytes: Uint8Array)
     this.hubConnection.on('ReceiveAudio', (fromUserId: string, toUserId: string, audio: string) => {
      console.log(`🖼 Image received from ${fromUserId}: ${audio}`);
      const receivedMessage:Message = {
        body: audio,
        sent: false, // Mark as received
        time: new Date().toLocaleTimeString(),
        from: fromUserId,
        to: toUserId,
        delivered: false,
        read: false,
        type: 'audio'
      };
      this.saveMessages(receivedMessage)
    });

    this.hubConnection.on('ReceiveVideo', (fromUser: string, videoUrl: string) => {
      console.log(`📹 Video received from ${fromUser}: ${videoUrl}`);
    });
  }

    // Loads stored messages from localStorage on init
    private loadStoredMessages() {
      const storedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
      this.messages$.next(storedMessages);
    }

    // Stores messages in localStorage and updates BehaviorSubject
  // private saveMessages(messages: Message) {
  //    // Get existing messages from localStorage
  //    console.log(this.getCurrentUserId(),'current userid')
  // const storedMessages = JSON.parse(localStorage.getItem(`userId:${this.getCurrentUserId()}`) || '[]');
  // // Add new message to stored messages (correctly appending)
  //       if(messages)
  //       {
  //         storedMessages.push(messages);
  //       }
  // // Save updated messages in localStorage
  //    localStorage.setItem(`userId:${this.getCurrentUserId()}`, JSON.stringify(storedMessages));
   
  //    const filteredMessages = storedMessages.filter((msg: { from: string; to: string }) =>
  //    (msg.from === this.getCurrentUserId()) || (msg.to === this.getCurrentUserId()));
  //    //console.log('message saved and feting usermessages', filteredMessages, 'totalmessas', storedMessages,)
  //    this.messages$.next(filteredMessages);

  // }

  private saveMessages(message: Message) {
    const storedMessages = JSON.parse(localStorage.getItem(`userId:${this.getCurrentUserId()}`) || '[]');
  
    storedMessages.push(message);
    localStorage.setItem(`userId:${this.getCurrentUserId()}`, JSON.stringify(storedMessages));
  console.log(this.selectedUser$.value, 'this.selectedUser$.value')
  console.log(this.selectedUser$.value?.userId, 'this.selectedUser$.valueuserId')
  console.log(message.from, 'from')
    // Update only messages for selected user
    if (this.selectedUser$.value && this.selectedUser$.value.userId === message.from) {
      console.log(message.from, 'inside if satis')
      this.messages$.next(this.getMessagesForSelectedUser(this.selectedUser$.value.userId));
      this.messages$.asObservable();
    }
  }
  
  getMessagesForSelectedUser(selectedUserId: string): Message[] {
    const storedMessages = JSON.parse(localStorage.getItem(`userId:${this.getCurrentUserId()}`) || '[]');
  
    // Only return messages that are from or to the selected user
    return storedMessages.filter((msg: Message) => 
      (msg.from === selectedUserId && msg.to === this.getCurrentUserId()) || 
      (msg.from === this.getCurrentUserId() && msg.to === selectedUserId)
    );
  }
  
  
  
  

  // Send a 1-to-1 message
  sendMessage(fromUserId: string, toUserId: string, message: Message) {
    this.hubConnection.invoke('SendMessageToUser', fromUserId, toUserId, message).catch((err) => console.error(err));
  }

  // Mark messages as read
  markMessagesAsRead(fromUserId: string, toUserId: string) {
    this.hubConnection.invoke('MessageRead', fromUserId, toUserId).catch((err) => console.error(err));
  
    // Update messages in local storage
    const storedMessages = JSON.parse(localStorage.getItem(`userId:${toUserId}`) || '[]');
  
    const updatedMessages = storedMessages.map((msg: Message) => {
      if (msg.from === fromUserId && msg.to === toUserId && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });
  
    localStorage.setItem(`userId:${toUserId}`, JSON.stringify(updatedMessages));
  }
  

  // Notify typing
  startTyping(fromUserId: string, toUserId: string) {
    this.hubConnection.invoke('Typing', fromUserId, toUserId).catch((err) => console.error(err));
  }

  stopTyping(fromUserId: string, toUserId: string) {
    this.hubConnection.invoke('StopTyping', fromUserId, toUserId).catch((err) => console.error(err));
  }

  // Call User
  callUser(fromUserId: string, toUserId: string) {
    this.hubConnection.invoke('CallUser', fromUserId, toUserId).catch((err) => console.error(err));
  }

  acceptCall(fromUserId: string, toUserId:string) {
    this.hubConnection.invoke('AcceptCall', fromUserId, toUserId).catch((err) => console.error(err));
  }

  rejectCall(fromUserId: string, toUserId:string) {
    this.hubConnection.invoke('RejectCall', fromUserId, toUserId).catch((err) => console.error(err));
  }

  // endCall(toUserId: string) {
  //   this.hubConnection.invoke('EndCall', toUserId).catch((err) => console.error(err));
  // }

  // Share Media
  shareImage(fromUserId:string, receiverUserId: string, imageBytes: string) {
    this.hubConnection.invoke("ShareImage", fromUserId, receiverUserId, imageBytes);
  }
  shareAudio(fromUserId:string, receiverUserId: string, imageBytes: string) {
    this.hubConnection.invoke("ShareAudio", fromUserId, receiverUserId, imageBytes);
  }
  
  shareVideo(fromUserId:string, toUserId: string, video: string) {
    this.hubConnection.invoke('ShareVideo', fromUserId, toUserId, video).catch((err) => console.error(err));
  }
  changeSelectedItem(item: string) {
    this.selectedItemSource.next(item);
  }

  byteArrayToBase64(byteArray: Uint8Array): string {
    let binary = '';
    byteArray.forEach(byte => binary += String.fromCharCode(byte));
    return 'data:image/png;base64,' + window.btoa(binary);
  }
}
