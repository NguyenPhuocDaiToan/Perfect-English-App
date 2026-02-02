
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Question, QuestionType } from '../../../models/question.model';
import { QuestionService } from '../../../services/question.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';
import { DIFFICULTY_LEVELS, QUESTION_TOPICS } from '../../../models/constants';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent, PaginationComponent, SelectComponent],
  templateUrl: './question-bank.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionBankComponent {
  private questionService = inject(QuestionService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
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
  topics = QUESTION_TOPICS;
  difficulties = DIFFICULTY_LEVELS;

  // Computed options for SelectComponent filters
  topicOptions = computed(() => [{ value: 'All', label: 'All Topics' }, ...this.topics.map(o => ({ value: o, label: o }))]);
  typeOptions = computed(() => [{ value: 'All', label: 'All Types' }, ...this.questionTypes.map(o => ({ value: o, label: o }))]);
  difficultyOptions = computed(() => [{ value: 'All', label: 'All Difficulties' }, ...this.difficulties.map(o => ({ value: o, label: o }))]);

  // Computed options for form dropdowns
  formTopicOptions = computed(() => this.topics.map(o => ({ value: o, label: o })));
  formTypeOptions = computed(() => this.questionTypes.map(o => ({ value: o, label: o })));
  formDifficultyOptions = computed(() => this.difficulties.map(o => ({ value: o, label: o })));

  // Filter states
  searchTerm = signal('');
  searchQuery = signal(''); // Debounced term for API
  private searchSubject = new Subject<string>();

  filterTopicControl = new FormControl('All');
  filterTypeControl = new FormControl('All');
  filterDifficultyControl = new FormControl('All');
  
  // Signals for filters to ensure effect tracking
  filterTopic = signal('All');
  filterType = signal('All');
  filterDifficulty = signal('All');

  QuestionType = QuestionType;

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
      correctAnswerText: [''], // For FillBlank
      explanation: ['', Validators.required],
      tags: [''],
    });

    this.questionForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFormForType(type);
    });
    
    // Search Debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery.set(term);
      this.currentPage.set(1);
    });

    // Track filter changes
    this.filterTopicControl.valueChanges.subscribe(val => { this.filterTopic.set(val ?? 'All'); this.currentPage.set(1); });
    this.filterTypeControl.valueChanges.subscribe(val => { this.filterType.set(val ?? 'All'); this.currentPage.set(1); });
    this.filterDifficultyControl.valueChanges.subscribe(val => { this.filterDifficulty.set(val ?? 'All'); this.currentPage.set(1); });

    effect(() => {
      const page = this.currentPage();
      const term = this.searchQuery();
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
      error: () => {
        this.status.set('error');
        this.toastService.show('Failed to load questions', 'error');
      }
    });
  }

  onSearchTermChange(term: string) {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }
  
  clearSearch() {
    this.searchTerm.set('');
    this.searchSubject.next('');
  }

  onPageChange(newPage: number) { this.currentPage.set(newPage); }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }
  
  // Validator to ensure at least 2 options and 1 correct answer for MCQs and MultiSelect
  private optionsValidator(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    if (formArray.length < 2) {
      return { minOptions: true };
    }
    const hasCorrect = formArray.controls.some(c => c.get('isCorrect')?.value === true);
    if (!hasCorrect) {
      return { noCorrectOption: true };
    }
    return null;
  }

  private updateFormForType(type: QuestionType) {
    // Reset specific validators
    this.options.clear();
    this.options.clearValidators();
    this.questionForm.get('correctAnswerText')?.clearValidators();
    this.questionForm.get('correctAnswerText')?.updateValueAndValidity();
    
    if (type === QuestionType.MCQ || type === QuestionType.MultiSelect) {
      this.addOption();
      this.addOption();
      this.options.setValidators(this.optionsValidator);
    } else if (type === QuestionType.FillBlank) {
      this.questionForm.get('correctAnswerText')?.setValidators(Validators.required);
      this.questionForm.get('correctAnswerText')?.updateValueAndValidity();
    }
    
    this.options.updateValueAndValidity();
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
    this.options.clearValidators();

    // Set validators based on the loaded question type
    this.questionForm.get('correctAnswerText')?.clearValidators();

    if (question.type === QuestionType.MCQ || question.type === QuestionType.MultiSelect) {
      this.options.setValidators(this.optionsValidator);
      if (question.options) {
        question.options.forEach(opt => this.options.push(this.createOption(opt.text, opt.isCorrect)));
      }
    } else if (question.type === QuestionType.FillBlank) {
      this.questionForm.get('correctAnswerText')?.setValidators(Validators.required);
    }

    this.questionForm.get('correctAnswerText')?.updateValueAndValidity();
    this.options.updateValueAndValidity();
    
    this.saveState.set('idle');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.currentQuestionId.set(null);
  }

  saveQuestion() {
    if (this.questionForm.invalid || this.saveState() !== 'idle') {
        this.questionForm.markAllAsTouched();
        return;
    }

    this.saveState.set('loading');
    const formValue = this.questionForm.value;
    const questionData = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
    };

    const saveObservable = this.isEditing()
        ? this.questionService.updateQuestion({ ...questionData, id: this.currentQuestionId()! })
        : this.questionService.addQuestion(questionData);

    saveObservable.subscribe({
        next: () => {
            this.toastService.show(this.isEditing() ? 'Question updated successfully' : 'Question added successfully', 'success');
            this.closeForm();
            this.refetchCurrentPage();
        },
        error: () => {
            this.saveState.set('idle');
            this.toastService.show('Failed to save question', 'error');
        }
    });
  }

  async deleteQuestion(id: number) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question? This action cannot be undone.',
      confirmText: 'Delete Question',
      type: 'danger'
    });

    if (confirmed) {
      this.questionService.deleteQuestion(id).subscribe({
        next: () => {
            this.toastService.show('Question deleted successfully', 'success');
            if (this.questions().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
            } else {
                this.refetchCurrentPage();
            }
        },
        error: () => this.toastService.show('Failed to delete question', 'error')
      });
    }
  }

  private refetchCurrentPage() {
    this.fetchQuestions(this.currentPage(), { 
        searchTerm: this.searchQuery(), 
        topic: this.filterTopic(), 
        type: this.filterType(), 
        difficulty: this.filterDifficulty()
    });
  }
}
