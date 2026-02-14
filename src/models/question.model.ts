
import { DifficultyLevel, QuestionTopic } from './constants';

export enum QuestionType {
  MCQ = 'MCQ',
  MultiSelect = 'MultiSelect',
  FillBlank = 'FillBlank',
  TrueFalse = 'TrueFalse',
}

export interface McqOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  topic: QuestionTopic;
  subTopic: string;
  difficulty: DifficultyLevel;
  questionText: string;
  options?: McqOption[]; // For MCQ and MultiSelect
  correctAnswer?: boolean; // For True/False
  correctAnswerText?: string; // For FillBlank
  explanation: string;
  tags: string[];
}
