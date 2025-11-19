
export interface Exercise {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in minutes
  questionIds: number[];
  status: 'Draft' | 'Published';
  topicIds?: number[];
  lessonIds?: number[];
  isPremium?: boolean; // Monetization feature
}
