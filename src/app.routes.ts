import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LevelTestComponent } from './components/level-test/level-test.component';
import { ExplanationsComponent } from './components/explanations/explanations.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { MembershipComponent } from './components/membership/membership.component';
import { TeachersComponent } from './components/teachers/teachers.component';
import { LoginComponent } from './components/login/login.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Home | Perfect English Grammar' },
  { path: 'level-test', component: LevelTestComponent, title: 'Level Test | Perfect English Grammar' },
  { path: 'explanations', component: ExplanationsComponent, title: 'Grammar Explanations | Perfect English Grammar' },
  { path: 'exercises', component: ExercisesComponent, title: 'Grammar Exercises | Perfect English Grammar' },
  { path: 'membership', component: MembershipComponent, title: 'Membership | Perfect English Grammar' },
  { path: 'for-teachers', component: TeachersComponent, title: 'For Teachers | Perfect English Grammar' },
  { path: 'login', component: LoginComponent, title: 'Login | Perfect English Grammar' },
  { 
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.routes').then(r => r.ADMIN_ROUTES)
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
