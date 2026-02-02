
import { Injectable, signal, computed, inject } from '@angular/core';
import { ExerciseService } from './exercise.service';
import { TopicService } from './topic.service';
import { Exercise } from '../models/exercise.model';

export interface UserExerciseProgress {
  exerciseId: number;
  status: 'In Progress' | 'Completed';
  progressPercent?: number; // For 'In Progress'
  bestScore?: number; // For 'Completed'
  lastPlayedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  private exerciseService = inject(ExerciseService);
  private topicService = inject(TopicService);

  private progress = signal<UserExerciseProgress[]>([
    { exerciseId: 1, status: 'Completed', bestScore: 95, lastPlayedAt: new Date('2023-10-05') },
    { exerciseId: 2, status: 'In Progress', progressPercent: 40, lastPlayedAt: new Date('2023-10-12') },
    { exerciseId: 4, status: 'Completed', bestScore: 60, lastPlayedAt: new Date('2023-10-15') }, // Low score for weakness analysis
    { exerciseId: 6, status: 'In Progress', progressPercent: 75, lastPlayedAt: new Date('2023-10-18') },
    { exerciseId: 7, status: 'Completed', bestScore: 100, lastPlayedAt: new Date('2023-10-20') },
  ]);

  getUserProgress() {
    return this.progress;
  }

  saveProgress(exerciseId: number, score: number) {
    this.progress.update(p => {
      const existingIndex = p.findIndex(item => item.exerciseId === exerciseId);
      const newItem: UserExerciseProgress = {
        exerciseId,
        status: 'Completed',
        bestScore: existingIndex > -1 ? Math.max(p[existingIndex].bestScore || 0, score) : score,
        lastPlayedAt: new Date()
      };

      if (existingIndex > -1) {
        const newProgress = [...p];
        newProgress[existingIndex] = newItem;
        return newProgress;
      } else {
        return [...p, newItem];
      }
    });
  }

  getStats() {
      return computed(() => {
          const prog = this.progress();
          const completed = prog.filter(p => p.status === 'Completed');
          const avgScore = completed.length > 0 
              ? completed.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / completed.length 
              : 0;
          
          // Dynamic Mastery Calculation
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

          const allExercises = this.exerciseService.getExercises()();
          const allTopics = this.topicService.getTopics()();
          const topicMap = new Map(allTopics.map(t => [t.id, t.category]));
          // Explicitly type the Map to prevent 'unknown' or mixed type inference errors
          const exerciseMap = new Map<number, Exercise>(allExercises.map(e => [e.id, e]));

          completed.forEach(p => {
              const exercise = exerciseMap.get(p.exerciseId);
              if (exercise && exercise.topicIds) {
                  exercise.topicIds.forEach(tid => {
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
              totalExercises: prog.length,
              completedExercises: completed.length,
              averageScore: Math.round(avgScore),
              mastery
          };
      });
  }

  getWeakAreas() {
      return computed(() => {
          // Find completed exercises with scores < 70%
          const weakExercises = this.progress()
            .filter(p => p.status === 'Completed' && (p.bestScore || 0) < 70);
          
          const exerciseMap = new Map<number, Exercise>(
            this.exerciseService.getExercises()().map(e => [e.id, e])
          );
          
          return weakExercises.map(p => {
              const ex = exerciseMap.get(p.exerciseId);
              return {
                  exerciseTitle: ex?.title || 'Unknown Exercise',
                  score: p.bestScore,
                  exerciseId: p.exerciseId
              };
          });
      });
  }
}
