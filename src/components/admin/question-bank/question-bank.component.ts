import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Question, QuestionType, McqOption } from '../../../models/question.model';
import { QuestionService } from '../../../services/question.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent, PaginationComponent],
  templateUrl: './question-bank.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionBankComponent {
  private questionService = inject(QuestionService);
  private fb: FormBuilder = inject(FormBuilder);

  // Data
  questions = signal<Question[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalResults = signal(0);
  
  // Form State
  showForm = signal(false);
  isEditing = signal(false);
  currentQuestionId = signal<number | null>(null);
  saveState = signal<SaveButtonState>('idle');

  // Form definition
  questionForm: FormGroup;
  questionTypes = Object.values(QuestionType);
  topics: Array<'Grammar' | 'Vocabulary' | 'Reading' | 'Listening'> = ['Grammar', 'Vocabulary', 'Reading', 'Listening'];
  difficulties: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];

  // Filter states
  searchTerm = signal('');
  filterTopic = signal<string>('All');
  filterType = signal<string>('All');
  filterDifficulty = signal<string>('All');

  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.questions().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });

  constructor() {
    this.questionForm = this.fb.group({
      type: [QuestionType.MCQ, Validators.required],
      topic: ['Grammar', Validators.required],
      subTopic: ['', Validators.required],
      difficulty: ['Easy', Validators.required],
      questionText: ['', Validators.required],
      options: this.fb.array([]),
      correctAnswer: [false], // For True/False
      explanation: ['', Validators.required],
      tags: [''],
    });

    this.questionForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFormForType(type);
    });

    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const topic = this.filterTopic();
      const type = this.filterType();
      const difficulty = this.filterDifficulty();
      untracked(() => this.fetchQuestions(page, { searchTerm: term, topic, type, difficulty }));
    });
  }

  private fetchQuestions(page: number, filters: { searchTerm: string, topic: string, type: string, difficulty: string }) {
    this.status.set('loading');
    this.questionService.getPaginatedQuestions(page, this.pageSize(), filters).subscribe({
      next: response => {
        this.questions.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.currentPage.set(response.page);
        this.status.set('loaded');
      },
      error: () => this.status.set('error')
    });
  }

  onSearchTermChange(term: string) { this.searchTerm.set(term); this.currentPage.set(1); }
  onTopicChange(topic: string) { this.filterTopic.set(topic); this.currentPage.set(1); }
  onTypeChange(type: string) { this.filterType.set(type); this.currentPage.set(1); }
  onDifficultyChange(difficulty: string) { this.filterDifficulty.set(difficulty); this.currentPage.set(1); }
  onPageChange(newPage: number) { this.currentPage.set(newPage); }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  private updateFormForType(type: QuestionType) {
    this.options.clear();
    if (type === QuestionType.MCQ) {
      this.addOption();
      this.addOption();
    }
  }

  createOption(text = '', isCorrect = false): FormGroup {
    return this.fb.group({
      text: [text, Validators.required],
      isCorrect: [isCorrect]
    });
  }

  addOption() {
    this.options.push(this.createOption());
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  setCorrectOption(selectedIndex: number) {
    this.options.controls.forEach((control, index) => {
      control.get('isCorrect')?.setValue(index === selectedIndex);
    });
  }

  openAddForm() {
    this.isEditing.set(false);
    this.questionForm.reset({
      type: QuestionType.MCQ,
      topic: 'Grammar',
      difficulty: 'Easy',
      correctAnswer: false
    });
    this.updateFormForType(QuestionType.MCQ);
    this.saveState.set('idle');
    this.showForm.set(true);
  }

  openEditForm(question: Question) {
    this.isEditing.set(true);
    this.currentQuestionId.set(question.id);
    this.questionForm.patchValue({
        ...question,
        tags: question.tags.join(', ')
    });
    
    this.options.clear();
    if (question.type === QuestionType.MCQ && question.options) {
      question.options.forEach(opt => this.options.push(this.createOption(opt.text, opt.isCorrect)));
    }
    this.saveState.set('idle');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.currentQuestionId.set(null);
  }

  saveQuestion() {
    if (this.questionForm.invalid || this.saveState() !== 'idle') return;

    this.saveState.set('loading');
    const formValue = this.questionForm.value;
    const questionData = {
      ...formValue,
      tags: formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t),
    };

    const saveObservable = this.isEditing()
        ? this.questionService.updateQuestion({ ...questionData, id: this.currentQuestionId()! })
        : this.questionService.addQuestion(questionData);

    saveObservable.subscribe({
        next: () => {
            this.saveState.set('success');
            setTimeout(() => {
                this.closeForm();
                this.refetchCurrentPage();
            }, 1500);
        },
        error: () => {
            this.saveState.set('idle');
        }
    });
  }

  deleteQuestion(id: number) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.questionService.deleteQuestion(id).subscribe(() => {
        if (this.questions().length === 1 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        } else {
            this.refetchCurrentPage();
        }
      });
    }
  }

  private refetchCurrentPage() {
    this.fetchQuestions(this.currentPage(), { 
        searchTerm: this.searchTerm(), 
        topic: this.filterTopic(), 
        type: this.filterType(), 
        difficulty: this.filterDifficulty()
    });
  }
}