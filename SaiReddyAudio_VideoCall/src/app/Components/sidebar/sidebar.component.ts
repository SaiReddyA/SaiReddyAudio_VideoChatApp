import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../Services/chat.service';
import { UserInfo } from '../../Interfaces/user-info';

export interface Message {
  username: string;
  message: string;
  isFavourite: boolean;
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

    constructor(private chatService: ChatService) {}
    @Output() userSelected = new EventEmitter<UserInfo>(); // Event to send selected user
    activeUsers: UserInfo[] = [];
    typingUser: string | null = null;

    ngOnInit() {
      this.chatService.activeUsers$.subscribe(users => {
        this.activeUsers = users.filter((item: any) => item.userId !== this.chatService.getCurrentUserId());
         console.log(this.activeUsers,'activeuser')
      });
      if(this.activeUsers.length >0){
        this.userSelected.emit(this.activeUsers[0]);
      }
      this.chatService.typingUsers$.subscribe(user => {
        this.typingUser = user;
        console.log(this.typingUser, 'typesof');
      });
    }
  messages: Message[] = [
    { username: 'Victoria Lane', message: 'Hey, I\'m going to meet a friend of 18', isFavourite: true },
    { username: 'Etta McDaniel', message: 'Yeah everything is fine. Our next meeting...', isFavourite: true },
    { username: 'James Pinard', message: 'Wow that\'s great!', isFavourite: true },
    { username: 'Ronald Downey', message: 'Why I try the to get demo data following ...', isFavourite: true },
    { username: 'Nicholas Staten', message: 'Pleased to meet you again!', isFavourite: false },
    { username: 'Kathryn Swarey', message: 'Sure buddy 🌟', isFavourite: false }
  ];

  get favourites(): Message[] {
    return this.messages.filter(msg => msg.isFavourite);
  }

  get directMessages(): Message[] {
    return this.messages.filter(msg => !msg.isFavourite);
  }

  get totalMessages(): number {
    return this.messages.length;
  }

  getInitial(username: string): string {
    return username.charAt(0).toUpperCase();
  }
  selectUser(user: UserInfo) {
    this.userSelected.emit(user); // Emit the selected user to parent
    this.chatService.selectUser(user); // Update selected user globally

  }

}


