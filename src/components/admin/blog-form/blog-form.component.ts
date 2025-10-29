import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter } from 'rxjs/operators';

import { BlogService } from '../../../services/blog.service';
import { BlogPost } from '../../../models/blog-post.model';
import { TopicService } from '../../../services/topic.service';
import { LessonService } from '../../../services/lesson.service';
import { UserService } from '../../../services/user.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent],
  templateUrl: './blog-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogFormComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  private blogService = inject(BlogService);
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);
  private userService = inject(UserService);

  blogForm: FormGroup;
  isEditing = signal(false);
  currentPostId = signal<number | null>(null);
  saveState = signal<SaveButtonState>('idle');

  // Data for select dropdowns
  allTopics = this.topicService.getTopics();
  allLessons = this.lessonService.getLessons();
  allUsers = this.userService.getUsers();

  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

  constructor() {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      thumbnail: ['', Validators.required],
      authorId: [null, Validators.required],
      topicId: [null],
      lessonId: [null],
      tags: [''],
      status: ['Draft', Validators.required],
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null),
      map(id => Number(id)),
    ).subscribe(id => {
      this.isEditing.set(true);
      this.currentPostId.set(id);
      const post = this.blogService.getBlogPost(id)();
      if (post) {
        this.blogForm.patchValue({
          ...post,
          tags: post.tags.join(', ')
        });
      } else {
         this.router.navigate(['/admin/blog']);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  savePost() {
    if (this.blogForm.invalid || this.saveState() !== 'idle') return;

    this.saveState.set('loading');
    
    const formValue = this.blogForm.value;
    const postData = {
      ...formValue,
      tags: formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t),
    };

    const saveObservable = this.isEditing() && this.currentPostId() !== null
      ? this.blogService.updateBlogPost({ ...postData, id: this.currentPostId()! })
      : this.blogService.addBlogPost(postData);

    saveObservable.subscribe({
      next: () => {
        this.saveState.set('success');
        setTimeout(() => {
          this.router.navigate(['/admin/blog']);
        }, 1500);
      },
      error: () => {
        this.saveState.set('idle');
      }
    });
  }
}
