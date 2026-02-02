
import { CEFRLevel, PublishStatus } from './constants';

export interface Lesson {
  id: number;
  title: string;
  level: CEFRLevel;
  status: PublishStatus;
  topicIds: number[];
  content: string;
  exerciseId?: number;
  isPremium?: boolean; // Commercialization feature
}
