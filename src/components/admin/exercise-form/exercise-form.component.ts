
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, filter, switchMap } from 'rxjs/operators';
import { ExerciseService } from '../../../services/exercise.service';
import { QuestionService } from '../../../services/question.service';
import { TopicService } from '../../../services/topic.service';
import { LessonService } from '../../../services/lesson.service';
import { ToastService } from '../../../services/toast.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { SelectComponent } from '../../shared/select/select.component';
import { DIFFICULTY_LEVELS, PUBLISH_STATUSES } from '../../../models/constants';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent, SelectComponent],
  templateUrl: './exercise-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseFormComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  private exerciseService = inject(ExerciseService);
  private questionService = inject(QuestionService);
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);
  private toastService = inject(ToastService);

  exerciseForm: FormGroup;
  isEditing = signal(false);
  currentexercise = signal<string | null>(null);
  saveState = signal<SaveButtonState>('idle');

  // Data for selectors
  allQuestions = toSignal(this.questionService.getAllQuestionsForSelect(), { initialValue: [] });
  allTopics = toSignal(this.topicService.getAllTopicsForSelect(), { initialValue: [] });
  allLessons = toSignal(this.lessonService.getAllLessonsForSelect(), { initialValue: [] });

  // Form State
  showQuestionSelector = signal(false);
  selectedQuestionIds = signal<Set<string>>(new Set());

  difficultyOptions = DIFFICULTY_LEVELS;
  statusOptions = PUBLISH_STATUSES;

  // Computed options for SelectComponent
  topicOptions = computed(() => this.allTopics().map(t => ({ value: t.id, label: t.title })));
  lessonOptions = computed(() => this.allLessons().map(l => ({ value: l.id, label: l.title })));
  difficultyOptionsForSelect = computed(() => this.difficultyOptions.map(o => ({ value: o, label: o })));
  statusOptionsForSelect = computed(() => this.statusOptions.map(o => ({ value: o, label: o })));

  selectedQuestions = computed(() => {
    const ids = this.selectedQuestionIds();
    return this.allQuestions().filter(q => ids.has(q.id));
  });

  constructor() {
    this.exerciseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      topics: [[]],
      lessons: [[]],
      difficulty: ['Easy', Validators.required],
      timeLimit: [10, [Validators.required, Validators.min(1)]],
      isPremium: [false],
      status: ['Draft', Validators.required]
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null)
    ).subscribe(id => {
      this.isEditing.set(true);
      this.currentexercise.set(id);
      this.exerciseService.getExercise(id!).subscribe({
        next: (exercise) => {
          this.exerciseForm.patchValue({
            ...exercise,
            topics: exercise.topics || [],
            lessons: exercise.lessons || []
          });
          this.selectedQuestionIds.set(new Set(exercise.questions));
        },
        error: () => {
          this.toastService.show('Exercise not found', 'error');
          this.router.navigate(['/admin/exercises']);
        }
      });
    });
  }

  goBack() {
    this.location.back();
  }

  openQuestionSelector() { this.showQuestionSelector.set(true); }
  closeQuestionSelector() { this.showQuestionSelector.set(false); }

  toggleQuestionSelection(questionId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedQuestionIds.update(currentSet => {
      const newSet = new Set(currentSet);
      if (isChecked) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  }

  saveExercise() {
    if (this.exerciseForm.invalid || this.saveState() !== 'idle') return;

    this.saveState.set('loading');
    const formValue = this.exerciseForm.value;
    const exerciseData = {
      ...formValue,
      questions: Array.from(this.selectedQuestionIds())
    };

    const saveObservable = this.isEditing() && this.currentexercise() !== null
      ? this.exerciseService.updateExercise({ ...exerciseData, id: this.currentexercise()! })
      : this.exerciseService.addExercise(exerciseData);

    saveObservable.subscribe({
      next: () => {
        this.toastService.show(this.isEditing() ? 'Exercise updated successfully' : 'Exercise created successfully', 'success');
        this.router.navigate(['/admin/exercises']);
      },
      error: () => {
        this.saveState.set('idle');
        this.toastService.show('Failed to save exercise', 'error');
      }
    });
  }
}
