
import { DifficultyLevel, PublishStatus } from './constants';

export interface Exercise {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  timeLimit: number; // in minutes
  questionIds: number[];
  status: PublishStatus;
  topicIds?: number[];
  lessonIds?: number[];
  isPremium?: boolean; // Monetization feature
}
