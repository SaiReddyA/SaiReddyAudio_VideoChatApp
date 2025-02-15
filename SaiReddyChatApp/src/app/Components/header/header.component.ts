import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../Services/chat.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatFormFieldModule, MatInputModule, CommonModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  activeItem: string = 'messages'; 

  constructor(private chatService: ChatService) { }
  setActiveItem(item: string) {
    this.activeItem = item;
    this.chatService.changeSelectedItem(item);
  }
  toggle() {
    try {
      const toggleThemeButton = document.getElementById('theme-toggle');

      if (toggleThemeButton) {
        toggleThemeButton.addEventListener('click', () => {
          if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
          } else {
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        });
      }

    } catch (er) {
      console.error(er);
    }
  }

}
