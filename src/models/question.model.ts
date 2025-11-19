
export enum QuestionType {
  MCQ = 'Multiple Choice',
  MultiSelect = 'Multi-Select',
  FillBlank = 'Fill in the Blank',
  TrueFalse = 'True/False',
}

export interface McqOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  topic: 'Grammar' | 'Vocabulary' | 'Reading' | 'Listening';
  subTopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  options?: McqOption[]; // For MCQ and MultiSelect
  correctAnswer?: boolean; // For True/False
  correctAnswerText?: string; // For FillBlank
  explanation: string;
  tags: string[];
}
