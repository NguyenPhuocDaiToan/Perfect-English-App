
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../shared/toast/toast.component';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule, ToastComponent, ConfirmationModalComponent],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block h-full'
  }
})
export class AdminComponent {
  themeService = inject(ThemeService);
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }
}
