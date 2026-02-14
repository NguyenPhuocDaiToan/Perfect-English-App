
import { DifficultyLevel, PublishStatus } from './constants';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  timeLimit: number; // in minutes
  questions: string[];
  status: PublishStatus;
  topics?: string[];
  lessons?: string[];
  isPremium?: boolean; // Monetization feature
}
