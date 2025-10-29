export interface Lesson {
  id: number;
  title: string;
  level: string;
  status: 'Published' | 'Draft';
  topicId: number;
  content: string;
  exerciseId?: number;
}
