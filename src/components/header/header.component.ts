import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  isMenuOpen = signal(false);
  isDropdownOpen = signal(false);
  
  authService = inject(AuthService);
  private router = inject(Router);

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
    this.isDropdownOpen.set(false);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  logout() {
    this.isDropdownOpen.set(false);
    this.authService.logout();
  }
}