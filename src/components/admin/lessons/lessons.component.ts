import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Lesson } from '../../../models/lesson.model';
import { LessonService } from '../../../services/lesson.service';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lessons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonsComponent {
  private lessonService = inject(LessonService);

  lessons = this.lessonService.getLessons();
  
  showForm = signal(false);
  isEditing = signal(false);
  currentLessonId = signal<number | null>(null);
  
  lessonForm: FormGroup;

  levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1'];
  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

  isLevelDropdownOpen = signal(false);
  isStatusDropdownOpen = signal(false);

  constructor() {
    // FIX: The FormBuilder was not being correctly typed when injected as a property.
    // It's injected here directly to resolve the issue.
    const fb = inject(FormBuilder);
    this.lessonForm = fb.group({
      title: ['', Validators.required],
      level: ['A1', Validators.required],
      status: ['Draft', Validators.required],
    });
  }

  openAddForm() {
    this.isEditing.set(false);
    this.lessonForm.reset({ level: 'A1', status: 'Draft' });
    this.showForm.set(true);
  }

  openEditForm(lesson: Lesson) {
    this.isEditing.set(true);
    this.currentLessonId.set(lesson.id);
    this.lessonForm.setValue({
      title: lesson.title,
      level: lesson.level,
      status: lesson.status,
    });
    this.showForm.set(true);
  }
  
  closeForm() {
    this.showForm.set(false);
    this.currentLessonId.set(null);
    this.isLevelDropdownOpen.set(false);
    this.isStatusDropdownOpen.set(false);
  }

  saveLesson() {
    if (this.lessonForm.invalid) {
      return;
    }

    if (this.isEditing()) {
      const lessonData: Lesson = { id: this.currentLessonId()!, ...this.lessonForm.value };
      this.lessonService.updateLesson(lessonData).subscribe(() => this.closeForm());
    } else {
      this.lessonService.addLesson(this.lessonForm.value).subscribe(() => this.closeForm());
    }
  }

  deleteLesson(id: number) {
    if (confirm('Are you sure you want to delete this lesson?')) {
      this.lessonService.deleteLesson(id).subscribe();
    }
  }

  selectLevel(level: string) {
    this.lessonForm.get('level')?.setValue(level);
    this.isLevelDropdownOpen.set(false);
  }

  selectStatus(status: 'Draft' | 'Published') {
    this.lessonForm.get('status')?.setValue(status);
    this.isStatusDropdownOpen.set(false);
  }
}