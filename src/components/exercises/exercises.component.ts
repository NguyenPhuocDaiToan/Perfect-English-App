import { toSignal } from '@angular/core/rxjs-interop';
import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';
import { TopicService } from '../../services/topic.service';
import { UserProgressService } from '../../services/user-progress.service';
import { Exercise } from '../../models/exercise.model';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { DIFFICULTY_LEVELS } from '../../models/constants';

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
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
  private exerciseService = inject(ExerciseService);
  private topicService = inject(TopicService);
  private userProgressService = inject(UserProgressService);

  // Component State
  exercises = signal<DisplayExercise[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(6);
  totalPages = signal(0);
  totalResults = signal(0);

  // Filter signals
  searchTerm = signal('');
  selectedTopic = signal<'All' | string>('All');
  selectedDifficulty = signal<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // All static data
  private allTopics = toSignal(this.topicService.getPublicTopics(), { initialValue: [] });
  private userProgress = toSignal(this.userProgressService.getUserProgress(), { initialValue: [] });
  private allExercises = toSignal(this.exerciseService.getPublicExercises(), { initialValue: [] });

  // Topic map for quick lookup
  private topicsMap = computed(() => new Map(this.allTopics().map(t => [t.id, t])));
  // Progress map for quick lookup
  private progressMap = computed(() => new Map(this.userProgress().map(p => [p.exercise, p])));

  public availableTopics = computed(() => {
    const uniqueTopics = new Set(this.allExercises().flatMap(e => e.topics || []).filter((id): id is string => id !== undefined));
    return this.allTopics().filter(t => uniqueTopics.has(t.id));
  });

  public difficultyLevels = DIFFICULTY_LEVELS;

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const topic = this.selectedTopic();
      const difficulty = this.selectedDifficulty();

      untracked(() => this.fetchExercises(page, { term, topic, difficulty }));
    });
  }

  private fetchExercises(page: number, filters: { term: string, topic: 'All' | string, difficulty: 'All' | 'Easy' | 'Medium' | 'Hard' }) {
    this.status.set('loading');
    this.exerciseService.getPaginatedExercises(page, this.pageSize(), {
      searchTerm: filters.term,
      topic: filters.topic,
      difficulty: filters.difficulty
    }).subscribe({
      next: response => {
        const displayExercises = this.combineWithProgress(response.results);
        this.exercises.set(displayExercises);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.status.set('loaded');
      },
      error: () => this.status.set('error')
    });
  }

  private combineWithProgress(exercises: Exercise[]): DisplayExercise[] {
    const topicsMap = this.topicsMap();
    const progressMap = this.progressMap();
    return exercises.map(exercise => {
      // Use the first topic if available, though strictly an exercise might belong to multiple or none
      const topicId = exercise.topics && exercise.topics.length > 0 ? exercise.topics[0] : undefined;
      const topic = topicId ? topicsMap.get(topicId) : undefined;
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
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onTopicChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedTopic.set(value === 'All' ? 'All' : value);
    this.currentPage.set(1);
  }

  onDifficultyChange(level: 'All' | 'Easy' | 'Medium' | 'Hard') {
    this.selectedDifficulty.set(level);
    this.currentPage.set(1);
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth' });
  }
}
