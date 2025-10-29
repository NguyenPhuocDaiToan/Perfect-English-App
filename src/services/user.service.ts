import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users = signal<User[]>([
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active', avatarUrl: 'https://picsum.photos/seed/user1/200', createdAt: '2023-01-15', lastLogin: '2024-05-20', password: 'admin' },
    { id: 2, name: 'Maria S.', email: 'maria.s@example.com', role: 'Student', status: 'Active', avatarUrl: 'https://picsum.photos/seed/user2/200', createdAt: '2023-03-22', lastLogin: '2024-05-18', password: 'password' },
    { id: 3, name: 'Kenji T.', email: 'kenji.t@example.com', role: 'Student', status: 'Inactive', avatarUrl: 'https://picsum.photos/seed/user3/200', createdAt: '2023-05-10', lastLogin: '2024-03-10', password: 'password' },
    { id: 4, name: 'David P.', email: 'david.p@example.com', role: 'Teacher', status: 'Active', avatarUrl: 'https://picsum.photos/seed/user4/200', createdAt: '2023-06-01', lastLogin: '2024-05-21', password: 'password' },
    { id: 5, name: 'Jane Doe', email: 'jane.d@example.com', role: 'Editor', status: 'Suspended', avatarUrl: 'https://picsum.photos/seed/user5/200', createdAt: '2023-08-19', lastLogin: '2024-04-01', password: 'password' },
    { id: 6, name: 'Carlos Gomez', email: 'carlos.g@example.com', role: 'Teacher', status: 'Active', avatarUrl: 'https://picsum.photos/seed/user6/200', createdAt: '2023-09-05', lastLogin: '2024-05-19', password: 'password' },
  ]);

  private nextId = signal(7);

  getUsers() {
    return computed(() => this.users());
  }
  
  addUser(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Observable<User> {
    const newUser: User = { 
      ...user, 
      id: this.nextId(),
      createdAt: new Date().toISOString().split('T')[0] 
    };
    this.users.update(users => [...users, newUser]);
    this.nextId.update(id => id + 1);
    return of(newUser).pipe(delay(500));
  }

  updateUser(updatedUser: User): Observable<User> {
    this.users.update(users => 
      users.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
    return of(updatedUser).pipe(delay(500));
  }

  deleteUser(id: number): Observable<{}> {
    this.users.update(users => users.filter(u => u.id !== id));
    return of({}).pipe(delay(500));
  }
}