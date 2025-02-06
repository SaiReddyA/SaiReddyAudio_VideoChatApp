import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Components/header/header.component';
import { SidebarComponent } from './Components/sidebar/sidebar.component';
import { ChatAreaComponent } from './Components/chat-area/chat-area.component';
import { CommonModule } from '@angular/common';
import { UserInfo } from './Interfaces/user-info';
import { FooterComponent } from './Components/footer/footer.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule, HeaderComponent, SidebarComponent, ChatAreaComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SaiReddyAudio_VideoCall';
  selectedUser: UserInfo = new UserInfo(); 

  onUserSelected(user: UserInfo) {
    this.selectedUser = user; // Update selected user
  }
}
