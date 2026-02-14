
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ExerciseService } from '../../services/exercise.service';
import { QuestionService } from '../../services/question.service';
import { AuthService } from '../../services/auth.service';
import { UserProgressService } from '../../services/user-progress.service';

import { Exercise } from '../../models/exercise.model';
import { Question, QuestionType } from '../../models/question.model';

type QuizState = 'playing' | 'finished';
type UserAnswer = { questionId: number, answer: any, isCorrect: boolean };

@Component({
  selector: 'app-exercise-player',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './exercise-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisePlayerComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private questionService = inject(QuestionService);
  authService = inject(AuthService);
  private userProgressService = inject(UserProgressService);
  private fb: FormBuilder = inject(FormBuilder);

  // State
  quizState = signal<QuizState>('playing');
  exercise = signal<Exercise | undefined>(undefined);
  questions = signal<Question[]>([]);
  currentQuestionIndex = signal(0);
  userAnswers = signal<Map<number, any>>(new Map());
  isLocked = signal(false);
  
  // Gamification State
  earnedXp = signal(0);

  // Derived State
  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  progress = computed(() => {
    if (!this.questions().length) return 0;
    return ((this.currentQuestionIndex() + 1) / this.questions().length) * 100;
  });

  // For results page
  results = signal<{ score: number, results: UserAnswer[] }>({ score: 0, results: [] });

  // For FillBlank forms
  fillBlankForm: FormGroup;
  QuestionType = QuestionType;

  constructor() {
    this.fillBlankForm = this.fb.group({
      answer: ['']
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => id !== null),
      map(id => Number(id))
    ).subscribe(id => {
      const exercise = this.exerciseService.getExercise(id)();
      if (exercise) {
        this.exercise.set(exercise);
        
        // Check Paywall
        const currentUser = this.authService.currentUser();
        if (exercise.isPremium && (!currentUser || !currentUser.isPremium)) {
            this.isLocked.set(true);
        } else {
            this.isLocked.set(false);
            const questions = this.questionService.getQuestionByIds(exercise.questionIds)();
            this.questions.set(questions);
            this.startExercise();
        }

      } else {
        this.router.navigate(['/exercises']);
      }
    });
  }

  startExercise() {
    this.quizState.set('playing');
    this.currentQuestionIndex.set(0);
    this.userAnswers.set(new Map());
    this.fillBlankForm.reset();
  }

  selectAnswer(questionId: number, answer: any) {
    this.userAnswers.update(answers => {
      answers.set(questionId, answer);
      return new Map(answers);
    });
  }
  
  toggleMultiSelectAnswer(questionId: number, optionText: string) {
    this.userAnswers.update(answers => {
      const current = answers.get(questionId) as string[] || [];
      const newSelection = current.includes(optionText)
        ? current.filter(t => t !== optionText)
        : [...current, optionText];
      answers.set(questionId, newSelection);
      return new Map(answers);
    });
  }
  
  nextQuestion() {
    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
      this.fillBlankForm.reset();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
      this.fillBlankForm.reset();
    }
  }

  finishExercise() {
    this.calculateResults();
    this.quizState.set('finished');
    
    // Gamification & Progress
    if (this.exercise() && this.authService.currentUser()) {
        // Save Progress
        this.userProgressService.saveProgress(this.exercise()!.id, this.results().score);

        // Award XP (e.g., 10 XP per correct answer + 50 bonus for 100%)
        const correctCount = this.results().results.filter(r => r.isCorrect).length;
        let xp = correctCount * 10;
        if (this.results().score === 100) xp += 50;
        
        this.earnedXp.set(xp);
        
        // Update User XP in AuthService (Mock)
        this.authService.currentUser.update(u => u ? ({ ...u, xp: (u.xp || 0) + xp }) : null);
    }
  }

  private calculateResults() {
    let correctAnswers = 0;
    const detailedResults: UserAnswer[] = this.questions().map(q => {
      const userAnswer = this.userAnswers().get(q.id);
      let isCorrect = false;
      
      switch(q.type) {
        case QuestionType.MCQ:
          const correctOption = q.options?.find(opt => opt.isCorrect);
          isCorrect = correctOption?.text === userAnswer;
          break;
        case QuestionType.MultiSelect:
          const correctOptions = q.options?.filter(o => o.isCorrect).map(o => o.text) || [];
          const userSelected = (userAnswer as string[]) || [];
          isCorrect = correctOptions.length === userSelected.length && correctOptions.every(o => userSelected.includes(o));
          break;
        case QuestionType.TrueFalse:
          isCorrect = q.correctAnswer === userAnswer;
          break;
        case QuestionType.FillBlank:
          if (q.correctAnswerText && userAnswer) {
             isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswerText.toLowerCase().trim();
          }
          break;
      }

      if (isCorrect) {
        correctAnswers++;
      }
      
      return { questionId: q.id, answer: userAnswer, isCorrect };
    });

    const score = (correctAnswers / this.questions().length) * 100;
    this.results.set({ score: Math.round(score), results: detailedResults });
  }

  getQuestionResult(questionId: number): UserAnswer | undefined {
    return this.results().results.find(r => r.questionId === questionId);
  }

  getCorrectAnswerText(question: Question): string {
    switch(question.type) {
        case QuestionType.MCQ:
            return question.options?.find(o => o.isCorrect)?.text ?? 'N/A';
        case QuestionType.MultiSelect:
            return question.options?.filter(o => o.isCorrect).map(o => o.text).join(', ') ?? 'N/A';
        case QuestionType.TrueFalse:
            return question.correctAnswer ? 'True' : 'False';
        case QuestionType.FillBlank:
            return question.correctAnswerText || 'N/A';
        default:
            return 'N/A';
    }
  }
  
  isMultiSelectOptionSelected(questionId: number, optionText: string): boolean {
      const selected = this.userAnswers().get(questionId) as string[] | undefined;
      return selected ? selected.includes(optionText) : false;
  }
}
