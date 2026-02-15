
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserActivity } from '../models/user-activity.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';
import { DEFAULT_AVATAR_URL } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/user-activities`;

  getPaginatedActivities(
    page: number,
    limit: number,
    filters: { searchTerm: string, action: string, status: string }
  ): Observable<PaginatedResponse<UserActivity>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.action && filters.action !== 'All') {
      params = params.set('action', filters.action);
    }
    if (filters.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<UserActivity>>(this.API_URL, { params }).pipe(
      map(response => ({
        ...response,
        results: response.results.map(activity => ({
          ...activity,
          userAvatar: activity.userAvatar || DEFAULT_AVATAR_URL
        }))
      }))
    );
  }

  logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Observable<UserActivity> {
    return this.http.post<UserActivity>(this.API_URL, activity);
  }
}
