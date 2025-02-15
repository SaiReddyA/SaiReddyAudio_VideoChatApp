export class UserInfo {
    userId        : string = "" // Unique UserId instead of ConnectionId
    connectionId! : string 
    userName      : string = ""
    lastMessage   : string  = "";
    isOnline      : boolean = true;
}
export class UserCallInfo implements UserInfo {
    userId        : string = "" // Unique UserId instead of ConnectionId
    connectionId! : string 
    userName      : string = ""
    lastMessage   : string  = "";
    isOnline      : boolean = true;
    isReceiving   : boolean = false;
    IsAudioCall   : boolean = true
    
}
export class Message {
    from!: string;  // sender's user ID
    to!: string;    // receiver's user ID
    body!: string;
    time!: string;  // timestamp of when the message was sent
    sent!: boolean; // whether the message has been sent by the sender
    delivered!: boolean; // whether the message has been delivered to the receiver
    read!: boolean; // whether the receiver has read the message
    type: string = 'text'; // whether the receiver has read the message
  }
  