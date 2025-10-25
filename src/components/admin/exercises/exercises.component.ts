import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Exercise {
  id: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
  exercises = signal<Exercise[]>([
    { id: 1, title: 'Present Simple - Fill in the blanks', topic: 'Verb Tenses', difficulty: 'Easy' },
    { id: 2, title: 'Conditionals - Multiple Choice', topic: 'Conditionals', difficulty: 'Medium' },
    { id: 3, title: 'Passive Voice - Sentence Transformation', topic: 'Passive Voice', difficulty: 'Hard' },
    { id: 4, title: 'Modal Verbs of Obligation', topic: 'Modal Verbs', difficulty: 'Medium' },
    { id: 5, 'title': 'Articles: a, an, the, or no article', topic: 'Articles', difficulty: 'Easy' },
  ]);
}
