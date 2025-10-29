import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

type ToastState = 'hidden' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userEmail = this.authService.emailForVerification;
  toastState = signal<ToastState>('hidden');
  toastMessage = signal('');
  
  constructor() {
    // If the user navigates here without an email (e.g., direct URL), redirect them.
    if (!this.userEmail()) {
      this.router.navigate(['/register']);
    }
  }

  resendEmail() {
    // Simulate API call for resending email
    this.toastState.set('hidden');
    
    setTimeout(() => {
        // Simulate a successful response
        this.toastMessage.set('A new verification email has been sent.');
        this.toastState.set('success');
        this.hideToastAfterDelay();
    }, 500);
  }

  private hideToastAfterDelay() {
      setTimeout(() => this.toastState.set('hidden'), 5000);
  }
}