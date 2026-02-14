
import { TopicCategory, PublishStatus } from './constants';

export interface Topic {
  id: number;
  title: string;
  category: TopicCategory;
  description: string;
  status: PublishStatus;
}
