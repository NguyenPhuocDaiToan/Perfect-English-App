
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { QuizQuestion } from '../../models/quiz-question.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-level-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-test.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelTestComponent {
  private dataService = inject(DataService);
  questions$: Observable<QuizQuestion[]> = this.dataService.getLevelTestQuestions();

  questions = signal<QuizQuestion[]>([]);
  userAnswers = signal<number[]>([]);
  currentQuestionIndex = signal(0);
  isQuizFinished = signal(false);

  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  progress = computed(() => (this.currentQuestionIndex() / this.questions().length) * 100);

  score = computed(() => {
    let correctAnswers = 0;
    this.questions().forEach((q, index) => {
      if (q.correctAnswer === this.userAnswers()[index]) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  });

  level = computed(() => {
    const percentage = (this.score() / this.questions().length) * 100;
    if (percentage < 20) return { name: 'A1', description: 'Beginner' };
    if (percentage < 40) return { name: 'A2', description: 'Elementary' };
    if (percentage < 60) return { name: 'B1', description: 'Intermediate' };
    if (percentage < 80) return { name: 'B2', description: 'Upper-Intermediate' };
    if (percentage < 95) return { name: 'C1', description: 'Advanced' };
    return { name: 'C2', description: 'Proficiency' };
  });

  constructor() {
    this.questions$.subscribe(data => {
      this.questions.set(data);
      this.userAnswers.set(new Array(data.length).fill(-1));
    });
  }

  selectAnswer(answerIndex: number) {
    this.userAnswers.update(answers => {
      answers[this.currentQuestionIndex()] = answerIndex;
      return [...answers];
    });
  }

  nextQuestion() {
    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.isQuizFinished.set(true);
    }
  }

  retryTest() {
    this.currentQuestionIndex.set(0);
    this.userAnswers.set(new Array(this.questions().length).fill(-1));
    this.isQuizFinished.set(false);
  }
}