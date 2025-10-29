import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Question, QuestionType, McqOption } from '../../../models/question.model';
import { QuestionService } from '../../../services/question.service';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './question-bank.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionBankComponent {
  private questionService = inject(QuestionService);
  // FIX: Explicitly type FormBuilder to prevent type inference issues.
  private fb: FormBuilder = inject(FormBuilder);

  questions = this.questionService.getQuestions();

  showForm = signal(false);
  isEditing = signal(false);
  currentQuestionId = signal<number | null>(null);

  questionForm: FormGroup;
  questionTypes = Object.values(QuestionType);
  topics: Array<'Grammar' | 'Vocabulary' | 'Reading' | 'Listening'> = ['Grammar', 'Vocabulary', 'Reading', 'Listening'];
  difficulties: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];

  // Dropdown states
  isTypeDropdownOpen = signal(false);
  isTopicDropdownOpen = signal(false);
  isDifficultyDropdownOpen = signal(false);

  // Filter states
  filterTopic = signal<string>('All');
  filterType = signal<string>('All');
  filterDifficulty = signal<string>('All');

  filteredQuestions = computed(() => {
    return this.questions().filter(q => 
      (this.filterTopic() === 'All' || q.topic === this.filterTopic()) &&
      (this.filterType() === 'All' || q.type === this.filterType()) &&
      (this.filterDifficulty() === 'All' || q.difficulty === this.filterDifficulty())
    );
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
  }

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
    
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.currentQuestionId.set(null);
  }

  saveQuestion() {
    if (this.questionForm.invalid) return;

    const formValue = this.questionForm.value;
    const questionData = {
      ...formValue,
      tags: formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t),
    };

    if (this.isEditing()) {
      const finalData: Question = { ...questionData, id: this.currentQuestionId()! };
      this.questionService.updateQuestion(finalData).subscribe(() => this.closeForm());
    } else {
      this.questionService.addQuestion(questionData).subscribe(() => this.closeForm());
    }
  }

  deleteQuestion(id: number) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.questionService.deleteQuestion(id).subscribe();
    }
  }
}
