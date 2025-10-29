import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';
import { TopicService } from '../../services/topic.service';
import { UserProgressService } from '../../services/user-progress.service';
import { Exercise } from '../../models/exercise.model';

interface DisplayExercise extends Exercise {
  topicTitle: string;
  topicCategory: string;
  progressStatus: 'Not Started' | 'In Progress' | 'Completed';
  progressPercent: number;
  bestScore?: number;
}

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
    private exerciseService = inject(ExerciseService);
    private topicService = inject(TopicService);
    private userProgressService = inject(UserProgressService);

    // Filter signals
    searchTerm = signal('');
    selectedTopic = signal<string>('All'); // by topicId as string
    selectedDifficulty = signal<string>('All'); // 'All', 'Easy', 'Medium', 'Hard'

    // All data signals
    private topics = this.topicService.getTopics();
    private exercises = this.exerciseService.getExercises();
    private userProgress = this.userProgressService.getUserProgress();

    // Topic map for quick lookup
    private topicsMap = computed(() => new Map(this.topics().map(t => [t.id, t])));

    // Progress map for quick lookup
    private progressMap = computed(() => new Map(this.userProgress().map(p => [p.exerciseId, p])));
    
    // Computed signal for all exercises combined with topic and progress info
    private combinedExercises = computed<DisplayExercise[]>(() => {
      const topicsMap = this.topicsMap();
      const progressMap = this.progressMap();
      return this.exercises()
        .filter(ex => ex.status === 'Published')
        .map(exercise => {
          const topic = topicsMap.get(exercise.topicId!);
          const progress = progressMap.get(exercise.id);

          let progressStatus: DisplayExercise['progressStatus'] = 'Not Started';
          let progressPercent = 0;
          let bestScore: number | undefined;

          if (progress) {
            if (progress.status === 'Completed') {
              progressStatus = 'Completed';
              progressPercent = 100;
              bestScore = progress.bestScore;
            } else if (progress.status === 'In Progress') {
              progressStatus = 'In Progress';
              progressPercent = progress.progressPercent || 0;
            }
          }

          return {
            ...exercise,
            topicTitle: topic?.title || 'Uncategorized',
            topicCategory: topic?.category || 'General',
            progressStatus,
            progressPercent,
            bestScore
          };
        });
    });

    // Final filtered list for the template
    filteredExercises = computed(() => {
      const term = this.searchTerm().toLowerCase();
      const topicId = this.selectedTopic();
      const difficulty = this.selectedDifficulty();
      
      return this.combinedExercises().filter(ex => {
        const termMatch = term ? ex.title.toLowerCase().includes(term) || ex.topicTitle.toLowerCase().includes(term) : true;
        const topicMatch = topicId === 'All' ? true : ex.topicId === Number(topicId);
        const difficultyMatch = difficulty === 'All' ? true : ex.difficulty === difficulty;
        return termMatch && topicMatch && difficultyMatch;
      });
    });
    
    public availableTopics = computed(() => {
        const uniqueTopicIds = new Set(this.exercises().map(e => e.topicId).filter((id): id is number => id !== undefined));
        return this.topics().filter(t => uniqueTopicIds.has(t.id));
    });

    public difficultyLevels: Exercise['difficulty'][] = ['Easy', 'Medium', 'Hard'];
}