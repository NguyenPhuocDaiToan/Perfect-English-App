import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Lesson } from '../models/lesson.model';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private lessons = signal<Lesson[]>([
    { id: 1, title: 'Present Simple Tense', level: 'A1', status: 'Published' },
    { id: 2, title: 'Past Continuous Tense', level: 'A2', status: 'Published' },
    { id: 3, title: 'First Conditional', level: 'B1', status: 'Published' },
    { id: 4, title: 'Reported Speech', level: 'B2', status: 'Draft' },
    { id: 5, title: 'Passive Voice Advanced', level: 'C1', status: 'Published' },
  ]);

  private nextId = signal(6);

  getLessons() {
    return computed(() => this.lessons());
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