export interface Topic {
  id: number;
  title: string;
  category: 'Grammar' | 'Vocabulary' | 'Skills';
  description: string;
  status: 'Draft' | 'Published';
}
