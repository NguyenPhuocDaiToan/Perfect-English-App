
import { PublishStatus } from './constants';

import { User } from './user.model';
import { Topic } from './topic.model';
import { Lesson } from './lesson.model';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  createdBy: string | User;
  topic?: string | Topic;
  lesson?: string | Lesson;
  tags: string[];
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}
