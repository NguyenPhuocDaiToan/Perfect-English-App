import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

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

  post = signal<BlogPost | undefined>(undefined);
  author = signal<User | undefined>(undefined);
  relatedTopic = signal<Topic | undefined>(undefined);
  relatedLesson = signal<Lesson | undefined>(undefined);
  tableOfContents = signal<TocItem[]>([]);
  
  private slug$ = this.route.paramMap.pipe(map(params => params.get('slug')!));
  
  relatedPosts = computed(() => {
    const currentPost = this.post();
    if (!currentPost) return [];
    
    return this.blogService.getBlogPosts()()
      .filter(p => 
        p.id !== currentPost.id && 
        p.status === 'Published' &&
        (p.topicId === currentPost.topicId || p.tags.some(tag => currentPost.tags.includes(tag)))
      )
      .slice(0, 2);
  });
  
  constructor() {
    this.slug$.subscribe(slug => {
        const foundPost = this.blogService.getBlogPostBySlug(slug)();
        this.post.set(foundPost);

        if (foundPost) {
            this.titleService.setTitle(`${foundPost.title} | Perfect English Grammar`);
            this.author.set(this.userService.getUsers()().find(u => u.id === foundPost.authorId));
            
            if (foundPost.topicId) {
                this.relatedTopic.set(this.topicService.getTopic(foundPost.topicId)());
            }
            if (foundPost.lessonId) {
                this.relatedLesson.set(this.lessonService.getLesson(foundPost.lessonId)());
            }

            // Generate ToC after a brief delay to allow content to render
            setTimeout(() => this.generateToc(foundPost.content), 0);
        } else {
             this.titleService.setTitle('Post Not Found | Perfect English Grammar');
        }
    });
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
