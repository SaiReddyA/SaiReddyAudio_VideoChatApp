import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Components/header/header.component';
import { SidebarComponent } from './Components/sidebar/sidebar.component';
import { ChatAreaComponent } from './Components/chat-area/chat-area.component';
import { CommonModule } from '@angular/common';
import { UserInfo } from './Interfaces/user-info';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule, HeaderComponent, SidebarComponent, ChatAreaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Sai Reddy Chat App';
  selectedUser: UserInfo = new UserInfo(); 
  selectedUser1: UserInfo | null = null;

  onUserSelected(user: UserInfo) {
    this.selectedUser = user; // Update selected user
  }
  onCloseChat() {
    this.selectedUser1 = null; // Close chat area
  }
}
