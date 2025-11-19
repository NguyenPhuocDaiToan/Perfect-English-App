
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LevelTestComponent } from './components/level-test/level-test.component';
import { ExplanationsComponent } from './components/explanations/explanations.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { MembershipComponent } from './components/membership/membership.component';
import { TeachersComponent } from './components/teachers/teachers.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { BlogComponent } from './components/blog/blog.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';
import { LessonDetailComponent } from './components/lesson-detail/lesson-detail.component';
import { ExercisePlayerComponent } from './components/exercise-player/exercise-player.component';
import { authGuard } from './guards/auth.guard';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Home | Perfect English Grammar' },
  { path: 'level-test', component: LevelTestComponent, title: 'Level Test | Perfect English Grammar' },
  { path: 'explanations', component: ExplanationsComponent, title: 'Grammar Explanations | Perfect English Grammar' },
  { path: 'explanations/lesson/:lessonId', component: LessonDetailComponent },
  { path: 'exercises', component: ExercisesComponent, title: 'Grammar Exercises | Perfect English Grammar' },
  { path: 'exercises/:id', component: ExercisePlayerComponent, title: 'Practice Exercise | Perfect English Grammar' },
  { path: 'blog', component: BlogComponent, title: 'Blog | Perfect English Grammar' },
  { path: 'blog/:slug', component: BlogPostComponent },
  { path: 'membership', component: MembershipComponent, title: 'Membership | Perfect English Grammar' },
  { path: 'for-teachers', component: TeachersComponent, title: 'For Teachers | Perfect English Grammar' },
  { path: 'login', component: LoginComponent, title: 'Login | Perfect English Grammar' },
  { path: 'register', component: RegisterComponent, title: 'Register | Perfect English Grammar' },
  { path: 'verify-email', component: VerifyEmailComponent, title: 'Verify Email | Perfect English Grammar' },
  { path: 'dashboard', component: UserDashboardComponent, title: 'My Dashboard | Perfect English Grammar' },
  { 
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.routes').then(r => r.ADMIN_ROUTES),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
