export interface Topic {
  id: number;
  title: string;
  category: 'Grammar' | 'Vocabulary' | 'Skills' | 'Writing' | 'Speaking';
  description: string;
  status: 'Draft' | 'Published';
}
