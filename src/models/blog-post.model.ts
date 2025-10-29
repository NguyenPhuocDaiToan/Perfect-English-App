export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  authorId: number;
  topicId?: number;
  lessonId?: number;
  tags: string[];
  status: 'Draft' | 'Published';
  createdAt: string;
  updatedAt: string;
}
