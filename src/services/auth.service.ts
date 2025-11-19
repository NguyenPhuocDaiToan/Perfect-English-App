
import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { UserActivityService } from './user-activity.service';
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
  private activityService = inject(UserActivityService);
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
      // Optionally log failed attempts if we had a way to identify the user attempting or just log as 'Unknown'
      return { success: false, message: 'Login failed — please check your email and password.', reason: 'invalid-credentials' };
    }

    if (user.status === 'Pending') {
      this.emailForVerification.set(user.email);
      return { success: false, message: 'Your account is not verified. Please check your email.', reason: 'pending-verification' };
    }

    // Streak Logic
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = user.lastLogin ? user.lastLogin.split('T')[0] : null;
    
    let newStreak = user.streak || 0;

    if (lastLogin === today) {
      // Already logged in today, do nothing to streak
    } else if (lastLogin) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastLogin === yesterdayStr) {
        newStreak++;
      } else {
        newStreak = 1; // Streak broken or first time
      }
    } else {
      newStreak = 1; // First login ever
    }

    const updatedUser = { 
      ...user, 
      lastLogin: new Date().toISOString(),
      streak: newStreak
    };

    this.currentUser.set(updatedUser);
    this.isLoggedIn.set(true);
    
    // Update the backend
    this.userService.updateUser(updatedUser).subscribe();
    
    // Log Activity
    this.activityService.logActivity({
        userId: updatedUser.id,
        userName: updatedUser.name,
        userAvatar: updatedUser.avatarUrl,
        action: 'Login',
        target: 'Web App',
        status: 'Success'
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(updatedUser));
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
        avatarUrl: `https://picsum.photos/seed/${userData.email}/200`,
        isPremium: false,
        streak: 0,
        xp: 0
    };

    this.userService.addUser(newUser).subscribe(user => {
         // Log Registration Activity
         this.activityService.logActivity({
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatarUrl,
            action: 'Register',
            target: 'Web App',
            status: 'Success'
        });
    });
    
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
