import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProgressService } from '../../services/user-progress.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {
  authService = inject(AuthService);
  userProgressService = inject(UserProgressService);
  userService = inject(UserService);

  user = computed(() => this.authService.currentUser());

  // Analytics
  stats = toSignal(this.userProgressService.getStats(), { initialValue: { completedExercises: 0, averageScore: 0, mastery: {} } });
  weakAreas = toSignal(this.userProgressService.getWeakAreas(), { initialValue: [] });

  // Real Leaderboard Data
  leaderboard = toSignal(this.userService.getLeaderboard(), { initialValue: [] });

  dailyGoal = 50;
  // TODO: Add daily progress tracking to user model/progress service
  currentDailyProgress = 30;

  constructor() { }
}
