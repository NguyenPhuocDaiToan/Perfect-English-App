
import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ExerciseService } from '../../../services/exercise.service';
import { LessonService } from '../../../services/lesson.service';
import { TopicService } from '../../../services/topic.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { Exercise } from '../../../models/exercise.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';
import { DIFFICULTY_LEVELS, PUBLISH_STATUSES } from '../../../models/constants';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, ReactiveFormsModule, SelectComponent],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
  private exerciseService = inject(ExerciseService);
  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

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
  difficultyOptions = DIFFICULTY_LEVELS;
  statusOptions = PUBLISH_STATUSES;
  
  // Computed options for SelectComponent
  topicOptions = computed(() => [{ value: 'All', label: 'All Topics' }, ...this.allTopics().map(t => ({ value: t.id.toString(), label: t.title }))]);
  difficultyOptionsForSelect = computed(() => [{ value: 'All', label: 'All Difficulties' }, ...this.difficultyOptions.map(o => ({ value: o, label: o }))]);
  statusOptionsForSelect = computed(() => [{ value: 'All', label: 'All Statuses' }, ...this.statusOptions.map(o => ({ value: o, label: o }))]);

  // Filter state
  searchTerm = signal('');
  filterTopicControl = new FormControl('All');
  filterDifficultyControl = new FormControl('All');
  filterStatusControl = new FormControl('All');

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
      const topicId = this.filterTopicControl.value ?? 'All';
      const difficulty = this.filterDifficultyControl.value ?? 'All';
      const status = this.filterStatusControl.value ?? 'All';
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
      error: () => {
        this.status.set('error');
        this.toastService.show('Failed to load exercises', 'error');
      }
    });
  }
  
  onSearchTermChange(term: string) { this.searchTerm.set(term); this.currentPage.set(1); }
  onPageChange(newPage: number) { this.currentPage.set(newPage); }

  private lessonsMap = computed(() => {
    const map = new Map<number, string>();
    this.lessonService.getLessons()().forEach(l => map.set(l.id, l.title));
    return map;
  });

  private topicsMap = computed(() => {
    const map = new Map<number, string>();
    this.allTopics().forEach(t => map.set(t.id, t.title));
    return map;
  });

  getLessonNames(lessonIds?: number[]): string {
    if (!lessonIds || lessonIds.length === 0) return 'None';
    return lessonIds
        .map(id => this.lessonsMap().get(id) || '')
        .filter(name => name)
        .join(', ');
  }

  getTopicNames(topicIds?: number[]): string {
    if (!topicIds || topicIds.length === 0) return 'None';
    return topicIds
        .map(id => this.topicsMap().get(id) || '')
        .filter(name => name)
        .join(', ');
  }

  async deleteExercise(id: number) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Exercise',
      message: 'Are you sure you want to delete this exercise? This action cannot be undone.',
      confirmText: 'Delete Exercise',
      type: 'danger'
    });

    if (confirmed) {
      this.exerciseService.deleteExercise(id).subscribe({
        next: () => {
          this.toastService.show('Exercise deleted successfully', 'success');
          if (this.exercises().length === 1 && this.currentPage() > 1) {
              this.currentPage.update(p => p - 1);
          } else {
              this.fetchExercises(this.currentPage(), { 
                  searchTerm: this.searchTerm(), 
                  topicId: this.filterTopicControl.value ?? 'All', 
                  difficulty: this.filterDifficultyControl.value ?? 'All', 
                  status: this.filterStatusControl.value ?? 'All'
              });
          }
        },
        error: () => this.toastService.show('Failed to delete exercise', 'error')
      });
    }
  }
}
