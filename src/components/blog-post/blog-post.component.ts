import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
// FIX: Import Title service from '@angular/platform-browser' instead of '@angular/common'
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';
import { BlogPost } from '../../models/blog-post.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-post.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostComponent {
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private userService = inject(UserService);
  // FIX: Explicitly type Title service to prevent type inference issues.
  private titleService: Title = inject(Title);

  post = signal<BlogPost | undefined>(undefined);
  author = signal<User | undefined>(undefined);
  
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
      .slice(0, 3);
  });
  
  constructor() {
    this.slug$.subscribe(slug => {
        const foundPost = this.blogService.getBlogPostBySlug(slug)();
        this.post.set(foundPost);

        if (foundPost) {
            const foundAuthor = this.userService.getUsers()().find(u => u.id === foundPost.authorId);
            this.author.set(foundAuthor);
            this.titleService.setTitle(`${foundPost.title} | Perfect English Grammar`);
        } else {
             this.titleService.setTitle('Post Not Found | Perfect English Grammar');
        }
    });
  }
}
