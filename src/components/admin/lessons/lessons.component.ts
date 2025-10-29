import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';
import { TopicService } from '../../../services/topic.service';
import { ExerciseService } from '../../../services/exercise.service';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lessons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonsComponent {
  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);
  private exerciseService = inject(ExerciseService);

  lessons = this.lessonService.getLessons();
  
  // Create maps for quick lookups
  private topicsMap = computed(() => {
    const map = new Map<number, string>();
    this.topicService.getTopics()().forEach(topic => map.set(topic.id, topic.title));
    return map;
  });
  
  private exercisesMap = computed(() => {
    const map = new Map<number, string>();
    this.exerciseService.getExercises()().forEach(ex => map.set(ex.id, ex.title));
    return map;
  });

  getTopicName(topicId: number): string {
    return this.topicsMap().get(topicId) || 'N/A';
  }

  getExerciseName(exerciseId?: number): string {
    return exerciseId ? this.exercisesMap().get(exerciseId) || 'N/A' : 'None';
  }

  deleteLesson(id: number) {
    if (confirm('Are you sure you want to delete this lesson?')) {
      this.lessonService.deleteLesson(id).subscribe();
    }
  }
}
