import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';
import { TopicService } from '../../../services/topic.service';
import { ExerciseService } from '../../../services/exercise.service';
import { Lesson } from '../../../models/lesson.model';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lessons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonsComponent {
  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);
  private exerciseService = inject(ExerciseService);

  // Data sources
  private allLessons = this.lessonService.getLessons();
  allTopics = this.topicService.getTopics();
  
  // Filter options
  levelOptions: Lesson['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  statusOptions: Lesson['status'][] = ['Published', 'Draft'];

  // Filter state
  searchTerm = signal('');
  filterTopic = signal<string>('All');
  filterLevel = signal<string>('All');
  filterStatus = signal<string>('All');

  // Create maps for quick lookups
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

  filteredLessons = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const topicId = this.filterTopic();
    const level = this.filterLevel();
    const status = this.filterStatus();

    return this.allLessons().filter(lesson => 
      (lesson.title.toLowerCase().includes(term)) &&
      (topicId === 'All' || lesson.topicId === Number(topicId)) &&
      (level === 'All' || lesson.level === level) &&
      (status === 'All' || lesson.status === status)
    );
  });

  getTopicName(topicId: number): string {
    return this.topicsMap().get(topicId) || 'N/A';
  }

  getExerciseName(exerciseId?: number): string {
    return exerciseId ? this.exercisesMap().get(exerciseId) || 'N/A' : 'None';
  }

  deleteLesson(id: number) {
    if (confirm('Are you sure you want to delete this lesson?')) {
      this.lessonService.deleteLesson(id).subscribe();
    }
  }
}