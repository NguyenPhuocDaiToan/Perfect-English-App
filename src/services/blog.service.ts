import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BlogPost } from '../models/blog-post.model';
import { PaginatedResponse } from '../models/paginated-response.model';

const slugify = (text: string) => 
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private posts = signal<BlogPost[]>([
    {
      id: 1,
      title: 'Mastering the Present Perfect Tense',
      slug: 'mastering-the-present-perfect-tense',
      content: `
        <h2 class="text-2xl font-bold mb-4">What is the Present Perfect?</h2>
        <p class="mb-4">The present perfect tense is one of the most common tenses in English. It is used to talk about actions that started in the past and continue to the present, or actions that happened at an unspecified time in the past but have relevance to the present.</p>
        <h3 class="text-xl font-semibold mb-2">Form:</h3>
        <p class="mb-4">The structure is <code>have/has + past participle</code>.</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li>I <strong>have seen</strong> that movie.</li>
          <li>She <strong>has finished</strong> her homework.</li>
        </ul>
        <p>We often use it with words like <strong>for</strong>, <strong>since</strong>, <strong>already</strong>, <strong>yet</strong>, and <strong>just</strong>.</p>
        <img src="https://picsum.photos/seed/article1/800/400" alt="Grammar book" class="rounded-lg my-6">
        <p>Understanding this tense is crucial for sounding natural in English conversation.</p>
      `,
      excerpt: 'A deep dive into one of the most common and often confusing tenses in English. Learn when and how to use it correctly.',
      thumbnail: 'https://picsum.photos/seed/blog1/600/400',
      authorId: 4, // David P.
      topicId: 1,
      tags: ['tenses', 'grammar', 'b1'],
      status: 'Published',
      createdAt: '2023-10-26',
      updatedAt: '2023-10-27',
    },
    {
      id: 2,
      title: '10 Essential Vocabulary Words for Traveling',
      slug: '10-essential-vocabulary-words-for-traveling',
      content: `
        <h2 class="text-2xl font-bold mb-4">Travel with Confidence</h2>
        <p class="mb-4">Learning a few key phrases can make your travels much smoother. Here are 10 words and phrases that are essential for any traveler.</p>
        <ol class="list-decimal list-inside mb-4 space-y-3">
          <li><strong>Booking / Reservation:</strong> An arrangement you make to have a hotel room, a table at a restaurant, etc.</li>
          <li><strong>Itinerary:</strong> A detailed plan or route of a journey.</li>
          <li><strong>Accommodation:</strong> A place to live, work, stay, etc. in.</li>
          <li><strong>Check-in / Check-out:</strong> The process of arriving at and leaving a hotel.</li>
          <li><strong>Boarding Pass:</strong> A card that a passenger must have to be allowed to get on an aircraft.</li>
        </ol>
      `,
      excerpt: 'Planning a trip? Make sure you know these essential English words to help you navigate airports, hotels, and more.',
      thumbnail: 'https://picsum.photos/seed/blog2/600/400',
      authorId: 2, // Maria S.
      topicId: 3,
      tags: ['vocabulary', 'travel', 'a2'],
      status: 'Published',
      createdAt: '2023-11-05',
      updatedAt: '2023-11-05',
    },
    {
      id: 3,
      title: 'Understanding English Conditionals',
      slug: 'understanding-english-conditionals',
      content: '<h2>Zero, First, Second, Third, and Mixed</h2><p>Conditionals can be tricky! This guide will break down each type with clear examples to help you master them.</p>',
      excerpt: 'A complete guide to conditional sentences in English. From the zero conditional to mixed conditionals, we cover it all.',
      thumbnail: 'https://picsum.photos/seed/blog3/600/400',
      authorId: 4, // David P.
      topicId: 2,
      tags: ['conditionals', 'grammar', 'b2'],
      status: 'Published',
      createdAt: '2023-11-12',
      updatedAt: '2023-11-12',
    },
    {
      id: 4,
      title: 'How to Write a Professional Email',
      slug: 'how-to-write-a-professional-email',
      content: '<p>Content about writing professional emails...</p>',
      excerpt: 'Learn the key phrases and structure for writing effective and professional emails in English for any business context.',
      thumbnail: 'https://picsum.photos/seed/blog4/600/400',
      authorId: 6,
      tags: ['writing', 'business', 'b2'],
      status: 'Published',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: 5,
      title: 'Common Pronunciation Mistakes',
      slug: 'common-pronunciation-mistakes',
      content: '<p>Content about common pronunciation mistakes...</p>',
      excerpt: 'Are you making these common English pronunciation errors? Find out and learn how to correct them with simple tips.',
      thumbnail: 'https://picsum.photos/seed/blog5/600/400',
      authorId: 4,
      tags: ['speaking', 'pronunciation', 'a2'],
      status: 'Draft',
      createdAt: '2024-02-20',
      updatedAt: '2024-02-20',
    },
    {
      id: 6,
      title: 'Tips for Improving Your Listening Skills',
      slug: 'tips-for-improving-your-listening-skills',
      content: '<p>Content about listening skills...</p>',
      excerpt: 'Listening can be the hardest skill to master. These five practical tips will help you understand native speakers better.',
      thumbnail: 'https://picsum.photos/seed/blog6/600/400',
      authorId: 2,
      tags: ['listening', 'skills', 'b1'],
      status: 'Published',
      createdAt: '2024-03-10',
      updatedAt: '2024-03-10',
    },
     {
      id: 7,
      title: 'The Difference Between "Will" and "Going to"',
      slug: 'difference-between-will-and-going-to',
      content: '<p>Content about will vs going to...</p>',
      excerpt: 'Future tenses can be confusing. This lesson clarifies the difference between "will" and "be going to" with examples.',
      thumbnail: 'https://picsum.photos/seed/blog7/600/400',
      authorId: 4,
      tags: ['grammar', 'tenses', 'a2'],
      status: 'Published',
      createdAt: '2024-04-01',
      updatedAt: '2024-04-01',
    },
    {
      id: 8,
      title: 'Using Articles: A, An, The',
      slug: 'using-articles-a-an-the',
      content: '<p>Content about articles...</p>',
      excerpt: 'A simple guide to using English articles correctly. Learn the rules for "a," "an," "the," and when to use no article.',
      thumbnail: 'https://picsum.photos/seed/blog8/600/400',
      authorId: 6,
      tags: ['grammar', 'articles', 'a1'],
      status: 'Published',
      createdAt: '2024-04-22',
      updatedAt: '2024-04-22',
    },
    {
      id: 9,
      title: 'How to Give a Great Presentation in English',
      slug: 'how-to-give-a-great-presentation-in-english',
      content: '<p>Content about presentations...</p>',
      excerpt: 'Feel more confident during your next presentation with these phrases and tips for structure and delivery.',
      thumbnail: 'https://picsum.photos/seed/blog9/600/400',
      authorId: 2,
      tags: ['speaking', 'business', 'b2'],
      status: 'Published',
      createdAt: '2024-05-18',
      updatedAt: '2024-05-18',
    }
  ]);

  private nextId = signal(10);
  
  getPaginatedPosts(page: number, limit: number, filters: { searchTerm?: string }): Observable<PaginatedResponse<BlogPost>> {
    const allPosts = this.posts().filter(p => p.status === 'Published');
    
    const filtered = allPosts.filter(p => 
      filters.searchTerm ? p.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) : true
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    const response: PaginatedResponse<BlogPost> = {
      results,
      page,
      limit,
      totalPages,
      totalResults
    };
    
    return of(response).pipe(delay(300)); // Simulate network latency
  }

  getPaginatedAdminPosts(
    page: number, 
    limit: number, 
    filters: { searchTerm: string, authorId: string, status: string }
  ): Observable<PaginatedResponse<BlogPost>> {
    const allPosts = this.posts();

    const filtered = allPosts.filter(post => {
        const termMatch = filters.searchTerm ? post.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) : true;
        const authorMatch = filters.authorId === 'All' ? true : post.authorId === Number(filters.authorId);
        const statusMatch = filters.status === 'All' ? true : post.status === filters.status;
        return termMatch && authorMatch && statusMatch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    const response: PaginatedResponse<BlogPost> = {
      results,
      page,
      limit,
      totalPages,
      totalResults
    };

    return of(response).pipe(delay(300));
  }

  getBlogPosts() {
    return computed(() => this.posts());
  }

  getBlogPostBySlug(slug: string) {
    return computed(() => this.posts().find(p => p.slug === slug));
  }

  getBlogPost(id: number) {
    return computed(() => this.posts().find(p => p.id === id));
  }

  addBlogPost(post: Omit<BlogPost, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'excerpt'>): Observable<BlogPost> {
    const now = new Date().toISOString().split('T')[0];
    const newPost: BlogPost = {
      ...post,
      id: this.nextId(),
      slug: slugify(post.title),
      excerpt: post.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...',
      createdAt: now,
      updatedAt: now,
    };
    this.posts.update(posts => [...posts, newPost]);
    this.nextId.update(id => id + 1);
    return of(newPost).pipe(delay(500));
  }

  updateBlogPost(updatedPost: Omit<BlogPost, 'slug' | 'excerpt' | 'updatedAt'> & {id: number}): Observable<BlogPost> {
    const now = new Date().toISOString().split('T')[0];
    const postWithUpdates: BlogPost = {
        ...updatedPost,
        slug: slugify(updatedPost.title),
        excerpt: updatedPost.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...',
        updatedAt: now,
    };
    this.posts.update(posts =>
      posts.map(p => p.id === postWithUpdates.id ? postWithUpdates : p)
    );
    return of(postWithUpdates).pipe(delay(500));
  }

  deleteBlogPost(id: number): Observable<{}> {
    this.posts.update(posts => posts.filter(p => p.id !== id));
    return of({}).pipe(delay(500));
  }
}