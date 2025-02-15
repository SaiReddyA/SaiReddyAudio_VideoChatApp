import { Component, Inject } from '@angular/core';
import { ChatService } from '../../Services/chat.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserCallInfo } from '../../Interfaces/user-info';
import { MatFabButton } from '@angular/material/button';

@Component({
  selector: 'app-caller',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, CommonModule, MatFabButton],
  templateUrl: './caller.component.html',
  styleUrl: './caller.component.css'
})
export class CallerComponent {
  isMuted = false;
  isSpeakerOn = false;
  userCall!: UserCallInfo;
  constructor(private chatService: ChatService, 
              public dialogRef: MatDialogRef<CallerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: UserCallInfo,
             ) {}

  ngOnInit() {
    this.userCall = this.data;
    if (this.userCall.isReceiving) {
      this.startWebRTCConnection();
    }
}
  acceptCall() {
    this.chatService.acceptCall(this.chatService.getCurrentUserId(),this.userCall.userId);
    //this.dialogRef.close('accepted');
  }

  endCall() {
    this.chatService.rejectCall(this.chatService.getCurrentUserId(),this.userCall.userId);
    this.dialogRef.close('ended');
  }
  // Start WebRTC Connection
  startWebRTCConnection() {
    //console.log(`🔊 Establishing WebRTC Connection with ${fromUser.userName}`);
    const peerConnection = new RTCPeerConnection();

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  });

  peerConnection.ontrack = (event) => {
    const audioElement = document.createElement("audio");
    audioElement.srcObject = event.streams[0];
    audioElement.play();
  };
  }
  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  toggleSpeaker() {
    this.isSpeakerOn = !this.isSpeakerOn;
  }

  
  // callUser() {
  //   if (this.selectedUserId) {
  //     this.signalRCallService.callUser(this.activeUserId, this.selectedUserId);
  //     this.openCallDialog(this.selectedUserId, false);
  //   }
  // }

  // openCallDialog(user: string, isReceiving: boolean) {
  //   const dialogRef = this.dialog.open(CallDialogComponent, {
  //     width: '300px',
  //     data: { user, isReceiving },
  //     disableClose: true
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result === 'accepted' && isReceiving) {
  //       this.signalRCallService.acceptCall(user, this.activeUserId);
  //     } else if (result === 'ended') {
  //       this.signalRCallService.rejectCall(user, this.activeUserId);
  //     }
  //   });
  // }
}
