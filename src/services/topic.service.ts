import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Topic } from '../models/topic.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/topics`;

  getPaginatedTopics(page: number, limit: number, filters: { category: string | 'All' }): Observable<PaginatedResponse<Topic>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('status', 'Published');

    if (filters.category && filters.category !== 'All') {
      params = params.set('category', filters.category);
    }

    return this.http.get<PaginatedResponse<Topic>>(`${environment.apiUrl}/public/topics`, { params });
  }

  getPaginatedAdminTopics(
    page: number,
    limit: number,
    filters: { searchTerm: string, category: string, status: string }
  ): Observable<PaginatedResponse<Topic>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.category && filters.category !== 'All') {
      params = params.set('category', filters.category);
    }
    if (filters.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<Topic>>(this.API_URL, { params });
  }

  getAllTopicsForSelect(): Observable<Topic[]> {
    // Simulate "get all" for dropdowns by fetching a large page
    return this.getPaginatedAdminTopics(1, 100, { searchTerm: '', category: 'All', status: 'All' }).pipe(
      map(response => response.results)
    );
  }

  getPublicTopics(): Observable<Topic[]> {
    return this.http.get<PaginatedResponse<Topic>>(`${environment.apiUrl}/public/topics?limit=100&status=Published`).pipe(
      map(response => response.results)
    );
  }

  getTopic(id: string): Observable<Topic> {
    return this.http.get<Topic>(`${environment.apiUrl}/public/topics/${id}`);
  }

  addTopic(topic: Omit<Topic, 'id'>): Observable<Topic> {
    return this.http.post<Topic>(this.API_URL, topic);
  }

  updateTopic(updatedTopic: Topic): Observable<Topic> {
    const { id, ...data } = updatedTopic;
    return this.http.patch<Topic>(`${this.API_URL}/${id}`, data);
  }

  deleteTopic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}