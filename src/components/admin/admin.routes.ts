import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LessonsComponent } from './lessons/lessons.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { UsersComponent } from './users/users.component';
import { QuestionBankComponent } from './question-bank/question-bank.component';

// New Topic Components
import { TopicsComponent } from './topics/topics.component';
import { TopicFormComponent } from './topic-form/topic-form.component';
// New Form Components
import { LessonFormComponent } from './lesson-form/lesson-form.component';
import { ExerciseFormComponent } from './exercise-form/exercise-form.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Admin Dashboard' },
      
      // Topic Routes
      { path: 'topics', component: TopicsComponent, title: 'Manage Topics' },
      { path: 'topics/new', component: TopicFormComponent, title: 'Create Topic' },
      { path: 'topics/edit/:id', component: TopicFormComponent, title: 'Edit Topic' },

      // Lesson Routes
      { path: 'lessons', component: LessonsComponent, title: 'Manage Lessons' },
      { path: 'lessons/new', component: LessonFormComponent, title: 'Create Lesson' },
      { path: 'lessons/edit/:id', component: LessonFormComponent, title: 'Edit Lesson' },
      
      // Question Bank
      { path: 'questions', component: QuestionBankComponent, title: 'Question Bank' },

      // Exercise Routes
      { path: 'exercises', component: ExercisesComponent, title: 'Manage Exercises' },
      { path: 'exercises/new', component: ExerciseFormComponent, title: 'Create Exercise' },
      { path: 'exercises/edit/:id', component: ExerciseFormComponent, title: 'Edit Exercise' },
      
      // User Routes
      { path: 'users', component: UsersComponent, title: 'Manage Users' },
    ]
  }
];
