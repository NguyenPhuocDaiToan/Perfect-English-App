
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DataService, GrammarTopic } from '../../services/data.service';

@Component({
  selector: 'app-explanations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explanations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplanationsComponent {
  private dataService = inject(DataService);
  topics$: Observable<GrammarTopic[]> = this.dataService.getGrammarTopics();
}
