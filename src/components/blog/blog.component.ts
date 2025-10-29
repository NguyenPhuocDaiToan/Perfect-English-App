import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogComponent {
  private blogService = inject(BlogService);
  private userService = inject(UserService);

  publishedPosts = computed(() => 
    this.blogService.getBlogPosts()().filter(p => p.status === 'Published')
  );

  private usersMap = computed(() => {
    const map = new Map<number, string>();
    this.userService.getUsers()().forEach(user => map.set(user.id, user.name));
    return map;
  });

  getAuthorName(authorId: number): string {
    return this.usersMap().get(authorId) || 'Unknown';
  }
}
