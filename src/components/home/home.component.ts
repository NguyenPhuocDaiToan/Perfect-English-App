import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  topics = toSignal(this.topicService.getAllTopicsForSelect(), { initialValue: [] });
  posts = toSignal(this.blogService.getAllBlogPostsForSelect(), { initialValue: [] });

  popularTopics = computed(() =>
    this.topics()
      .filter(t => t.status === 'Published')
      .slice(0, 3)
  );

  latestPosts = computed(() =>
    this.posts()
      .filter(p => p.status === 'Published')
      .slice(0, 3)
  );

  private allUsers = toSignal(this.userService.getAllUsersForSelect(), { initialValue: [] });

  private usersMap = computed(() => {
    const map = new Map<string, string>();
    this.allUsers().forEach(user => map.set(user.id, user.name));
    return map;
  });

  getCreatorName(createdBy: any): string {
    const userId = typeof createdBy === 'object' ? createdBy?.id || createdBy?._id : createdBy;
    return this.usersMap().get(userId) || 'Unknown Creator';
  }
}
