import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../../services/exercise.service';
import { LessonService } from '../../../services/lesson.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
  private exerciseService = inject(ExerciseService);
  private lessonService = inject(LessonService);

  exercises = this.exerciseService.getExercises();

  private lessonsMap = computed(() => {
    const map = new Map<number, string>();
    this.lessonService.getLessons()().forEach(l => map.set(l.id, l.title));
    return map;
  });

  getLessonName(lessonId?: number): string {
    return lessonId ? this.lessonsMap().get(lessonId) || 'N/A' : 'None';
  }

  deleteExercise(id: number) {
    if (confirm('Are you sure you want to delete this exercise?')) {
      this.exerciseService.deleteExercise(id).subscribe();
    }
  }
}
