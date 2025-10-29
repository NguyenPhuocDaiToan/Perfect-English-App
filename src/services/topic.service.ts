import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Topic } from '../models/topic.model';

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
    { id: 7, title: 'Phrasal Verbs', category: 'Vocabulary', description: 'Master common phrasal verbs used in everyday conversation.', status: 'Draft' },
  ]);

  private nextId = signal(8);

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
