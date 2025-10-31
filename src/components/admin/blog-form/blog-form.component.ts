import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
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
import { SelectComponent } from '../../shared/select/select.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent, SelectComponent, CKEditorModule],
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
  public Editor = ClassicEditor;

  // Data for select dropdowns
  allTopics = this.topicService.getTopics();
  allLessons = this.lessonService.getLessons();
  allUsers = this.userService.getUsers();

  statusOptions: Array<'Draft' | 'Published'> = ['Draft', 'Published'];

  // Computed options for SelectComponent
  topicOptions = computed(() => this.allTopics().map(t => ({ value: t.id, label: t.title })));
  lessonOptions = computed(() => this.allLessons().map(l => ({ value: l.id, label: l.title })));
  authorOptions = computed(() => this.allUsers().map(u => ({ value: u.id, label: u.name })));
  statusOptionsForSelect = computed(() => this.statusOptions.map(o => ({ value: o, label: o })));

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