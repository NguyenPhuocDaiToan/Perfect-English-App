
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { UserActivityService } from './user-activity.service';

export type AuthResult = {
  success: boolean;
  message?: string;
  reason?: 'invalid-credentials' | 'pending-verification' | 'email-exists' | 'server-error';
}

interface AuthResponse {
  user: User;
  tokens: {
    access: { token: string, expires: string };
    refresh: { token: string, expires: string };
  };
  permissions?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private activityService = inject(UserActivityService);

  private readonly AUTH_KEY = 'currentUser';
  private readonly LOGOUT_URL = `${environment.apiUrl}/auth/logout`;
  private readonly LOGIN_URL = `${environment.apiUrl}/auth/login`;
  private readonly REGISTER_URL = `${environment.apiUrl}/auth/register`;

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
        try {
          const user: User = JSON.parse(storedUser);
          this.currentUser.set(user);
          this.isLoggedIn.set(true);

          // Fetch fresh user data from backend
          this.refreshUserProfile();
        } catch (e) {
          localStorage.removeItem(this.AUTH_KEY);
        }
      }
    }
  }

  refreshUserProfile() {
    this.http.get<any>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (res) => {
        if (res.user) {
          this.currentUser.set(res.user);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(res.user));
          }
        }
      },
      error: () => {
        // Silent fail or logout if token invalid
      }
    });
  }

  login(email: string, password: string): Observable<AuthResult> {
    return this.http.post<AuthResponse>(this.LOGIN_URL, { email, password }).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.logActivity(response.user, 'Login');
      }),
      map(() => ({ success: true })),
      catchError((error: HttpErrorResponse) => {
        let message = 'Login failed — please check your email and password.';
        let reason: AuthResult['reason'] = 'invalid-credentials';

        if (error.status === 401) {
          // specialized handling if needed
        }

        return of({ success: false, message, reason });
      })
    );
  }

  register(userData: any): Observable<AuthResult> {
    return this.http.post<AuthResponse>(this.REGISTER_URL, userData).pipe(
      tap(() => {
        this.emailForVerification.set(userData.email);
        // Log Registration Activity ? The user is not fully logged in yet usually, but we receive the user object
      }),
      map((response) => {
        // Backend returns user and tokens on register, meaning auto-login
        // BUT validation flow might require email verification first.
        // Based on provided backend code: verifyEmailToken is sent, but also tokens are returned.
        // So the user IS logged in. 
        this.handleAuthSuccess(response);
        this.logActivity(response.user, 'Register');
        return { success: true };
      }),
      catchError((error: HttpErrorResponse) => {
        let message = 'Registration failed. Please try again.';
        let reason: AuthResult['reason'] = 'server-error';

        if (error.status === 400 && error.error?.message?.includes('Email')) {
          message = 'An account with this email already exists.';
          reason = 'email-exists';
        }

        return of({ success: false, message, reason });
      })
    );
  }

  logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(this.LOGOUT_URL, { refreshToken }).subscribe();
    }

    this.clearLocalData();
    this.router.navigate(['/']);
  }

  private handleAuthSuccess(response: AuthResponse) {
    const { user, tokens } = response;
    this.currentUser.set(user);
    this.isLoggedIn.set(true);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
      localStorage.setItem('refreshToken', tokens.refresh.token); // Store refresh token for logout
    }
  }

  private clearLocalData() {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.AUTH_KEY);
      localStorage.removeItem('refreshToken');
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private logActivity(user: User, action: 'Login' | 'Register') {
    this.activityService.logActivity({
      userId: user.id || (user as any)._id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      action: action,
      target: 'Web App',
      status: 'Success'
    });
  }
}
