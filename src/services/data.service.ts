
import { Injectable, signal } from '@angular/core';
import { of } from 'rxjs';

export interface Testimonial {
  quote: string;
  author: string;
  location: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface GrammarTopic {
  title: string;
  description: string;
  level: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private testimonials: Testimonial[] = [
    {
      quote: "This is the best website for grammar I've ever found! The explanations are so clear and the exercises are perfect for practice.",
      author: 'Maria S.',
      location: 'Spain',
    },
    {
      quote: 'I finally understand the present perfect tense thanks to this site. Highly recommended for all English learners.',
      author: 'Kenji T.',
      location: 'Japan',
    },
    {
      quote: "As a teacher, the PDF resources are invaluable. I use them in my classes every week. A fantastic resource!",
      author: 'David P.',
      location: 'United Kingdom',
    },
  ];

  private levelTestQuestions: QuizQuestion[] = [
    {
      question: 'He _____ to the store every day.',
      options: ['go', 'goes', 'is going', 'went'],
      correctAnswer: 1,
    },
    {
      question: "I haven't seen him _____ last year.",
      options: ['for', 'since', 'from', 'at'],
      correctAnswer: 1,
    },
    {
      question: 'If I _____ you, I would study harder.',
      options: ['am', 'was', 'were', 'be'],
      correctAnswer: 2,
    },
    {
      question: 'She is interested _____ learning Spanish.',
      options: ['in', 'on', 'at', 'about'],
      correctAnswer: 0,
    },
    {
      question: 'By the time you arrive, I _____ my homework.',
      options: ['will finish', 'am finishing', 'will have finished', 'finished'],
      correctAnswer: 2,
    },
     {
      question: 'My car _____ yesterday.',
      options: ['was stolen', 'stole', 'is stolen', 'has been stolen'],
      correctAnswer: 0,
    },
    {
      question: 'They _____ here for three years.',
      options: ['live', 'are living', 'have lived', 'lived'],
      correctAnswer: 2,
    },
  ];

  private grammarTopics: GrammarTopic[] = [
      { title: 'Verb Tenses', description: 'Learn about all English verb tenses, from present simple to future perfect continuous.', level: 'A1-C1'},
      { title: 'Conditionals', description: 'Master zero, first, second, third, and mixed conditional sentences.', level: 'A2-B2'},
      { title: 'Passive Voice', description: 'Understand how and when to use the passive voice in your writing and speaking.', level: 'B1-B2'},
      { title: 'Reported Speech', description: 'Learn to report what other people have said accurately.', level: 'B1-C1'},
      { title: 'Modal Verbs', description: 'Explore the use of can, could, may, might, must, shall, should, will, and would.', level: 'A2-B2'},
      { title: 'Articles', description: 'Understand the difference between a, an, the, and when to use no article.', level: 'A1-B1'},
  ]

  getTestimonials() {
    return of(this.testimonials);
  }

  getLevelTestQuestions() {
    return of(this.levelTestQuestions);
  }

  getGrammarTopics() {
    return of(this.grammarTopics);
  }
}
