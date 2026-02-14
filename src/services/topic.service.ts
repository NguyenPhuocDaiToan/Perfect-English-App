import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Topic } from '../models/topic.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private topics = signal<Topic[]>([
    { id: 1, title: 'Verb Tenses', category: 'Grammar', description: 'Learn about all English verb tenses.', status: 'Published' },
    { id: 2, title: 'Conditionals', category: 'Grammar', description: 'Master zero, first, second, third, and mixed conditional sentences.', status: 'Published' },
    { id: 3, title: 'Travel Vocabulary', category: 'Vocabulary', description: 'Essential words and phrases for traveling abroad.', status: 'Published' },
    { id: 4, title: 'Passive Voice', category: 'Grammar', description: 'Understand how and when to use the passive voice.', status: 'Published' },
    { id: 5, title: 'Business Writing', category: 'Writing', description: 'Learn to write professional emails, reports, and presentations.', status: 'Published' },
    { id: 6, title: 'Pronunciation Basics', category: 'Speaking', description: 'Tips and exercises for clearer English pronunciation.', status: 'Published' },
    { id: 7, title: 'Phrasal Verbs', category: 'Vocabulary', description: 'Master common phrasal verbs used in everyday conversation.', status: 'Published' },
    { id: 8, title: 'Reported Speech', category: 'Grammar', description: 'Learn how to report what other people have said.', status: 'Draft' },
    { id: 9, title: 'Punctuation Guide', category: 'Writing', description: 'A complete guide to commas, semicolons, and more.', status: 'Published' },
    { id: 10, title: 'Modal Verbs', category: 'Grammar', description: 'Explore can, could, may, might, must, and should.', status: 'Published' },
    { id: 11, title: 'Presentation Skills', category: 'Speaking', description: 'Tips for giving confident and effective presentations in English.', status: 'Published' },
  ]);

  private nextId = signal(12);
  
  getPaginatedTopics(page: number, limit: number, filters: { category: string | 'All' }): Observable<PaginatedResponse<Topic>> {
    const allTopics = this.topics().filter(t => t.status === 'Published');
    
    const filtered = allTopics.filter(t => 
      filters.category === 'All' ? true : t.category === filters.category
    );

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    const response: PaginatedResponse<Topic> = {
      results,
      page,
      limit,
      totalPages,
      totalResults
    };
    
    return of(response).pipe(delay(300));
  }

  getPaginatedAdminTopics(
    page: number, 
    limit: number, 
    filters: { searchTerm: string, category: string, status: string }
  ): Observable<PaginatedResponse<Topic>> {
    
    const allTopics = this.topics();

    const filtered = allTopics.filter(t => {
      const termMatch = filters.searchTerm 
        ? t.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) || t.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) 
        : true;
      const categoryMatch = filters.category === 'All' ? true : t.category === filters.category;
      const statusMatch = filters.status === 'All' ? true : t.status === filters.status;
      return termMatch && categoryMatch && statusMatch;
    });

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    const response: PaginatedResponse<Topic> = {
      results,
      page,
      limit,
      totalPages,
      totalResults
    };
    
    return of(response).pipe(delay(300));
  }

  getTopics() {
    return computed(() => this.topics());
  }
  
  getTopic(id: number) {
    return computed(() => this.topics().find(t => t.id === id));
  }

  addTopic(topic: Omit<Topic, 'id'>): Observable<Topic> {
    const newTopic: Topic = { ...topic, id: this.nextId() };
    this.topics.update(topics => [...topics, newTopic]);
    this.nextId.update(id => id + 1);
    return of(newTopic).pipe(delay(500));
  }

  updateTopic(updatedTopic: Topic): Observable<Topic> {
    this.topics.update(topics =>
      topics.map(t => t.id === updatedTopic.id ? updatedTopic : t)
    );
    return of(updatedTopic).pipe(delay(500));
  }

  deleteTopic(id: number): Observable<{}> {
    this.topics.update(topics => topics.filter(t => t.id !== id));
    return of({}).pipe(delay(500));
  }
}