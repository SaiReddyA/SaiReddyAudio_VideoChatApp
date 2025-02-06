import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  toggle(){
    // Toggle theme between light and dark
const toggleThemeButton = document.getElementById('theme-toggle');

   if(toggleThemeButton){
    toggleThemeButton.addEventListener('click', () => {
      if (document.documentElement.getAttribute('data-theme') === 'dark') {
          document.documentElement.setAttribute('data-theme', 'light');
      } else {
          document.documentElement.setAttribute('data-theme', 'dark');
      }
     });
   }

  }

  
}
// Toggle sidebar visibility on mobile
function toggleSidebar() {
  const sidebar = document.querySelector('.left-sidebar');
  sidebar?.classList.toggle('active');
}

// Show/hide right pane on mobile
function toggleRightPane() {
  const rightPane = document.querySelector('.right-pane');
  rightPane?.classList.toggle('show');
}