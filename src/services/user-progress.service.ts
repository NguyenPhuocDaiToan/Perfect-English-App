import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExerciseService } from './exercise.service';
import { TopicService } from './topic.service';
import { Exercise } from '../models/exercise.model';
import { environment } from '../environments/environment';

export interface UserExerciseProgress {
  exercise: string;
  status: 'In Progress' | 'Completed';
  progressPercent?: number; // For 'In Progress'
  bestScore?: number; // For 'Completed'
  lastPlayedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  private http = inject(HttpClient);
  private exerciseService = inject(ExerciseService);
  private topicService = inject(TopicService);
  private readonly API_URL = `${environment.apiUrl}/user-progress`;

  getUserProgress(): Observable<UserExerciseProgress[]> {
    return this.http.get<UserExerciseProgress[]>(this.API_URL);
  }

  saveProgress(exercise: string, score: number): Observable<UserExerciseProgress> {
    const payload = { exercise, score };
    return this.http.post<UserExerciseProgress>(this.API_URL, payload);
  }

  getStats(): Observable<any> {
    return forkJoin({
      progress: this.getUserProgress(),
      exercises: this.exerciseService.getAllExercisesForSelect(),
      topics: this.topicService.getAllTopicsForSelect()
    }).pipe(
      map(({ progress, exercises, topics }) => {
        const completed = progress.filter(p => p.status === 'Completed');
        const avgScore = completed.length > 0
          ? completed.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / completed.length
          : 0;

        const mastery: { [key: string]: number } = {
          Grammar: 0,
          Vocabulary: 0,
          Skills: 0
        };

        const counts: { [key: string]: { total: number, scoreSum: number } } = {
          Grammar: { total: 0, scoreSum: 0 },
          Vocabulary: { total: 0, scoreSum: 0 },
          Skills: { total: 0, scoreSum: 0 }
        };

        const topicMap = new Map(topics.map(t => [t.id, t.category]));
        const exerciseMap = new Map<string, Exercise>(exercises.map(e => [e.id, e]));

        completed.forEach(p => {
          const exercise = exerciseMap.get(p.exercise);
          if (exercise && exercise.topics) {
            exercise.topics.forEach(tid => {
              const category = topicMap.get(tid);
              if (category && (category === 'Grammar' || category === 'Vocabulary' || category === 'Skills')) {
                counts[category].total++;
                counts[category].scoreSum += (p.bestScore || 0);
              }
            });
          }
        });

        Object.keys(counts).forEach(key => {
          if (counts[key].total > 0) {
            mastery[key] = Math.round(counts[key].scoreSum / counts[key].total);
          } else {
            mastery[key] = 0;
          }
        });

        return {
          totalExercises: progress.length,
          completedExercises: completed.length,
          averageScore: Math.round(avgScore),
          mastery
        };
      })
    );
  }

  getWeakAreas(): Observable<any[]> {
    return forkJoin({
      progress: this.getUserProgress(),
      exercises: this.exerciseService.getAllExercisesForSelect()
    }).pipe(
      map(({ progress, exercises }) => {
        const weakExercises = progress
          .filter(p => p.status === 'Completed' && (p.bestScore || 0) < 70);

        const exerciseMap = new Map<string, Exercise>(exercises.map(e => [e.id, e]));

        return weakExercises.map(p => {
          const ex = exerciseMap.get(p.exercise);
          return {
            exerciseTitle: ex?.title || 'Unknown Exercise',
            score: p.bestScore,
            exercise: p.exercise
          };
        });
      })
    );
  }
}
