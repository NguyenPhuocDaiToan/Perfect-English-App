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

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './exercise-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseFormComponent {
  // FIX: Explicitly type FormBuilder to prevent type inference issues.
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

  // Data for selectors
  allQuestions = this.questionService.getQuestions();
  allTopics = this.topicService.getTopics();
  allLessons = this.lessonService.getLessons();

  // Form State
  showQuestionSelector = signal(false);
  selectedQuestionIds = signal<Set<number>>(new Set());
  
  difficultyOptions: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];
  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

  selectedQuestions = computed(() => {
    const ids = this.selectedQuestionIds();
    return this.allQuestions().filter(q => ids.has(q.id));
  });

  constructor() {
    this.exerciseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      topicId: [null],
      lessonId: [null],
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
        this.exerciseForm.patchValue(exercise);
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
    if (this.exerciseForm.invalid) return;
    
    const exerciseData = {
        ...this.exerciseForm.value,
        questionIds: Array.from(this.selectedQuestionIds())
    };

    if (this.isEditing() && this.currentExerciseId() !== null) {
      const finalData: Exercise = { ...exerciseData, id: this.currentExerciseId()! };
      this.exerciseService.updateExercise(finalData).subscribe(() => {
        this.router.navigate(['/admin/exercises']);
      });
    } else {
      this.exerciseService.addExercise(exerciseData).subscribe(() => {
        this.router.navigate(['/admin/exercises']);
      });
    }
  }
}
