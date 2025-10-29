import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercises = signal<Exercise[]>([
    { id: 1, title: 'Present Simple - Fill in the blanks', topic: 'Verb Tenses', difficulty: 'Easy' },
    { id: 2, title: 'Conditionals - Multiple Choice', topic: 'Conditionals', difficulty: 'Medium' },
    { id: 3, title: 'Passive Voice - Sentence Transformation', topic: 'Passive Voice', difficulty: 'Hard' },
    { id: 4, title: 'Modal Verbs of Obligation', topic: 'Modal Verbs', difficulty: 'Medium' },
    { id: 5, 'title': 'Articles: a, an, the, or no article', topic: 'Articles', difficulty: 'Easy' },
  ]);
  
  private nextId = signal(6);

  getExercises() {
    return computed(() => this.exercises());
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