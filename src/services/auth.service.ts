import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { Router } from '@angular/router';

type AuthResult = {
  success: boolean;
  message?: string;
  reason?: 'invalid-credentials' | 'pending-verification' | 'email-exists';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userService = inject(UserService);
  private router = inject(Router);

  private readonly AUTH_KEY = 'currentUser';
  
  isLoggedIn = signal(false);
  currentUser = signal<User | null>(null);
  emailForVerification = signal<string | null>(null);

  constructor() {
    this.checkAuthStatus();
  }
  
  checkAuthStatus() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem(this.AUTH_KEY);
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      }
    }
  }

  login(email: string, password: string): AuthResult {
    const user = this.userService.getUsers()().find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Login failed — please check your email and password.', reason: 'invalid-credentials' };
    }

    if (user.status === 'Pending') {
      this.emailForVerification.set(user.email);
      return { success: false, message: 'Your account is not verified. Please check your email.', reason: 'pending-verification' };
    }

    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    }
    return { success: true };
  }

  register(userData: any): AuthResult {
    const emailExists = this.userService.getUsers()().some(u => u.email === userData.email);
    if (emailExists) {
        return { success: false, message: 'An account with this email already exists.', reason: 'email-exists' };
    }

    const newUser: Omit<User, 'id' | 'createdAt' | 'lastLogin'> = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'Student',
        status: 'Pending',
        avatarUrl: `https://picsum.photos/seed/${userData.email}/200`
    };

    this.userService.addUser(newUser).subscribe();
    this.emailForVerification.set(userData.email);
    return { success: true };
  }

  logout() {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
     if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.AUTH_KEY);
     }
    this.router.navigate(['/']);
  }
}