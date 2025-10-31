import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Lesson } from '../models/lesson.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private lessons = signal<Lesson[]>([
    { id: 1, title: 'Present Simple Tense', level: 'A1', status: 'Published', topicId: 1, content: 'The present simple is a verb tense with two main uses...', exerciseId: 1 },
    { id: 2, title: 'Past Continuous Tense', level: 'A2', status: 'Published', topicId: 1, content: 'We use the past continuous to talk about actions in progress in the past.' },
    { id: 3, title: 'First Conditional', level: 'B1', status: 'Published', topicId: 2, content: 'The first conditional is used for possible future events.', exerciseId: 2 },
    { id: 4, title: 'Reported Speech', level: 'B2', status: 'Draft', topicId: 8, content: 'Reported speech is how we represent the speech of other people.' },
    { id: 5, title: 'Passive Voice Advanced', level: 'C1', status: 'Published', topicId: 4, content: 'The passive voice is used when the focus is on the action.' },
    { id: 6, title: 'How to Write a Formal Email', level: 'B2', status: 'Published', topicId: 5, content: 'Learn the structure and phrases for professional emails.' },
    { id: 7, title: 'The "th" Sound', level: 'A2', status: 'Published', topicId: 6, content: 'Practice the voiced and unvoiced "th" sounds.' },
    { id: 8, title: 'Present Perfect Tense', level: 'B1', status: 'Published', topicId: 1, content: 'The present perfect connects the past with the present.'},
    { id: 9, title: 'Writing a Cover Letter', level: 'C1', status: 'Published', topicId: 9, content: 'Structure and tips for writing an effective cover letter.'},
    { id: 10, title: 'At the Airport', level: 'A1', status: 'Published', topicId: 3, content: 'Key vocabulary for navigating the airport.'},
  ]);

  private nextId = signal(11);

  getLessons() {
    return computed(() => this.lessons());
  }

  getPaginatedLessons(
    page: number, 
    limit: number, 
    filters: { searchTerm: string, topicId: string, level: string, status: string }
  ): Observable<PaginatedResponse<Lesson>> {
    
    const allLessons = this.lessons();

    const filtered = allLessons.filter(lesson => {
      const termMatch = filters.searchTerm 
        ? lesson.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
        : true;
      const topicMatch = filters.topicId === 'All' ? true : lesson.topicId === Number(filters.topicId);
      const levelMatch = filters.level === 'All' ? true : lesson.level === filters.level;
      const statusMatch = filters.status === 'All' ? true : lesson.status === filters.status;
      return termMatch && topicMatch && levelMatch && statusMatch;
    });

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    const response: PaginatedResponse<Lesson> = {
      results,
      page,
      limit,
      totalPages,
      totalResults
    };
    
    return of(response).pipe(delay(300));
  }
  
  getLesson(id: number) {
    return computed(() => this.lessons().find(l => l.id === id));
  }

  addLesson(lesson: Omit<Lesson, 'id'>): Observable<Lesson> {
    const newLesson: Lesson = { ...lesson, id: this.nextId() };
    this.lessons.update(lessons => [...lessons, newLesson]);
    this.nextId.update(id => id + 1);
    return of(newLesson).pipe(delay(500)); // Simulate network latency
  }

  updateLesson(updatedLesson: Lesson): Observable<Lesson> {
    this.lessons.update(lessons => 
      lessons.map(lesson => lesson.id === updatedLesson.id ? updatedLesson : lesson)
    );
    return of(updatedLesson).pipe(delay(500));
  }

  deleteLesson(id: number): Observable<{}> {
    this.lessons.update(lessons => lessons.filter(lesson => lesson.id !== id));
    return of({}).pipe(delay(500));
  }
}