import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';
import { TopicService } from '../../services/topic.service';
import { Exercise } from '../../models/exercise.model';

interface DisplayTopic {
  id: number;
  title: string;
  category: string;
  description: string;
  exercises: Exercise[];
}

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
    private exerciseService = inject(ExerciseService);
    private topicService = inject(TopicService);

    private allTopics = this.topicService.getTopics();
    private allExercises = this.exerciseService.getExercises();

    selectedTopicId = signal<number | null>(null);

    // Combine topics with their published exercises for the view
    topicsWithExercises = computed<DisplayTopic[]>(() => {
        return this.allTopics()
            .filter(topic => topic.status === 'Published')
            .map(topic => ({
                ...topic,
                exercises: this.allExercises().filter(ex => ex.topicId === topic.id && ex.status === 'Published')
            }))
            .filter(topic => topic.exercises.length > 0); // Only show topics that have exercises
    });

    toggleTopic(topicId: number) {
        this.selectedTopicId.update(currentId => (currentId === topicId ? null : topicId));
    }

    // Helper to get an icon based on topic category
    getIconForCategory(category: string): string {
        switch (category.toLowerCase()) {
        case 'grammar':
            return '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />';
        case 'vocabulary':
            return '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-5.197-5.197" />';
        case 'skills':
            return '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />';
        default:
            return '<path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.108-3.935a11.998 11.998 0 00-3.41-2.573-11.998 11.998 0 00-3.41 2.573m5.108 3.935a11.995 11.995 0 01-4.862-2.348" />';
        }
    }
}
