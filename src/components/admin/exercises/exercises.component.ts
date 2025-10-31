import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../../services/exercise.service';
import { LessonService } from '../../../services/lesson.service';
import { TopicService } from '../../../services/topic.service';
import { Exercise } from '../../../models/exercise.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
  private exerciseService = inject(ExerciseService);
  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);

  // Component State
  exercises = signal<Exercise[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalResults = signal(0);

  // Data sources
  allTopics = this.topicService.getTopics();
  
  // Filter options
  difficultyOptions: Exercise['difficulty'][] = ['Easy', 'Medium', 'Hard'];
  statusOptions: Exercise['status'][] = ['Published', 'Draft'];
  
  // Filter state
  searchTerm = signal('');
  filterTopic = signal<string>('All');
  filterDifficulty = signal<string>('All');
  filterStatus = signal<string>('All');

  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.exercises().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const topicId = this.filterTopic();
      const difficulty = this.filterDifficulty();
      const status = this.filterStatus();
      untracked(() => this.fetchExercises(page, { searchTerm: term, topicId, difficulty, status }));
    });
  }

  private fetchExercises(page: number, filters: { searchTerm: string, topicId: string, difficulty: string, status: string }) {
    this.status.set('loading');
    this.exerciseService.getPaginatedAdminExercises(page, this.pageSize(), filters).subscribe({
      next: response => {
        this.exercises.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.currentPage.set(response.page);
        this.status.set('loaded');
      },
      error: () => this.status.set('error')
    });
  }
  
  onSearchTermChange(term: string) { this.searchTerm.set(term); this.currentPage.set(1); }
  onTopicChange(topicId: string) { this.filterTopic.set(topicId); this.currentPage.set(1); }
  onDifficultyChange(difficulty: string) { this.filterDifficulty.set(difficulty); this.currentPage.set(1); }
  onStatusChange(status: string) { this.filterStatus.set(status); this.currentPage.set(1); }
  onPageChange(newPage: number) { this.currentPage.set(newPage); }

  private lessonsMap = computed(() => {
    const map = new Map<number, string>();
    this.lessonService.getLessons()().forEach(l => map.set(l.id, l.title));
    return map;
  });

  getLessonName(lessonId?: number): string {
    return lessonId ? this.lessonsMap().get(lessonId) || 'N/A' : 'None';
  }

  deleteExercise(id: number) {
    if (confirm('Are you sure you want to delete this exercise?')) {
      this.exerciseService.deleteExercise(id).subscribe(() => {
        if (this.exercises().length === 1 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        } else {
            this.fetchExercises(this.currentPage(), { 
                searchTerm: this.searchTerm(), 
                topicId: this.filterTopic(), 
                difficulty: this.filterDifficulty(), 
                status: this.filterStatus() 
            });
        }
      });
    }
  }
}