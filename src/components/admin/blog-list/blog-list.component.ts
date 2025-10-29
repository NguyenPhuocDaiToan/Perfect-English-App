import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { UserService } from '../../../services/user.service';
import { BlogPost } from '../../../models/blog-post.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private blogService = inject(BlogService);
  private userService = inject(UserService);

  // Data Sources
  private allPosts = this.blogService.getBlogPosts();
  allUsers = this.userService.getUsers();

  // Filter options
  statusOptions: BlogPost['status'][] = ['Published', 'Draft'];
  
  // Filter state
  searchTerm = signal('');
  filterAuthor = signal<string>('All');
  filterStatus = signal<string>('All');
  
  private usersMap = computed(() => {
    const map = new Map<number, string>();
    this.allUsers().forEach(user => map.set(user.id, user.name));
    return map;
  });

  filteredPosts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const authorId = this.filterAuthor();
    const status = this.filterStatus();

    return this.allPosts().filter(post => 
      (post.title.toLowerCase().includes(term)) &&
      (authorId === 'All' || post.authorId === Number(authorId)) &&
      (status === 'All' || post.status === status)
    );
  });

  getAuthorName(authorId: number): string {
    return this.usersMap().get(authorId) || 'Unknown';
  }

  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.blogService.deleteBlogPost(id).subscribe();
    }
  }
}