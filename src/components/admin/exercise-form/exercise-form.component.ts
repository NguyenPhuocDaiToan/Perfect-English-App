import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { Exercise } from '../../../models/exercise.model';
import { ExerciseService } from '../../../services/exercise.service';
import { QuestionService } from '../../../services/question.service';
import { TopicService } from '../../../services/topic.service';
import { LessonService } from '../../../services/lesson.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SaveButtonComponent, SelectComponent],
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

  exerciseForm: FormGroup;
  isEditing = signal(false);
  currentExerciseId = signal<number | null>(null);
  saveState = signal<SaveButtonState>('idle');

  // Data for selectors
  allQuestions = this.questionService.getQuestions();
  allTopics = this.topicService.getTopics();
  allLessons = this.lessonService.getLessons();

  // Form State
  showQuestionSelector = signal(false);
  selectedQuestionIds = signal<Set<number>>(new Set());
  
  difficultyOptions: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];
  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

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
      topicIds: [[]],
      lessonIds: [[]],
      difficulty: ['Easy', Validators.required],
      timeLimit: [10, [Validators.required, Validators.min(1)]],
      status: ['Draft', Validators.required]
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null),
      map(id => Number(id))
    ).subscribe(id => {
      this.isEditing.set(true);
      this.currentExerciseId.set(id);
      const exercise = this.exerciseService.getExercise(id)();
      if (exercise) {
        this.exerciseForm.patchValue({
          ...exercise,
          topicIds: exercise.topicIds || [],
          lessonIds: exercise.lessonIds || []
        });
        this.selectedQuestionIds.set(new Set(exercise.questionIds));
      } else {
        this.router.navigate(['/admin/exercises']);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  openQuestionSelector() { this.showQuestionSelector.set(true); }
  closeQuestionSelector() { this.showQuestionSelector.set(false); }

  toggleQuestionSelection(questionId: number, event: Event) {
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
        questionIds: Array.from(this.selectedQuestionIds())
    };

    const saveObservable = this.isEditing() && this.currentExerciseId() !== null
        ? this.exerciseService.updateExercise({ ...exerciseData, id: this.currentExerciseId()! })
        : this.exerciseService.addExercise(exerciseData);
    
    saveObservable.subscribe({
        next: () => {
            this.saveState.set('success');
            setTimeout(() => {
                this.router.navigate(['/admin/exercises']);
            }, 1500);
        },
        error: () => {
            this.saveState.set('idle');
        }
    });
  }
}
