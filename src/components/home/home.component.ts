import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';
import { TestimonialsComponent } from '../testimonials/testimonials.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TestimonialsComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private topicService = inject(TopicService);
  private blogService = inject(BlogService);
  private userService = inject(UserService);

  popularTopics = computed(() => 
    this.topicService.getTopics()()
      .filter(t => t.status === 'Published')
      .slice(0, 3)
  );
  
  latestPosts = computed(() => 
    this.blogService.getBlogPosts()()
      .filter(p => p.status === 'Published')
      .slice(0, 3)
  );

  private usersMap = computed(() => {
    const map = new Map<number, string>();
    this.userService.getUsers()().forEach(user => map.set(user.id, user.name));
    return map;
  });

  getAuthorName(authorId: number): string {
    return this.usersMap().get(authorId) || 'Unknown Author';
  }
}
