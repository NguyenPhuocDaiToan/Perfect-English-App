import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopicService } from '../../../services/topic.service';
import { Topic } from '../../../models/topic.model';
import { filter, map, switchMap } from 'rxjs/operators';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SaveButtonComponent, SelectComponent],
  templateUrl: './topic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicFormComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private location = inject(Location);

  topicForm: FormGroup;
  isEditing = signal(false);
  currentTopicId = signal<number | null>(null);
  saveState = signal<SaveButtonState>('idle');

  categoryOptions: Array<'Grammar' | 'Vocabulary' | 'Skills' | 'Writing' | 'Speaking'> = ['Grammar', 'Vocabulary', 'Skills', 'Writing', 'Speaking'];
  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

  categoryOptionsForSelect = computed(() => this.categoryOptions.map(o => ({ value: o, label: o })));
  statusOptionsForSelect = computed(() => this.statusOptions.map(o => ({ value: o, label: o })));

  constructor() {
    this.topicForm = this.fb.group({
      title: ['', Validators.required],
      category: ['Grammar', Validators.required],
      description: [''],
      status: ['Draft', Validators.required],
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null),
      map(id => Number(id)),
    ).subscribe(id => {
      this.isEditing.set(true);
      this.currentTopicId.set(id);
      const topic = this.topicService.getTopic(id)();
      if (topic) {
        this.topicForm.patchValue(topic);
      } else {
        // Handle topic not found, maybe navigate away
      }
    });
  }

  goBack() {
    this.location.back();
  }
  
  saveTopic() {
    if (this.topicForm.invalid || this.saveState() !== 'idle') return;

    this.saveState.set('loading');
    const saveObservable = this.isEditing() && this.currentTopicId() !== null
      ? this.topicService.updateTopic({ ...this.topicForm.value, id: this.currentTopicId()! })
      : this.topicService.addTopic(this.topicForm.value);

    saveObservable.subscribe({
      next: () => {
        this.saveState.set('success');
        setTimeout(() => {
          this.router.navigate(['/admin/topics']);
        }, 1500);
      },
      error: () => {
        this.saveState.set('idle');
        // Optionally: show an error message to the user
      }
    });
  }
}
