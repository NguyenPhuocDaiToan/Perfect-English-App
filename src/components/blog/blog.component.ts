import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';
import { BlogPost } from '../../models/blog-post.model';

interface CategorizedPosts {
  category: string;
  posts: BlogPost[];
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogComponent {
  private blogService = inject(BlogService);
  private userService = inject(UserService);

  private publishedPosts = computed(() => 
    this.blogService.getBlogPosts()().filter(p => p.status === 'Published')
  );

  featuredPost = computed(() => this.publishedPosts()[0] || null);
  
  remainingPosts = computed(() => this.publishedPosts().slice(1));

  categorizedPosts = computed<CategorizedPosts[]>(() => {
    const categories: { [key: string]: BlogPost[] } = {};
    
    // Use a simple categorization for demonstration
    const categoryMap: {[key: string]: string} = {
      'grammar': 'Grammar Deep Dives',
      'tenses': 'Grammar Deep Dives',
      'conditionals': 'Grammar Deep Dives',
      'vocabulary': 'Vocabulary & Skills',
      'travel': 'Vocabulary & Skills',
    };

    for (const post of this.remainingPosts()) {
      const primaryTag = post.tags[0] || 'general';
      const categoryName = categoryMap[primaryTag] || 'General Topics';
      
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(post);
    }

    return Object.entries(categories).map(([category, posts]) => ({ category, posts }));
  });

  private usersMap = computed(() => {
    const map = new Map<number, string>();
    this.userService.getUsers()().forEach(user => map.set(user.id, user.name));
    return map;
  });

  getAuthorName(authorId: number): string {
    return this.usersMap().get(authorId) || 'Unknown';
  }
}
