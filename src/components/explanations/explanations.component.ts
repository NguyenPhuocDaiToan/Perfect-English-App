import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { LessonService } from '../../services/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { Topic } from '../../models/topic.model';

type TopicCategory = Topic['category'];
type FilterCategory = 'All' | TopicCategory;

interface DisplayLesson extends Lesson {
  completionStatus: 'Completed' | 'In Progress' | 'Not Started';
}

interface DisplayTopic extends Topic {
  lessons: DisplayLesson[];
}

@Component({
  selector: 'app-explanations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './explanations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplanationsComponent {
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);

  private allTopics = this.topicService.getTopics();
  private allLessons = this.lessonService.getLessons();

  // State for accordion
  selectedTopicId = signal<number | null>(null);

  // State for filtering
  categories: FilterCategory[] = ['All', 'Grammar', 'Vocabulary', 'Writing', 'Speaking'];
  selectedCategory = signal<FilterCategory>('All');

  filteredTopicsWithLessons = computed<DisplayTopic[]>(() => {
    const category = this.selectedCategory();
    return this.allTopics()
      .filter(topic => topic.status === 'Published' && (category === 'All' || topic.category === category))
      .map(topic => ({
        ...topic,
        lessons: this.allLessons()
          .filter(lesson => lesson.topicId === topic.id && lesson.status === 'Published')
          .map((lesson, index): DisplayLesson => {
            const statusCycle = index % 3;
            let completionStatus: 'Completed' | 'In Progress' | 'Not Started';
            if (statusCycle === 0) {
              completionStatus = 'Completed';
            } else if (statusCycle === 1) {
              completionStatus = 'In Progress';
            } else {
              completionStatus = 'Not Started';
            }
            return { ...lesson, completionStatus };
          })
      }));
  });

  selectCategory(category: FilterCategory) {
    this.selectedCategory.set(category);
    this.selectedTopicId.set(null); // Close any open accordion
  }

  toggleTopic(topicId: number) {
    this.selectedTopicId.update(currentId => (currentId === topicId ? null : topicId));
  }

  getIconForCategory(category: string): string {
    switch (category.toLowerCase()) {
      case 'grammar':
        return '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />';
      case 'vocabulary':
        return '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-5.197-5.197" />';
      case 'writing':
        return '<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />';
      case 'speaking':
        return '<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 12.75a3 3 0 013-3v-1.5a3 3 0 00-6 0v1.5a3 3 0 013 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a9 9 0 009-9v-1.5a9 9 0 00-18 0v1.5a9 9 0 009 9z" />';
      default:
        return '<path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.108-3.935a11.998 11.998 0 00-3.41-2.573-11.998 11.998 0 00-3.41 2.573m5.108 3.935a11.995 11.995 0 01-4.862-2.348" />';
    }
  }
}
