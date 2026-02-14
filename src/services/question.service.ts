import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Question, QuestionType } from '../models/question.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/questions`;

  getPaginatedQuestions(
    page: number,
    limit: number,
    filters: { searchTerm: string, topic: string, type: string, difficulty: string }
  ): Observable<PaginatedResponse<Question>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.topic && filters.topic !== 'All') {
      params = params.set('topic', filters.topic);
    }
    if (filters.type && filters.type !== 'All') {
      params = params.set('type', filters.type);
    }
    if (filters.difficulty && filters.difficulty !== 'All') {
      params = params.set('difficulty', filters.difficulty);
    }

    return this.http.get<PaginatedResponse<Question>>(this.API_URL, { params });
  }

  getAllQuestionsForSelect(): Observable<Question[]> {
    return this.getPaginatedQuestions(1, 100, { searchTerm: '', topic: 'All', type: 'All', difficulty: 'All' }).pipe(
      map(response => response.results)
    );
  }

  getQuestionByIds(ids: string[]): Observable<Question[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<Question[]>(`${this.API_URL}/batch`, { params });
  }

  addQuestion(question: Omit<Question, 'id'>): Observable<Question> {
    return this.http.post<Question>(this.API_URL, question);
  }

  updateQuestion(updatedQuestion: Question): Observable<Question> {
    const { id, ...data } = updatedQuestion;
    return this.http.patch<Question>(`${this.API_URL}/${id}`, data);
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
