
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, GrammarTopic } from '../../services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent {
    private dataService = inject(DataService);
    topics$: Observable<GrammarTopic[]> = this.dataService.getGrammarTopics();
}
