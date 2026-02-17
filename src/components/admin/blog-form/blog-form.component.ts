
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter } from 'rxjs/operators';

import { BlogService } from '../../../services/blog.service';
import { TopicService } from '../../../services/topic.service';
import { LessonService } from '../../../services/lesson.service';
import { ToastService } from '../../../services/toast.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { SelectComponent } from '../../shared/select/select.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { PUBLISH_STATUSES } from '../../../models/constants';
import { CustomUploadAdapter } from '../../../utils/ckeditor-upload-adapter';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent, SelectComponent, CKEditorModule],
  templateUrl: './blog-form.component.html',
  styles: [
    `
    :host ::ng-deep .ck-editor__editable_inline {
      min-height: 400px;
      border: 1px solid #cbd5e1;
      /* slate-300 */
      border-radius: 0 0 0.5rem 0.5rem;
      --ck-focus-ring: 2px solid rgb(var(--primary-500) / 0.2);
      --ck-focus-border: 1px solid rgb(var(--primary-500));
    }

    :host ::ng-deep .ck-editor__top .ck-sticky-panel .ck-toolbar {
      border-radius: 0.5rem 0.5rem 0 0;
      border-color: #cbd5e1;
    }
    `
  ],
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
  private toastService = inject(ToastService);
  private fileService = inject(FileService);

  blogForm: FormGroup;
  isEditing = signal(false);
  currentPostId = signal<string | null>(null);
  saveState = signal<SaveButtonState>('idle');
  public Editor = ClassicEditor;

  // Data for select dropdowns
  allTopics = toSignal(this.topicService.getAllTopicsForSelect(), { initialValue: [] });
  allLessons = toSignal(this.lessonService.getAllLessonsForSelect(), { initialValue: [] });

  statusOptions = PUBLISH_STATUSES;

  // Computed options for SelectComponent
  topicOptions = computed(() => this.allTopics().map(t => ({ value: t.id, label: t.title })));
  lessonOptions = computed(() => this.allLessons().map(l => ({ value: l.id, label: l.title })));
  statusOptionsForSelect = computed(() => this.statusOptions.map(o => ({ value: o, label: o })));

  constructor() {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      thumbnail: ['', Validators.required],
      topic: [null],
      lesson: [null],
      tags: [''],
      status: ['Draft', Validators.required],
    });

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null)
    ).subscribe(id => {
      this.isEditing.set(true);
      this.currentPostId.set(id!);
      this.blogService.getBlogPost(id!).subscribe({
        next: (post) => {
          this.blogForm.patchValue({
            ...post,
            tags: post.tags?.join(', ') || ''
          });
        },
        error: () => {
          this.toastService.show('Post not found', 'error');
          this.router.navigate(['/admin/blog']);
        }
      });
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
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
    };

    const saveObservable = this.isEditing() && this.currentPostId() !== null
      ? this.blogService.updateBlogPost({ ...postData, id: this.currentPostId()! })
      : this.blogService.addBlogPost(postData);

    saveObservable.subscribe({
      next: () => {
        this.toastService.show(this.isEditing() ? 'Post updated successfully' : 'Post created successfully', 'success');
        this.router.navigate(['/admin/blog']);
      },
      error: () => {
        this.saveState.set('idle');
        this.toastService.show('Failed to save post', 'error');
      }
    });
  }

  onReady(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new CustomUploadAdapter(loader, this.fileService);
    };
  }
}
