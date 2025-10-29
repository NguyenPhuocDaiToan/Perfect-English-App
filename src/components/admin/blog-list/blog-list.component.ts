import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { UserService } from '../../../services/user.service';

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

  posts = this.blogService.getBlogPosts();
  
  private usersMap = computed(() => {
    const map = new Map<number, string>();
    this.userService.getUsers()().forEach(user => map.set(user.id, user.name));
    return map;
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
