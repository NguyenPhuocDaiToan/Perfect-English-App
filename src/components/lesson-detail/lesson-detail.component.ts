import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

import { LessonService } from '../../services/lesson.service';
import { TopicService } from '../../services/topic.service';
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

  lesson = signal<Lesson | undefined>(undefined);
  topic = signal<Topic | undefined>(undefined);

  private lessonId$ = this.route.paramMap.pipe(map(params => Number(params.get('lessonId'))));

  constructor() {
    this.lessonId$.subscribe(id => {
      if (isNaN(id)) return;

      const foundLesson = this.lessonService.getLesson(id)();
      this.lesson.set(foundLesson);

      if (foundLesson) {
        const foundTopic = this.topicService.getTopic(foundLesson.topicId)();
        this.topic.set(foundTopic);
        this.titleService.setTitle(`${foundLesson.title} | Perfect English Grammar`);
      } else {
        this.titleService.setTitle('Lesson Not Found | Perfect English Grammar');
      }
    });
  }
}
