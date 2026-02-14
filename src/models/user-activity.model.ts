
export interface UserActivity {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  action: 'Login' | 'Register' | 'View Content' | 'Update Profile' | 'Complete Exercise' | 'Purchase';
  target: string; // What was acted upon (e.g., "Lesson 1", "Settings")
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
  details?: string;
}
