import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

type RegisterState = 'idle' | 'loading' | 'success' | 'error';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm: FormGroup;
  registerState = signal<RegisterState>('idle');
  errorMessage = signal('');

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], // Updated minLength to 8 to match backend standard
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    }, { validators: passwordMatchValidator });
  }

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.registerState.set('loading');
    this.errorMessage.set('');

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: (result) => {
        if (result.success) {
          this.registerState.set('success');
          // Backend logs in automatically, but maybe we want to show verify email page
          // Backend sends verification email. 
          // Previous logic redirected to verify-email. 
          setTimeout(() => this.router.navigate(['/verify-email']), 1000);
        } else {
          this.registerState.set('error');
          this.errorMessage.set(result.message || 'Registration failed. Please try again.');
        }
      },
      error: () => {
        this.registerState.set('error');
        this.errorMessage.set('Network error or server unreachable.');
      }
    });
  }
}