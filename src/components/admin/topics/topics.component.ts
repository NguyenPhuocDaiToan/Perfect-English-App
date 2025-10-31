import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TopicService } from '../../../services/topic.service';
import { LessonService } from '../../../services/lesson.service';
import { ExerciseService } from '../../../services/exercise.service';
import { Topic } from '../../../models/topic.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, ReactiveFormsModule, SelectComponent],
  templateUrl: './topics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsComponent {
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);
  private exerciseService = inject(ExerciseService);

  // Component State
  topics = signal<Topic[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalResults = signal(0);

  // Filter options
  categoryOptions: Array<Topic['category']> = ['Grammar', 'Vocabulary', 'Skills', 'Writing', 'Speaking'];
  statusOptions: Array<Topic['status']> = ['Draft', 'Published'];
  
  // Computed options for SelectComponent
  categoryOptionsForSelect = computed(() => [{ value: 'All', label: 'All Categories' }, ...this.categoryOptions.map(o => ({ value: o, label: o }))]);
  statusOptionsForSelect = computed(() => [{ value: 'All', label: 'All Statuses' }, ...this.statusOptions.map(o => ({ value: o, label: o }))]);

  // Filter state
  searchTerm = signal('');
  filterCategoryControl = new FormControl('All');
  filterStatusControl = new FormControl('All');

  // Data sources
  private allLessons = this.lessonService.getLessons();
  private allExercises = this.exerciseService.getExercises();

  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.topics().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const category = this.filterCategoryControl.value ?? 'All';
      const status = this.filterStatusControl.value ?? 'All';
      untracked(() => this.fetchTopics(page, { searchTerm: term, category, status }));
    }, { allowSignalWrites: true });
  }

  private fetchTopics(page: number, filters: { searchTerm: string, category: string, status: string }) {
    this.status.set('loading');
    this.topicService.getPaginatedAdminTopics(page, this.pageSize(), filters).subscribe({
      next: response => {
        this.topics.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.currentPage.set(response.page);
        this.status.set('loaded');
      },
      error: () => this.status.set('error')
    });
  }

  onSearchTermChange(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
  }

  getLessonCount = (topicId: number) => computed(() => this.allLessons().filter(l => l.topicIds.includes(topicId)).length);
  getExerciseCount = (topicId: number) => computed(() => this.allExercises().filter(e => e.topicIds?.includes(topicId)).length);

  deleteTopic(id: number) {
    if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
        this.topicService.deleteTopic(id).subscribe(() => {
          if (this.topics().length === 1 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
          } else {
            this.fetchTopics(this.currentPage(), { searchTerm: this.searchTerm(), category: this.filterCategoryControl.value ?? 'All', status: this.filterStatusControl.value ?? 'All' });
          }
        });
    }
  }
}
