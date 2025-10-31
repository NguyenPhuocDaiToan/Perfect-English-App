import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LessonService } from '../../../services/lesson.service';
import { TopicService } from '../../../services/topic.service';
import { ExerciseService } from '../../../services/exercise.service';
import { Lesson } from '../../../models/lesson.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, ReactiveFormsModule, SelectComponent],
  templateUrl: './lessons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonsComponent {
  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);
  private exerciseService = inject(ExerciseService);

  // Component State
  lessons = signal<Lesson[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalResults = signal(0);
  
  // Data sources for filters
  allTopics = this.topicService.getTopics();
  
  // Filter options
  levelOptions: Lesson['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  statusOptions: Lesson['status'][] = ['Published', 'Draft'];
  
  // Computed options for SelectComponent
  topicOptions = computed(() => [{ value: 'All', label: 'All Topics' }, ...this.allTopics().map(t => ({ value: t.id.toString(), label: t.title }))]);
  levelOptionsForSelect = computed(() => [{ value: 'All', label: 'All Levels' }, ...this.levelOptions.map(o => ({ value: o, label: o }))]);
  statusOptionsForSelect = computed(() => [{ value: 'All', label: 'All Statuses' }, ...this.statusOptions.map(o => ({ value: o, label: o }))]);


  // Filter state (now with FormControls)
  searchTerm = signal('');
  filterTopicControl = new FormControl('All');
  filterLevelControl = new FormControl('All');
  filterStatusControl = new FormControl('All');
  
  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.lessons().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const topicId = this.filterTopicControl.value ?? 'All';
      const level = this.filterLevelControl.value ?? 'All';
      const status = this.filterStatusControl.value ?? 'All';
      untracked(() => this.fetchLessons(page, { searchTerm: term, topicId, level, status }));
    }, { allowSignalWrites: true });
  }

  private fetchLessons(page: number, filters: { searchTerm: string, topicId: string, level: string, status: string }) {
    this.status.set('loading');
    this.lessonService.getPaginatedLessons(page, this.pageSize(), filters).subscribe({
      next: response => {
        this.lessons.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.currentPage.set(response.page);
        this.status.set('loaded');
      },
      error: () => this.status.set('error')
    });
  }

  onSearchTermChange(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }
  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
  }

  private topicsMap = computed(() => {
    const map = new Map<number, string>();
    this.allTopics().forEach(topic => map.set(topic.id, topic.title));
    return map;
  });
  
  private exercisesMap = computed(() => {
    const map = new Map<number, string>();
    this.exerciseService.getExercises()().forEach(ex => map.set(ex.id, ex.title));
    return map;
  });

  getTopicNames(topicIds: number[]): string {
    if (!topicIds || topicIds.length === 0) return 'N/A';
    return topicIds
      .map(id => this.topicsMap().get(id) || '')
      .filter(name => name)
      .join(', ');
  }

  getExerciseName(exerciseId?: number): string {
    return exerciseId ? this.exercisesMap().get(exerciseId) || 'N/A' : 'None';
  }

  deleteLesson(id: number) {
    if (confirm('Are you sure you want to delete this lesson?')) {
      this.lessonService.deleteLesson(id).subscribe(() => {
        if (this.lessons().length === 1 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        } else {
            this.fetchLessons(this.currentPage(), { 
                searchTerm: this.searchTerm(), 
                topicId: this.filterTopicControl.value ?? 'All', 
                level: this.filterLevelControl.value ?? 'All', 
                status: this.filterStatusControl.value ?? 'All'
            });
        }
      });
    }
  }
}
