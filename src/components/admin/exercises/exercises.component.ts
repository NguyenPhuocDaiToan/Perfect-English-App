import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Exercise } from '../../../models/exercise.model';
import { ExerciseService } from '../../../services/exercise.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
  private exerciseService = inject(ExerciseService);

  exercises = this.exerciseService.getExercises();
  
  showForm = signal(false);
  isEditing = signal(false);
  currentExerciseId = signal<number | null>(null);
  
  // FIX: The FormBuilder was not being correctly typed when injected as a class property.
  // It's injected here directly to resolve the issue.
  exerciseForm: FormGroup = inject(FormBuilder).group({
    title: ['', Validators.required],
    topic: ['', Validators.required],
    difficulty: ['Easy', Validators.required],
  });

  openAddForm() {
    this.isEditing.set(false);
    this.exerciseForm.reset({ topic: this.exercises()[0]?.topic || '', difficulty: 'Easy' });
    this.showForm.set(true);
  }

  openEditForm(exercise: Exercise) {
    this.isEditing.set(true);
    this.currentExerciseId.set(exercise.id);
    this.exerciseForm.setValue({
      title: exercise.title,
      topic: exercise.topic,
      difficulty: exercise.difficulty,
    });
    this.showForm.set(true);
  }
  
  closeForm() {
    this.showForm.set(false);
    this.currentExerciseId.set(null);
  }

  saveExercise() {
    if (this.exerciseForm.invalid) {
      return;
    }

    if (this.isEditing()) {
      const exerciseData: Exercise = { id: this.currentExerciseId()!, ...this.exerciseForm.value };
      this.exerciseService.updateExercise(exerciseData).subscribe(() => this.closeForm());
    } else {
      this.exerciseService.addExercise(this.exerciseForm.value).subscribe(() => this.closeForm());
    }
  }

  deleteExercise(id: number) {
    if (confirm('Are you sure you want to delete this exercise?')) {
      this.exerciseService.deleteExercise(id).subscribe();
    }
  }
}