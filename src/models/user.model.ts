
import { UserRole, UserStatus } from './constants';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isPremium?: boolean; // Subscription status
  streak?: number; // Gamification: Days in a row
  xp?: number; // Gamification: Experience points
  avatarUrl: string;
  createdAt: string;
  lastLogin?: string;
  password?: string;
}
