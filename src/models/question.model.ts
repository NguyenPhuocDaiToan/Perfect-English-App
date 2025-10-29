export enum QuestionType {
  MCQ = 'Multiple Choice',
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
  options?: McqOption[]; // For MCQ
  correctAnswer?: boolean; // For True/False
  explanation: string;
  tags: string[];
}
