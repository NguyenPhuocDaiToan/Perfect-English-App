
import { CEFRLevel, PublishStatus } from './constants';

import { Topic } from './topic.model';
import { Exercise } from './exercise.model';

export interface Lesson {
  id: string;
  title: string;
  level: CEFRLevel;
  status: PublishStatus;
  topics: (string | Topic)[];
  content: string;
  exercise?: string | Exercise | null;
  isPremium?: boolean; // Commercialization feature
}
