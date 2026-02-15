import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';
import { BlogPost } from '../../models/blog-post.model';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { DEFAULT_AVATAR_URL } from '../../constants/app.constants';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogComponent {
  private blogService = inject(BlogService);
  private userService = inject(UserService);

  // Component State
  posts = signal<BlogPost[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(9);
  totalPages = signal(0);
  totalResults = signal(0);

  // Filtering State
  searchTerm = signal('');

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      untracked(() => this.fetchPosts(page, term));
    });
  }

  private fetchPosts(page: number, searchTerm: string) {
    this.status.set('loading');
    this.blogService.getPaginatedPosts(page, this.pageSize(), { searchTerm }).subscribe({
      next: response => {
        this.posts.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.status.set('loaded');
      },
      error: () => this.status.set('error')
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.currentPage.set(1); // Reset to first page on new search
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    // Scroll to top of the list
    document.querySelector('.post-grid')?.scrollIntoView({ behavior: 'smooth' });
  }

  getCreatorName(createdBy: any): string {
    return createdBy?.name || 'Unknown';
  }

  getCreatorAvatar(createdBy: any): string {
    return createdBy?.avatarUrl || DEFAULT_AVATAR_URL;
  }

  getTagColor(tag: string): string {
    switch (tag.toLowerCase()) {
      case 'grammar':
      case 'tenses':
      case 'conditionals':
        return 'bg-blue-100 text-blue-800';
      case 'vocabulary':
      case 'travel':
        return 'bg-green-100 text-green-800';
      case 'writing':
      case 'business':
        return 'bg-amber-100 text-amber-800';
      case 'speaking':
      case 'pronunciation':
        return 'bg-purple-100 text-purple-800';
      case 'tips':
      case 'skills':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
