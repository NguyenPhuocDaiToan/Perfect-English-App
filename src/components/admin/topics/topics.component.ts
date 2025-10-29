import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../../services/topic.service';
import { LessonService } from '../../../services/lesson.service';
import { ExerciseService } from '../../../services/exercise.service';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsComponent {
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);
  private exerciseService = inject(ExerciseService);

  topics = this.topicService.getTopics();
  allLessons = this.lessonService.getLessons();
  allExercises = this.exerciseService.getExercises();
  
  getLessonCount = (topicId: number) => computed(() => this.allLessons().filter(l => l.topicId === topicId).length);
  getExerciseCount = (topicId: number) => computed(() => this.allExercises().filter(e => e.topicId === topicId).length);

  deleteTopic(id: number) {
    if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
        // You might want to add logic here to check if lessons or exercises are attached
        this.topicService.deleteTopic(id).subscribe();
    }
  }
}
