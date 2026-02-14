import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Lesson } from '../models/lesson.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/lessons`;

  getAllLessonsForSelect(): Observable<Lesson[]> {
    return this.getPaginatedLessons(1, 100, { searchTerm: '', topic: 'All', level: 'All', status: 'All' }).pipe(
      map(response => response.results)
    );
  }

  getPublicLessons(): Observable<Lesson[]> {
    return this.http.get<PaginatedResponse<Lesson>>(`${environment.apiUrl}/public/lessons?limit=100`).pipe(
      map(response => response.results)
    );
  }

  getPaginatedLessons(
    page: number,
    limit: number,
    filters: { searchTerm: string, topic: string, level: string, status: string }
  ): Observable<PaginatedResponse<Lesson>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('populate', 'topics;exercise');

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.topic && filters.topic !== 'All') {
      params = params.set('topic', filters.topic);
    }
    if (filters.level && filters.level !== 'All') {
      params = params.set('level', filters.level);
    }
    if (filters.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<Lesson>>(this.API_URL, { params });
  }

  getLesson(id: string): Observable<Lesson> {
    return this.http.get<Lesson>(`${environment.apiUrl}/public/lessons/${id}`);
  }

  addLesson(lesson: Omit<Lesson, 'id'>): Observable<Lesson> {
    return this.http.post<Lesson>(this.API_URL, lesson);
  }

  updateLesson(updatedLesson: Lesson): Observable<Lesson> {
    const { id, ...data } = updatedLesson;
    return this.http.patch<Lesson>(`${this.API_URL}/${id}`, data);
  }

  deleteLesson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
