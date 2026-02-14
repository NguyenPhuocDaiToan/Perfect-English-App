import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlogPost } from '../models/blog-post.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/blogs`;

  getPaginatedPosts(page: number, limit: number, filters: { searchTerm?: string }): Observable<PaginatedResponse<BlogPost>> {
    let params: any = {
      page: page.toString(),
      limit: limit.toString(),
      populate: 'createdBy',
      status: 'Published'
    };

    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }

    return this.http.get<PaginatedResponse<BlogPost>>(this.API_URL, { params });
  }

  getPaginatedAdminPosts(
    page: number,
    limit: number,
    filters: { searchTerm: string, createdBy: string, status: string }
  ): Observable<PaginatedResponse<BlogPost>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('populate', 'createdBy');

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.createdBy && filters.createdBy !== 'All') {
      params = params.set('createdBy', filters.createdBy);
    }
    if (filters.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<BlogPost>>(this.API_URL, { params });
  }

  getAllBlogPostsForSelect(): Observable<BlogPost[]> {
    return this.getPaginatedPosts(1, 100, { searchTerm: '' }).pipe(
      map(response => response.results)
    );
  }

  getBlogPostBySlug(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.API_URL}/slug/${slug}`);
  }

  getBlogPost(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.API_URL}/${id}`);
  }

  addBlogPost(post: Omit<BlogPost, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'excerpt'>): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.API_URL, post);
  }

  updateBlogPost(updatedPost: Omit<BlogPost, 'slug' | 'excerpt' | 'updatedAt'> & { id: string }): Observable<BlogPost> {
    const { id, ...data } = updatedPost;
    return this.http.patch<BlogPost>(`${this.API_URL}/${id}`, data);
  }

  deleteBlogPost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}