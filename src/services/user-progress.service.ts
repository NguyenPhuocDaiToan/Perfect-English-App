import { Injectable, signal } from '@angular/core';

export interface UserExerciseProgress {
  exerciseId: number;
  status: 'In Progress' | 'Completed';
  progressPercent?: number; // For 'In Progress'
  bestScore?: number; // For 'Completed'
}

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  private progress = signal<UserExerciseProgress[]>([
    { exerciseId: 1, status: 'Completed', bestScore: 95 },
    { exerciseId: 2, status: 'In Progress', progressPercent: 40 },
    { exerciseId: 4, status: 'Completed', bestScore: 80 },
    { exerciseId: 6, status: 'In Progress', progressPercent: 75 },
  ]);

  getUserProgress() {
    return this.progress;
  }
}
