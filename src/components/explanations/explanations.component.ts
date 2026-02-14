
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { LessonService } from '../../services/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { Topic } from '../../models/topic.model';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { TOPIC_CATEGORIES, TopicCategory } from '../../models/constants';

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
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './explanations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplanationsComponent {
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);

  // Component State
  topics = signal<DisplayTopic[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Accordion State
  selectedTopicId = signal<string | null>(null);

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(5);
  totalPages = signal(0);
  totalResults = signal(0);

  // Filtering State
  categories: FilterCategory[] = ['All', ...TOPIC_CATEGORIES];
  selectedCategory = signal<FilterCategory>('All');

  private allLessons = toSignal(this.lessonService.getAllLessonsForSelect(), { initialValue: [] });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const category = this.selectedCategory();
      untracked(() => this.fetchTopics(page, category));
    });
  }

  private fetchTopics(page: number, category: FilterCategory) {
    this.status.set('loading');
    this.topicService.getPaginatedTopics(page, this.pageSize(), { category }).subscribe({
      next: response => {
        const displayTopics = this.combineWithLessons(response.results);
        this.topics.set(displayTopics);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.status.set('loaded');
      },
      error: () => this.status.set('error')
    });
  }

  private combineWithLessons(topics: Topic[]): DisplayTopic[] {
    const lessons = this.allLessons();
    return topics.map(topic => ({
      ...topic,
      lessons: lessons
        .filter(lesson => lesson.topics.includes(topic.id) && lesson.status === 'Published')
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
  }

  selectCategory(category: FilterCategory) {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.selectedTopicId.set(null); // Close any open accordion
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.selectedTopicId.set(null);
    document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleTopic(topic: string) {
    this.selectedTopicId.update(currentId => (currentId === topic ? null : topic));
  }
}
