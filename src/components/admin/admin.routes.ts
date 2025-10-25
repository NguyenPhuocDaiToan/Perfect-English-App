import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LessonsComponent } from './lessons/lessons.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { UsersComponent } from './users/users.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Admin Dashboard' },
      { path: 'lessons', component: LessonsComponent, title: 'Manage Lessons' },
      { path: 'exercises', component: ExercisesComponent, title: 'Manage Exercises' },
      { path: 'users', component: UsersComponent, title: 'Manage Users' },
    ]
  }
];
