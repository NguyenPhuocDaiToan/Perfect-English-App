import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

type LoginState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup;
  loginState = signal<LoginState>('idle');
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Redirect if already logged in
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.redirectToDashboard();
      }
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loginState.set('loading');
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;
    
    // Simulate network delay
    setTimeout(() => {
      const result = this.authService.login(email, password);

      if (result.success) {
        this.loginState.set('success');
        setTimeout(() => this.redirectToDashboard(), 800);
      } else {
        this.loginState.set('error');
        this.errorMessage.set(result.message || 'An unknown error occurred.');
        // If account is pending verification, redirect to the verify page
        if (result.reason === 'pending-verification') {
            setTimeout(() => this.router.navigate(['/verify-email']), 1000);
        }
      }
    }, 500);
  }

  private redirectToDashboard() {
    const user = this.authService.currentUser();
    if (user?.role === 'Admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}