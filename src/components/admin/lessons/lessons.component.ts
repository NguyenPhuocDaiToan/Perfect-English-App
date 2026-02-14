
import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LessonService } from '../../../services/lesson.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { Lesson } from '../../../models/lesson.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';
import { CEFR_LEVELS, PUBLISH_STATUSES } from '../../../models/constants';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, ReactiveFormsModule, SelectComponent],
  templateUrl: './lessons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonsComponent {
  private lessonService = inject(LessonService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  // Component State
  lessons = signal<Lesson[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalResults = signal(0);

  // Filter options
  levelOptions = CEFR_LEVELS;
  statusOptions = PUBLISH_STATUSES;

  // Computed options for SelectComponent
  levelOptionsForSelect = computed(() => [{ value: 'All', label: 'All Levels' }, ...this.levelOptions.map(o => ({ value: o, label: o }))]);
  statusOptionsForSelect = computed(() => [{ value: 'All', label: 'All Statuses' }, ...this.statusOptions.map(o => ({ value: o, label: o }))]);


  // Filter state (now with FormControls)
  searchTerm = signal('');
  filterLevelControl = new FormControl('All');
  filterStatusControl = new FormControl('All');

  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.lessons().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const level = this.filterLevelControl.value ?? 'All';
      const status = this.filterStatusControl.value ?? 'All';
      untracked(() => this.fetchLessons(page, { searchTerm: term, level, status }));
    });
  }

  private fetchLessons(page: number, filters: { searchTerm: string, level: string, status: string }) {
    this.status.set('loading');
    // We pass 'All' for topic to satisfy the service signature which still expects it, or we update service. 
    // Let's assume we update the call to pass a hardcoded 'All' for topic if the service expects it in the object structure, 
    // OR better, let's look at the service call. 
    // The service takes `filters: { searchTerm: string, topic: string, level: string, status: string }`.
    // So we need to adapt the call or update the service. 
    // I will pass 'All' for topic here to avoid breaking the service if I don't update it yet, or update the object passed.
    this.lessonService.getPaginatedLessons(page, this.pageSize(), { ...filters, topic: 'All' }).subscribe({
      next: response => {
        this.lessons.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.currentPage.set(response.page);
        this.status.set('loaded');
      },
      error: () => {
        this.status.set('error');
        this.toastService.show('Failed to load lessons', 'error');
      }
    });
  }

  onSearchTermChange(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }
  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
  }

  getTopicNames(topics: (string | any)[]): string {
    if (!topics || topics.length === 0) return 'N/A';
    return topics
      .map(t => typeof t === 'object' ? t.title : t)
      .join(', ');
  }

  getExerciseName(exercise?: string | any): string {
    if (!exercise) return 'None';
    return typeof exercise === 'object' ? exercise.title : exercise;
  }

  async deleteLesson(id: string) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Lesson',
      message: 'Are you sure you want to delete this lesson? This action cannot be undone.',
      confirmText: 'Delete Lesson',
      type: 'danger'
    });

    if (confirmed) {
      this.lessonService.deleteLesson(id).subscribe({
        next: () => {
          this.toastService.show('Lesson deleted successfully', 'success');
          if (this.lessons().length === 1 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
          } else {
            this.fetchLessons(this.currentPage(), {
              searchTerm: this.searchTerm(),
              level: this.filterLevelControl.value ?? 'All',
              status: this.filterStatusControl.value ?? 'All'
            });
          }
        },
        error: () => this.toastService.show('Failed to delete lesson', 'error')
      });
    }
  }
}
