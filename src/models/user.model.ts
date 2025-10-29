export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Teacher';
  joinedDate: string;
}
