
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, filter } from 'rxjs/operators';

import { LessonService } from '../../../services/lesson.service';
import { TopicService } from '../../../services/topic.service';
import { ExerciseService } from '../../../services/exercise.service';
import { ToastService } from '../../../services/toast.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { SelectComponent } from '../../shared/select/select.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CEFR_LEVELS, PUBLISH_STATUSES } from '../../../models/constants';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent, SelectComponent, CKEditorModule],
  templateUrl: './lesson-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonFormComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);
  private exerciseService = inject(ExerciseService);
  private toastService = inject(ToastService);

  lessonForm: FormGroup;
  isEditing = signal(false);
  currentLessonId = signal<string | null>(null);
  saveState = signal<SaveButtonState>('idle');
  public Editor = ClassicEditor;

  // Data for select dropdowns
  allTopics = toSignal(this.topicService.getAllTopicsForSelect(), { initialValue: [] });
  allExercises = toSignal(this.exerciseService.getAllExercisesForSelect(), { initialValue: [] });

  levelOptions = CEFR_LEVELS;
  statusOptions = PUBLISH_STATUSES;

  // Computed options for SelectComponent
  topicOptions = computed(() => this.allTopics().map(t => ({ value: t.id, label: t.title })));
  exerciseOptions = computed(() => this.allExercises().map(e => ({ value: e.id, label: e.title })));
  levelOptionsForSelect = computed(() => this.levelOptions.map(o => ({ value: o, label: o })));
  statusOptionsForSelect = computed(() => this.statusOptions.map(o => ({ value: o, label: o })));

  constructor() {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      topics: [[], Validators.required],
      level: ['A1', Validators.required],
      content: ['', Validators.required],
      exercise: [null],
      isPremium: [false],
      status: ['Draft', Validators.required],
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null)
    ).subscribe(id => {
      this.isEditing.set(true);
      this.currentLessonId.set(id!);
      this.lessonService.getLesson(id!).subscribe({
        next: (lesson) => {
          // Ensure topics and exercise are IDs (handle populated objects if any)
          const params = {
            ...lesson,
            topics: Array.isArray(lesson.topics)
              ? lesson.topics.map((t: any) => (typeof t === 'object' && t.id) ? t.id : t)
              : [],
            exercise: (lesson.exercise && typeof lesson.exercise === 'object' && (lesson.exercise as any).id)
              ? (lesson.exercise as any).id
              : lesson.exercise
          };
          this.lessonForm.patchValue(params);
        },
        error: () => {
          this.toastService.show('Lesson not found', 'error');
          this.router.navigate(['/admin/lessons']);
        }
      });
    });
  }

  goBack() {
    this.location.back();
  }

  saveLesson() {
    if (this.lessonForm.invalid || this.saveState() !== 'idle') return;

    this.saveState.set('loading');

    const formValue = this.lessonForm.value;
    const lessonData = {
      ...formValue,
    };

    const saveObservable = this.isEditing() && this.currentLessonId() !== null
      ? this.lessonService.updateLesson({ ...lessonData, id: this.currentLessonId()! })
      : this.lessonService.addLesson(lessonData);

    saveObservable.subscribe({
      next: () => {
        this.toastService.show(this.isEditing() ? 'Lesson updated successfully' : 'Lesson created successfully', 'success');
        this.router.navigate(['/admin/lessons']);
      },
      error: () => {
        this.saveState.set('idle');
        this.toastService.show('Failed to save lesson', 'error');
      }
    });
  }
}
