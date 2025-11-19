
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProgressService } from '../../services/user-progress.service';

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

  user = computed(() => this.authService.currentUser());
  
  // Analytics
  stats = this.userProgressService.getStats();
  weakAreas = this.userProgressService.getWeakAreas();
  
  // Gamification: Leaderboard (Mock Data)
  leaderboard = [
      { name: 'David P.', xp: 50000, avatar: 'https://picsum.photos/seed/user4/200' },
      { name: 'Admin User', xp: 15000, avatar: 'https://picsum.photos/seed/user1/200' },
      { name: 'Maria S.', xp: 3400, avatar: 'https://picsum.photos/seed/user2/200' },
      { name: 'Carlos G.', xp: 1200, avatar: 'https://picsum.photos/seed/user6/200' },
      { name: 'You', xp: 0, avatar: '' } // Will be replaced by current user in template
  ];

  dailyGoal = 50;
  currentDailyProgress = 30; // Mock daily progress

  constructor() {}
}
