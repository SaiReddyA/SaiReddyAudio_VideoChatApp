import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

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
