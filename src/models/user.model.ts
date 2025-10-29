export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Teacher' | 'Student';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  avatarUrl: string;
  createdAt: string;
  lastLogin?: string;
  password?: string;
}