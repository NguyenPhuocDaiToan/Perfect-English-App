import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Lesson {
  id: number;
  title: string;
  level: string;
  status: 'Published' | 'Draft';
}

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lessons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonsComponent {
  lessons = signal<Lesson[]>([
    { id: 1, title: 'Present Simple Tense', level: 'A1', status: 'Published' },
    { id: 2, title: 'Past Continuous Tense', level: 'A2', status: 'Published' },
    { id: 3, title: 'First Conditional', level: 'B1', status: 'Published' },
    { id: 4, title: 'Reported Speech', level: 'B2', status: 'Draft' },
    { id: 5, title: 'Passive Voice Advanced', level: 'C1', status: 'Published' },
  ]);
}
