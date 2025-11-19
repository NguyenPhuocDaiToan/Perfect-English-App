
export interface Lesson {
  id: number;
  title: string;
  level: string;
  status: 'Published' | 'Draft';
  topicIds: number[];
  content: string;
  exerciseId?: number;
  isPremium?: boolean; // Commercialization feature
}
