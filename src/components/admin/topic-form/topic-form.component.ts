import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopicService } from '../../../services/topic.service';
import { Topic } from '../../../models/topic.model';
import { filter, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './topic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private location = inject(Location);

  topicForm: FormGroup;
  isEditing = signal(false);
  currentTopicId = signal<number | null>(null);

  categoryOptions: Array<'Grammar' | 'Vocabulary' | 'Skills'> = ['Grammar', 'Vocabulary', 'Skills'];
  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

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
    if (this.topicForm.invalid) return;

    if (this.isEditing() && this.currentTopicId() !== null) {
      const updatedTopic: Topic = { ...this.topicForm.value, id: this.currentTopicId()! };
      this.topicService.updateTopic(updatedTopic).subscribe(() => {
        this.router.navigate(['/admin/topics']);
      });
    } else {
      this.topicService.addTopic(this.topicForm.value).subscribe(() => {
        this.router.navigate(['/admin/topics']);
      });
    }
  }
}
