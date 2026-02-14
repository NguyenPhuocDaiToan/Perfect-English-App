
import { TopicCategory, PublishStatus } from './constants';

export interface Topic {
  id: string;
  title: string;
  category: TopicCategory;
  description: string;
  status: PublishStatus;
}
