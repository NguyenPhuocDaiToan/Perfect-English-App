import { Injectable, signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users = signal<User[]>([
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin', joinedDate: '2023-01-15' },
    { id: 2, name: 'Maria S.', email: 'maria.s@example.com', role: 'Member', joinedDate: '2023-03-22' },
    { id: 3, name: 'Kenji T.', email: 'kenji.t@example.com', role: 'Member', joinedDate: '2023-05-10' },
    { id: 4, name: 'David P.', email: 'david.p@example.com', role: 'Teacher', joinedDate: '2023-06-01' },
    { id: 5, name: 'Jane Doe', email: 'jane.d@example.com', role: 'Member', joinedDate: '2023-08-19' },
  ]);

  private nextId = signal(6);

  getUsers() {
    return computed(() => this.users());
  }
  
  addUser(user: Omit<User, 'id' | 'joinedDate'>): Observable<User> {
    const newUser: User = { 
      ...user, 
      id: this.nextId(),
      joinedDate: new Date().toISOString().split('T')[0] 
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