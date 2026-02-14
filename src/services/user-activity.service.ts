
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserActivity } from '../models/user-activity.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';

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

    return this.http.get<PaginatedResponse<UserActivity>>(this.API_URL, { params });
  }

  logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Observable<UserActivity> {
    return this.http.post<UserActivity>(this.API_URL, activity);
  }
}
