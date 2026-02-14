import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Exercise } from '../models/exercise.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/exercises`;

  getPaginatedExercises(
    page: number,
    limit: number,
    filters: { searchTerm?: string, topic: string | 'All', difficulty?: string | 'All' }
  ): Observable<PaginatedResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('status', 'Published');

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.topic && filters.topic !== 'All') {
      params = params.set('topic', filters.topic);
    }
    if (filters.difficulty && filters.difficulty !== 'All') {
      params = params.set('difficulty', filters.difficulty);
    }

    return this.http.get<PaginatedResponse<Exercise>>(`${environment.apiUrl}/public/exercises`, { params });
  }

  getPaginatedAdminExercises(
    page: number,
    limit: number,
    filters: { searchTerm: string, topic: string, difficulty: string, status: string }
  ): Observable<PaginatedResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.topic && filters.topic !== 'All') {
      params = params.set('topic', filters.topic);
    }
    if (filters.difficulty && filters.difficulty !== 'All') {
      params = params.set('difficulty', filters.difficulty);
    }
    if (filters.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<Exercise>>(this.API_URL, { params });
  }

  getAllExercisesForSelect(): Observable<Exercise[]> {
    return this.getPaginatedAdminExercises(1, 100, { searchTerm: '', topic: 'All', difficulty: 'All', status: 'All' }).pipe(
      map(response => response.results)
    );
  }

  getPublicExercises(): Observable<Exercise[]> {
    return this.http.get<PaginatedResponse<Exercise>>(`${environment.apiUrl}/public/exercises?limit=100&status=Published`).pipe(
      map(response => response.results)
    );
  }

  getExercise(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${environment.apiUrl}/public/exercises/${id}`);
  }

  addExercise(exercise: Omit<Exercise, 'id'>): Observable<Exercise> {
    return this.http.post<Exercise>(this.API_URL, exercise);
  }

  updateExercise(updatedExercise: Exercise): Observable<Exercise> {
    const { id, ...data } = updatedExercise;
    return this.http.patch<Exercise>(`${this.API_URL}/${id}`, data);
  }

  deleteExercise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
