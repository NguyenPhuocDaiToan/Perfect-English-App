import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, Renderer2, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';

import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';
import { TopicService } from '../../services/topic.service';
import { LessonService } from '../../services/lesson.service';

import { BlogPost } from '../../models/blog-post.model';
import { User } from '../../models/user.model';
import { Topic } from '../../models/topic.model';
import { Lesson } from '../../models/lesson.model';

interface TocItem {
  level: number;
  text: string;
  id: string;
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostComponent {
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private userService = inject(UserService);
  private topicService = inject(TopicService);
  private lessonService = inject(LessonService);
  private titleService: Title = inject(Title);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  author = signal<User | undefined>(undefined);
  relatedTopic = signal<Topic | undefined>(undefined);
  relatedLesson = signal<Lesson | undefined>(undefined);
  tableOfContents = signal<TocItem[]>([]);

  // Data for related posts
  allPosts = toSignal(this.blogService.getAllBlogPostsForSelect(), { initialValue: [] });
  allUsers = toSignal(this.userService.getAllUsersForSelect(), { initialValue: [] });

  private post$ = this.route.paramMap.pipe(
    map(params => params.get('slug')!),
    switchMap(slug => this.blogService.getBlogPostBySlug(slug)),
    tap(foundPost => {
      if (foundPost) {
        this.titleService.setTitle(`${foundPost.title} | Perfect English Grammar`);
        // If creator is populated (object) use it, if not (string ID) search in list
        const creatorId = typeof (foundPost as any).createdBy === 'string' ? (foundPost as any).createdBy : (foundPost as any).createdBy?.id;
        this.author.set(this.allUsers().find(u => u.id === creatorId));

        if (foundPost.topic) {
          const topic = typeof foundPost.topic === 'string' ? foundPost.topic : foundPost.topic?.id;
          this.topicService.getTopic(topic).subscribe(t => this.relatedTopic.set(t));
        }
        if (foundPost.lesson) {
          const lessonId = typeof foundPost.lesson === 'string' ? foundPost.lesson : foundPost.lesson?.id;
          this.lessonService.getLesson(lessonId).subscribe(l => this.relatedLesson.set(l));
        }

        // Generate ToC after a brief delay to allow content to render
        setTimeout(() => this.generateToc(foundPost.content), 0);
      } else {
        this.titleService.setTitle('Post Not Found | Perfect English Grammar');
      }
    })
  );

  post = toSignal(this.post$);

  relatedPosts = computed(() => {
    const currentPost = this.post();
    if (!currentPost) return [];

    return this.allPosts()
      .filter(p =>
        p.id !== currentPost.id &&
        p.status === 'Published' &&
        (p.topic === currentPost.topic || p.tags.some(tag => currentPost.tags.includes(tag)))
      )
      .slice(0, 2);
  });

  constructor() {
    // Subscription handled by toSignal(post$)
  }

  private generateToc(content: string) {
    if (typeof document === 'undefined') return;

    const tempEl = this.renderer.createElement('div');
    tempEl.innerHTML = content;
    const headings = tempEl.querySelectorAll('h2, h3');
    const toc: TocItem[] = [];

    headings.forEach((heading: HTMLElement, index: number) => {
      const text = heading.textContent || '';
      const level = heading.tagName === 'H2' ? 1 : 2;
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + `-${index}`;

      heading.setAttribute('id', id); // This won't affect the rendered DOM, need to do it post-render
      toc.push({ level, text, id });
    });

    this.tableOfContents.set(toc);

    // After content is set via [innerHTML], we need to add IDs to the actual DOM elements
    setTimeout(() => {
      const contentEl = this.el.nativeElement.querySelector('.prose');
      if (contentEl) {
        const renderedHeadings = contentEl.querySelectorAll('h2, h3');
        renderedHeadings.forEach((heading: HTMLElement, index: number) => {
          const item = this.tableOfContents()[index];
          if (item) {
            heading.setAttribute('id', item.id);
          }
        });
      }
    }, 100);
  }

  scrollTo(id: string, event: Event) {
    event.preventDefault();
    if (typeof document !== 'undefined') {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
