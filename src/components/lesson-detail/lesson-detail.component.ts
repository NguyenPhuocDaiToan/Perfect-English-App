
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';

import { LessonService } from '../../services/lesson.service';
import { TopicService } from '../../services/topic.service';
import { AuthService } from '../../services/auth.service';
import { Lesson } from '../../models/lesson.model';
import { Topic } from '../../models/topic.model';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lesson-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonDetailComponent {
  private route = inject(ActivatedRoute);
  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);
  private titleService = inject(Title);
  authService = inject(AuthService);

  lesson = signal<Lesson | undefined>(undefined);
  topic = signal<Topic | undefined>(undefined);
  isLocked = signal(false);

  constructor() {
    this.route.paramMap.pipe(
      map(params => params.get('lessonId')),
      switchMap(id => {
        if (!id) return [];
        return this.lessonService.getLesson(id);
      })
    ).subscribe(foundLesson => {
      this.lesson.set(foundLesson);

      if (foundLesson) {
        // Check premium access
        const currentUser = this.authService.currentUser();
        if (foundLesson.isPremium && (!currentUser || !currentUser.isPremium)) {
          this.isLocked.set(true);
        } else {
          this.isLocked.set(false);
        }

        const primaryTopicId = foundLesson.topics && foundLesson.topics.length > 0 ? foundLesson.topics[0] : undefined;
        if (primaryTopicId) {
          this.topicService.getTopic(primaryTopicId).subscribe(t => this.topic.set(t));
        }
        this.titleService.setTitle(`${foundLesson.title} | Perfect English Grammar`);
      } else {
        this.titleService.setTitle('Lesson Not Found | Perfect English Grammar');
      }
    });
  }
}
