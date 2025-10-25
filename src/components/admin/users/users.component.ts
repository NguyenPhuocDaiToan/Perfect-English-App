import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Teacher';
  joinedDate: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  users = signal<User[]>([
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin', joinedDate: '2023-01-15' },
    { id: 2, name: 'Maria S.', email: 'maria.s@example.com', role: 'Member', joinedDate: '2023-03-22' },
    { id: 3, name: 'Kenji T.', email: 'kenji.t@example.com', role: 'Member', joinedDate: '2023-05-10' },
    { id: 4, name: 'David P.', email: 'david.p@example.com', role: 'Teacher', joinedDate: '2023-06-01' },
    { id: 5, name: 'Jane Doe', email: 'jane.d@example.com', role: 'Member', joinedDate: '2023-08-19' },
  ]);
}
