import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, filter } from 'rxjs/operators';

import { LessonService } from '../../../services/lesson.service';
import { Lesson } from '../../../models/lesson.model';
import { TopicService } from '../../../services/topic.service';
import { ExerciseService } from '../../../services/exercise.service';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './lesson-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);
  private exerciseService = inject(ExerciseService);

  lessonForm: FormGroup;
  isEditing = signal(false);
  currentLessonId = signal<number | null>(null);

  // Data for select dropdowns
  allTopics = this.topicService.getTopics();
  allExercises = this.exerciseService.getExercises();

  levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1'];
  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

  constructor() {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      topicId: [null, Validators.required],
      level: ['A1', Validators.required],
      content: ['', Validators.required],
      exerciseId: [null],
      status: ['Draft', Validators.required],
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null),
      map(id => Number(id)),
    ).subscribe(id => {
      this.isEditing.set(true);
      this.currentLessonId.set(id);
      const lesson = this.lessonService.getLesson(id)();
      if (lesson) {
        this.lessonForm.patchValue(lesson);
      } else {
         this.router.navigate(['/admin/lessons']);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  saveLesson() {
    if (this.lessonForm.invalid) return;

    if (this.isEditing() && this.currentLessonId() !== null) {
      const updatedLesson: Lesson = { ...this.lessonForm.value, id: this.currentLessonId()! };
      this.lessonService.updateLesson(updatedLesson).subscribe(() => {
        this.router.navigate(['/admin/lessons']);
      });
    } else {
      this.lessonService.addLesson(this.lessonForm.value).subscribe(() => {
        this.router.navigate(['/admin/lessons']);
      });
    }
  }
}
