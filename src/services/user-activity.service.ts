
import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserActivity } from '../models/user-activity.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private activities = signal<UserActivity[]>([
    { id: 1, userId: 2, userName: 'Maria S.', userAvatar: 'https://picsum.photos/seed/user2/200', action: 'Complete Exercise', target: 'Present Simple Tense', timestamp: this.getDate(-10), status: 'Success' },
    { id: 2, userId: 4, userName: 'David P.', userAvatar: 'https://picsum.photos/seed/user4/200', action: 'Login', target: 'Web App', timestamp: this.getDate(-15), status: 'Success' },
    { id: 3, userId: 3, userName: 'Kenji T.', userAvatar: 'https://picsum.photos/seed/user3/200', action: 'Login', target: 'Web App', timestamp: this.getDate(-45), status: 'Failed', details: 'Incorrect password' },
    { id: 4, userId: 2, userName: 'Maria S.', userAvatar: 'https://picsum.photos/seed/user2/200', action: 'View Content', target: 'Advanced Verb Tenses', timestamp: this.getDate(-60), status: 'Success' },
    { id: 5, userId: 6, userName: 'Carlos Gomez', userAvatar: 'https://picsum.photos/seed/user6/200', action: 'Update Profile', target: 'Settings', timestamp: this.getDate(-120), status: 'Success' },
    { id: 6, userId: 1, userName: 'Admin User', userAvatar: 'https://picsum.photos/seed/user1/200', action: 'Login', target: 'Admin Panel', timestamp: this.getDate(-130), status: 'Success' },
    { id: 7, userId: 2, userName: 'Maria S.', userAvatar: 'https://picsum.photos/seed/user2/200', action: 'Purchase', target: 'Pro Membership', timestamp: this.getDate(-1400), status: 'Success' },
    { id: 8, userId: 7, userName: 'Free Student', userAvatar: 'https://picsum.photos/seed/user7/200', action: 'View Content', target: 'Premium Lesson: Passive Voice', timestamp: this.getDate(-20), status: 'Warning', details: 'Access denied (Paywall)' },
    { id: 9, userId: 4, userName: 'David P.', userAvatar: 'https://picsum.photos/seed/user4/200', action: 'View Content', target: 'Lesson: Conditionals', timestamp: this.getDate(-180), status: 'Success' },
    { id: 10, userId: 3, userName: 'Kenji T.', userAvatar: 'https://picsum.photos/seed/user3/200', action: 'Login', target: 'Web App', timestamp: this.getDate(-200), status: 'Success' },
    { id: 11, userId: 5, userName: 'Jane Doe', userAvatar: 'https://picsum.photos/seed/user5/200', action: 'Update Profile', target: 'Avatar', timestamp: this.getDate(-210), status: 'Success' },
    { id: 12, userId: 2, userName: 'Maria S.', userAvatar: 'https://picsum.photos/seed/user2/200', action: 'Login', target: 'Web App', timestamp: this.getDate(-300), status: 'Success' },
    { id: 13, userId: 6, userName: 'Carlos Gomez', userAvatar: 'https://picsum.photos/seed/user6/200', action: 'Complete Exercise', target: 'Business Idioms', timestamp: this.getDate(-320), status: 'Success' },
    { id: 14, userId: 4, userName: 'David P.', userAvatar: 'https://picsum.photos/seed/user4/200', action: 'Login', target: 'Web App', timestamp: this.getDate(-350), status: 'Success' },
    { id: 15, userId: 1, userName: 'Admin User', userAvatar: 'https://picsum.photos/seed/user1/200', action: 'Update Profile', target: 'Password', timestamp: this.getDate(-400), status: 'Success' },
  ]);

  private nextId = signal(16);

  // Helper to generate somewhat realistic past dates
  private getDate(minutesAgo: number): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() - Math.abs(minutesAgo));
    return date.toISOString();
  }

  getPaginatedActivities(
    page: number, 
    limit: number, 
    filters: { searchTerm: string, action: string, status: string }
  ): Observable<PaginatedResponse<UserActivity>> {
    
    const allActivities = this.activities().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filtered = allActivities.filter(act => {
      const term = filters.searchTerm.toLowerCase();
      const termMatch = filters.searchTerm 
        ? act.userName.toLowerCase().includes(term) || act.target.toLowerCase().includes(term) || (act.details && act.details.toLowerCase().includes(term))
        : true;
      const actionMatch = filters.action === 'All' ? true : act.action === filters.action;
      const statusMatch = filters.status === 'All' ? true : act.status === filters.status;
      return termMatch && actionMatch && statusMatch;
    });

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    const response: PaginatedResponse<UserActivity> = {
      results,
      page,
      limit,
      totalPages,
      totalResults
    };

    return of(response).pipe(delay(300));
  }

  logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>) {
    const newActivity: UserActivity = {
      ...activity,
      id: this.nextId(),
      timestamp: new Date().toISOString()
    };
    this.activities.update(current => [newActivity, ...current]);
    this.nextId.update(id => id + 1);
  }
}
