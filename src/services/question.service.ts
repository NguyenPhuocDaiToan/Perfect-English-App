
import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Question, QuestionType } from '../models/question.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questions = signal<Question[]>([
    {
      id: 1,
      type: QuestionType.MCQ,
      topic: 'Grammar',
      subTopic: 'Present Simple',
      difficulty: 'Easy',
      questionText: 'He _____ to the store every day.',
      options: [
        { text: 'go', isCorrect: false },
        { text: 'goes', isCorrect: true },
        { text: 'is going', isCorrect: false },
        { text: 'went', isCorrect: false }
      ],
      explanation: 'For third person singular (he, she, it), we add -s or -es to the base verb in Present Simple.',
      tags: ['tenses', 'present-simple']
    },
    {
      id: 2,
      type: QuestionType.FillBlank,
      topic: 'Vocabulary',
      subTopic: 'Travel',
      difficulty: 'Easy',
      questionText: 'A document you need to enter another country is a _____.',
      correctAnswerText: 'passport',
      explanation: 'A passport is an official document issued by a government, certifying the holder\'s identity and citizenship.',
      tags: ['travel', 'documents']
    },
    {
      id: 3,
      type: QuestionType.TrueFalse,
      topic: 'Grammar',
      subTopic: 'Conditionals',
      difficulty: 'Medium',
      questionText: 'The sentence "If I were you, I would go" is grammatically correct.',
      correctAnswer: true,
      explanation: 'This is a correct example of the second conditional, used for hypothetical situations.',
      tags: ['conditionals', 'subjunctive']
    },
    {
      id: 4,
      type: QuestionType.MCQ,
      topic: 'Grammar',
      subTopic: 'Prepositions',
      difficulty: 'Medium',
      questionText: 'She is interested _____ learning Spanish.',
      options: [
        { text: 'in', isCorrect: true },
        { text: 'on', isCorrect: false },
        { text: 'at', isCorrect: false },
        { text: 'about', isCorrect: false }
      ],
      explanation: 'The verb "interested" is followed by the preposition "in".',
      tags: ['prepositions']
    },
    {
      id: 5,
      type: QuestionType.MultiSelect,
      topic: 'Grammar',
      subTopic: 'Nouns',
      difficulty: 'Medium',
      questionText: 'Select all the uncountable nouns from the list below.',
      options: [
        { text: 'Information', isCorrect: true },
        { text: 'Chair', isCorrect: false },
        { text: 'Water', isCorrect: true },
        { text: 'Apple', isCorrect: false },
        { text: 'Advice', isCorrect: true }
      ],
      explanation: 'Information, Water, and Advice are uncountable nouns. Chair and Apple are countable.',
      tags: ['nouns', 'countable-uncountable']
    }
  ]);

  private nextId = signal(6);

  getPaginatedQuestions(
    page: number, 
    limit: number, 
    filters: { searchTerm: string, topic: string, type: string, difficulty: string }
  ): Observable<PaginatedResponse<Question>> {

    const allQuestions = this.questions();

    const filtered = allQuestions.filter(q => {
      const termMatch = filters.searchTerm 
        ? q.questionText.toLowerCase().includes(filters.searchTerm.toLowerCase()) || q.subTopic.toLowerCase().includes(filters.searchTerm.toLowerCase())
        : true;
      const topicMatch = filters.topic === 'All' ? true : q.topic === filters.topic;
      const typeMatch = filters.type === 'All' ? true : q.type === filters.type;
      const difficultyMatch = filters.difficulty === 'All' ? true : q.difficulty === filters.difficulty;
      return termMatch && topicMatch && typeMatch && difficultyMatch;
    });

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    const response: PaginatedResponse<Question> = {
      results,
      page,
      limit,
      totalPages,
      totalResults
    };

    return of(response).pipe(delay(300));
  }

  getQuestions() {
    return computed(() => this.questions());
  }
  
  getQuestionByIds(ids: number[]) {
    return computed(() => this.questions().filter(q => ids.includes(q.id)));
  }

  addQuestion(question: Omit<Question, 'id'>): Observable<Question> {
    const newQuestion: Question = { ...question, id: this.nextId() };
    this.questions.update(questions => [...questions, newQuestion]);
    this.nextId.update(id => id + 1);
    return of(newQuestion).pipe(delay(500));
  }

  updateQuestion(updatedQuestion: Question): Observable<Question> {
    this.questions.update(questions =>
      questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
    return of(updatedQuestion).pipe(delay(500));
  }

  deleteQuestion(id: number): Observable<{}> {
    this.questions.update(questions => questions.filter(q => q.id !== id));
    return of({}).pipe(delay(500));
  }
}
