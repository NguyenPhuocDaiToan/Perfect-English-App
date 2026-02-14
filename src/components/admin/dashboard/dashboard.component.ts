import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LessonService } from '../../../services/lesson.service';
import { ExerciseService } from '../../../services/exercise.service';
import { UserService } from '../../../services/user.service';
import { BlogService } from '../../../services/blog.service';
import { TopicService } from '../../../services/topic.service';

// Define a type for recent activity items for clarity
interface ActivityItem {
  type: 'Lesson' | 'Blog Post' | 'New User';
  title: string;
  date: Date;
  link: string;
  authorOrRole?: string;
}

// Define a type for chart data
interface ChartBar {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  authService = inject(AuthService);
  private lessonService = inject(LessonService);
  private exerciseService = inject(ExerciseService);
  private userService = inject(UserService);
  private blogService = inject(BlogService);
  private topicService = inject(TopicService);

  lessons = toSignal(this.lessonService.getAllLessonsForSelect(), { initialValue: [] });
  exercises = toSignal(this.exerciseService.getAllExercisesForSelect(), { initialValue: [] });
  users = toSignal(this.userService.getAllUsersForSelect(), { initialValue: [] });
  blogPosts = toSignal(this.blogService.getAllBlogPostsForSelect(), { initialValue: [] });
  topics = toSignal(this.topicService.getAllTopicsForSelect(), { initialValue: [] });

  stats = computed(() => ({
    lessons: this.lessons().length,
    exercises: this.exercises().length,
    users: this.users().length,
    blogPosts: this.blogPosts().length,
  }));

  recentActivities = computed(() => {
    const recentBlogPosts = this.blogPosts()
      .slice() // Create a shallow copy to avoid mutating the original signal's array
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(post => {
        const creator = (post as any).createdBy;
        const creatorId = typeof creator === 'string' ? creator : creator?.id;
        return {
          type: 'Blog Post' as const,
          title: post.title,
          date: new Date(post.createdAt),
          link: `/admin/blog/edit/${post.id}`,
          authorOrRole: this.users().find(u => u.id === creatorId)?.name || 'Unknown Creator'
        };
      });

    const recentUsers = this.users()
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(user => ({
        type: 'New User' as const,
        title: user.name,
        date: new Date(user.createdAt),
        link: `/admin/users`, // Users list, no specific edit link from here
        authorOrRole: user.role
      }));

    // Lessons don't have a date, so we simulate recency by taking the last ones by ID
    const recentLessons = this.lessons()
      .slice()
      .sort((a, b) => b.id.localeCompare(a.id)) // Sort by ID descending
      .slice(0, 5)
      .map((lesson, index) => ({
        type: 'Lesson' as const,
        title: lesson.title,
        // Create a fake date to allow sorting, making them slightly older than real dated items
        date: new Date(new Date().setDate(new Date().getDate() - (index + 5))),
        link: `/admin/lessons/edit/${lesson.id}`,
        authorOrRole: lesson.level
      }));

    return [...recentBlogPosts, ...recentUsers, ...recentLessons]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  });

  contentOverviewData = computed(() => {
    const data: ChartBar[] = [
      { label: 'Lessons', value: this.stats().lessons, color: 'bg-blue-500' },
      { label: 'Exercises', value: this.stats().exercises, color: 'bg-green-500' },
      { label: 'Blog Posts', value: this.stats().blogPosts, color: 'bg-amber-500' },
      { label: 'Topics', value: this.topics().length, color: 'bg-purple-500' },
    ];
    return data;
  });

  maxContentValue = computed(() => {
    const values = this.contentOverviewData().map(d => d.value);
    return Math.max(...values, 1); // Avoid division by zero
  });
}