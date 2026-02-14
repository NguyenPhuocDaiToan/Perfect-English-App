
import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BlogService } from '../../../services/blog.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { BlogPost } from '../../../models/blog-post.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';
import { PUBLISH_STATUSES } from '../../../models/constants';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, ReactiveFormsModule, SelectComponent],
  templateUrl: './blog-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private blogService = inject(BlogService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  // Component State
  posts = signal<BlogPost[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalResults = signal(0);

  // Data Sources for filters
  allUsers = this.userService.getUsers();

  // Filter options
  statusOptions = PUBLISH_STATUSES;

  // Computed options for SelectComponent
  creatorOptions = computed(() => [{ value: 'All', label: 'All Creators' }, ...this.allUsers().map(u => ({ value: u.id.toString(), label: u.name }))]);
  statusOptionsForSelect = computed(() => [{ value: 'All', label: 'All Statuses' }, ...this.statusOptions.map(o => ({ value: o, label: o }))]);

  // Filter state
  searchTerm = signal('');
  filterCreatorControl = new FormControl('All');
  filterStatusControl = new FormControl('All');

  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.posts().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const createdBy = this.filterCreatorControl.value ?? 'All';
      const status = this.filterStatusControl.value ?? 'All';
      untracked(() => this.fetchPosts(page, { searchTerm: term, createdBy, status }));
    });
  }

  private fetchPosts(page: number, filters: { searchTerm: string, createdBy: string, status: string }) {
    this.status.set('loading');
    this.blogService.getPaginatedAdminPosts(page, this.pageSize(), filters).subscribe({
      next: response => {
        this.posts.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.currentPage.set(response.page);
        this.status.set('loaded');
      },
      error: () => {
        this.status.set('error');
        this.toastService.show('Failed to load blog posts', 'error');
      }
    });
  }

  onSearchTermChange(term: string) { this.searchTerm.set(term); this.currentPage.set(1); }
  onPageChange(newPage: number) { this.currentPage.set(newPage); }
  getCreatorName(createdBy: any): string {
    return createdBy?.name || 'Unknown';
  }

  async deletePost(id: string) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      confirmText: 'Delete Post',
      type: 'danger'
    });

    if (confirmed) {
      this.blogService.deleteBlogPost(id).subscribe({
        next: () => {
          this.toastService.show('Post deleted successfully', 'success');
          if (this.posts().length === 1 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
          } else {
            this.fetchPosts(this.currentPage(), {
              searchTerm: this.searchTerm(),
              createdBy: this.filterCreatorControl.value ?? 'All',
              status: this.filterStatusControl.value ?? 'All'
            });
          }
        },
        error: () => this.toastService.show('Failed to delete post', 'error')
      });
    }
  }
}
