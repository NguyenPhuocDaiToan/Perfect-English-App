import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercises = signal<Exercise[]>([
    { id: 1, title: 'Present Tense Review', description: 'A quick review of present simple and continuous.', topicId: 1, lessonId: 1, difficulty: 'Easy', timeLimit: 10, questionIds: [1, 4], status: 'Published' },
    { id: 2, title: 'Conditionals Introduction', description: 'Test your knowledge on the first and second conditional.', topicId: 2, lessonId: 3, difficulty: 'Medium', timeLimit: 15, questionIds: [3], status: 'Published' },
    { id: 3, title: 'Travel Vocabulary Test', description: 'Basic vocabulary for traveling.', topicId: 3, difficulty: 'Easy', timeLimit: 5, questionIds: [2], status: 'Published' },
    { id: 4, title: 'Passive Voice Practice', description: 'Form sentences using the passive voice in various tenses.', topicId: 4, difficulty: 'Medium', timeLimit: 15, questionIds: [1, 3], status: 'Published' },
    { id: 5, title: 'Advanced Verb Tenses', description: 'Challenge yourself with perfect and continuous forms.', topicId: 1, difficulty: 'Hard', timeLimit: 20, questionIds: [1, 3, 4], status: 'Published' },
    { id: 6, title: 'Formal Email Phrasing', description: 'Practice using appropriate language for business emails.', topicId: 5, difficulty: 'Medium', timeLimit: 10, questionIds: [2, 4], status: 'Published' },
    { id: 7, title: 'Pronunciation Quiz: TH Sounds', description: 'Distinguish between the voiced and voiceless "th" sounds.', topicId: 6, difficulty: 'Easy', timeLimit: 5, questionIds: [3], status: 'Published' },
    { id: 8, title: 'Phrasal Verbs Challenge', description: 'A challenging quiz on common phrasal verbs.', topicId: 7, difficulty: 'Hard', timeLimit: 15, questionIds: [1, 2, 4], status: 'Draft' },
  ]);
  
  private nextId = signal(9);

  getExercises() {
    return computed(() => this.exercises());
  }

  getExercise(id: number) {
    return computed(() => this.exercises().find(e => e.id === id));
  }

  addExercise(exercise: Omit<Exercise, 'id'>): Observable<Exercise> {
    const newExercise: Exercise = { ...exercise, id: this.nextId() };
    this.exercises.update(exercises => [...exercises, newExercise]);
    this.nextId.update(id => id + 1);
    return of(newExercise).pipe(delay(500));
  }

  updateExercise(updatedExercise: Exercise): Observable<Exercise> {
    this.exercises.update(exercises => 
      exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex)
    );
    return of(updatedExercise).pipe(delay(500));
  }

  deleteExercise(id: number): Observable<{}> {
    this.exercises.update(exercises => exercises.filter(ex => ex.id !== id));
    return of({}).pipe(delay(500));
  }
}