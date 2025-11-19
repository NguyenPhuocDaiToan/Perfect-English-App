
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserActivityService } from '../../../services/user-activity.service';
import { UserActivity } from '../../../models/user-activity.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent, SelectComponent, DatePipe],
  templateUrl: './activity-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityLogComponent {
  private activityService = inject(UserActivityService);

  // Data
  activities = signal<UserActivity[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(15);
  totalPages = signal(0);
  totalResults = signal(0);

  // Filters
  actionOptions: UserActivity['action'][] = ['Login', 'Register', 'View Content', 'Update Profile', 'Complete Exercise', 'Purchase'];
  statusOptions: UserActivity['status'][] = ['Success', 'Failed', 'Warning'];

  actionOptionsForSelect = computed(() => [{ value: 'All', label: 'All Actions' }, ...this.actionOptions.map(o => ({ value: o, label: o }))]);
  statusOptionsForSelect = computed(() => [{ value: 'All', label: 'All Statuses' }, ...this.statusOptions.map(o => ({ value: o, label: o }))]);

  searchTerm = signal('');
  filterActionControl = new FormControl('All');
  filterStatusControl = new FormControl('All');

  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.activities().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const action = this.filterActionControl.value ?? 'All';
      const status = this.filterStatusControl.value ?? 'All';
      untracked(() => this.fetchActivities(page, { searchTerm: term, action, status }));
    });
  }

  private fetchActivities(page: number, filters: { searchTerm: string, action: string, status: string }) {
    this.status.set('loading');
    this.activityService.getPaginatedActivities(page, this.pageSize(), filters).subscribe({
      next: response => {
        this.activities.set(response.results);
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
}
