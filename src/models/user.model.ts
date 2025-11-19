
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Teacher' | 'Student';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  isPremium?: boolean; // Subscription status
  streak?: number; // Gamification: Days in a row
  xp?: number; // Gamification: Experience points
  avatarUrl: string;
  createdAt: string;
  lastLogin?: string;
  password?: string;
}
