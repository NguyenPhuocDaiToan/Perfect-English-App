import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../../services/topic.service';
import { LessonService } from '../../../services/lesson.service';
import { ExerciseService } from '../../../services/exercise.service';
import { Topic } from '../../../models/topic.model';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsComponent {
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);
  private exerciseService = inject(ExerciseService);

  // Data sources
  private allTopics = this.topicService.getTopics();
  private allLessons = this.lessonService.getLessons();
  private allExercises = this.exerciseService.getExercises();

  // Filter options
  categoryOptions: Array<Topic['category']> = ['Grammar', 'Vocabulary', 'Skills'];
  statusOptions: Array<Topic['status']> = ['Draft', 'Published'];
  
  // Filter state
  searchTerm = signal('');
  filterCategory = signal<string>('All');
  filterStatus = signal<string>('All');

  filteredTopics = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.filterCategory();
    const status = this.filterStatus();

    return this.allTopics().filter(topic => 
      (topic.title.toLowerCase().includes(term) || topic.description.toLowerCase().includes(term)) &&
      (category === 'All' || topic.category === category) &&
      (status === 'All' || topic.status === status)
    );
  });

  getLessonCount = (topicId: number) => computed(() => this.allLessons().filter(l => l.topicId === topicId).length);
  getExerciseCount = (topicId: number) => computed(() => this.allExercises().filter(e => e.topicId === topicId).length);

  deleteTopic(id: number) {
    if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
        // You might want to add logic here to check if lessons or exercises are attached
        this.topicService.deleteTopic(id).subscribe();
    }
  }
}