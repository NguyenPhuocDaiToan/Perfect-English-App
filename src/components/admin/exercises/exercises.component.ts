import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../../services/exercise.service';
import { LessonService } from '../../../services/lesson.service';
import { TopicService } from '../../../services/topic.service';
import { Exercise } from '../../../models/exercise.model';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
  private exerciseService = inject(ExerciseService);
  private lessonService = inject(LessonService);
  private topicService = inject(TopicService);

  // Data sources
  private allExercises = this.exerciseService.getExercises();
  allTopics = this.topicService.getTopics();
  
  // Filter options
  difficultyOptions: Exercise['difficulty'][] = ['Easy', 'Medium', 'Hard'];
  statusOptions: Exercise['status'][] = ['Published', 'Draft'];
  
  // Filter state
  searchTerm = signal('');
  filterTopic = signal<string>('All');
  filterDifficulty = signal<string>('All');
  filterStatus = signal<string>('All');

  private lessonsMap = computed(() => {
    const map = new Map<number, string>();
    this.lessonService.getLessons()().forEach(l => map.set(l.id, l.title));
    return map;
  });

  filteredExercises = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const topicId = this.filterTopic();
    const difficulty = this.filterDifficulty();
    const status = this.filterStatus();

    return this.allExercises().filter(ex => 
      (ex.title.toLowerCase().includes(term)) &&
      (topicId === 'All' || ex.topicId === Number(topicId)) &&
      (difficulty === 'All' || ex.difficulty === difficulty) &&
      (status === 'All' || ex.status === status)
    );
  });

  getLessonName(lessonId?: number): string {
    return lessonId ? this.lessonsMap().get(lessonId) || 'N/A' : 'None';
  }

  deleteExercise(id: number) {
    if (confirm('Are you sure you want to delete this exercise?')) {
      this.exerciseService.deleteExercise(id).subscribe();
    }
  }
}