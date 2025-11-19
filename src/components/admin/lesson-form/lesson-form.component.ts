
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, filter } from 'rxjs/operators';

import { LessonService } from '../../../services/lesson.service';
import { Lesson } from '../../../models/lesson.model';
import { TopicService } from '../../../services/topic.service';
import { ExerciseService } from '../../../services/exercise.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { SelectComponent } from '../../shared/select/select.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SaveButtonComponent, SelectComponent, CKEditorModule],
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

  lessonForm: FormGroup;
  isEditing = signal(false);
  currentLessonId = signal<number | null>(null);
  saveState = signal<SaveButtonState>('idle');
  public Editor = ClassicEditor;

  // Data for select dropdowns
  allTopics = this.topicService.getTopics();
  allExercises = this.exerciseService.getExercises();

  levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1'];
  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

  // Computed options for SelectComponent
  topicOptions = computed(() => this.allTopics().map(t => ({ value: t.id, label: t.title })));
  exerciseOptions = computed(() => this.allExercises().map(e => ({ value: e.id, label: e.title })));
  levelOptionsForSelect = computed(() => this.levelOptions.map(o => ({ value: o, label: o })));
  statusOptionsForSelect = computed(() => this.statusOptions.map(o => ({ value: o, label: o })));

  constructor() {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      topicIds: [[], Validators.required],
      level: ['A1', Validators.required],
      content: ['', Validators.required],
      exerciseId: [null],
      isPremium: [false],
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
    if (this.lessonForm.invalid || this.saveState() !== 'idle') return;

    this.saveState.set('loading');
    
    // Ensure topicIds is an array of numbers
    const formValue = this.lessonForm.value;
    const lessonData = {
        ...formValue,
        // The value from the form control is already in the correct format
    };
    
    const saveObservable = this.isEditing() && this.currentLessonId() !== null
        ? this.lessonService.updateLesson({ ...lessonData, id: this.currentLessonId()! })
        : this.lessonService.addLesson(lessonData);

    saveObservable.subscribe({
        next: () => {
            this.saveState.set('success');
            setTimeout(() => {
                this.router.navigate(['/admin/lessons']);
            }, 1500);
        },
        error: () => {
            this.saveState.set('idle');
        }
    });
  }
}
