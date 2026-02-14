
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly USERS_URL = `${environment.apiUrl}/users`;

  // Cache for components relying on synchronous access (dashboard, etc.)
  private users = signal<User[]>([]);

  constructor() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.getPaginatedUsers(1, 100, { searchTerm: '', role: 'All', status: 'All' }).subscribe(response => {
      this.users.set(response.results);
    });
  }

  // Helper for dropdowns to get "all" users (first 100)
  getAllUsersForSelect(): Observable<User[]> {
    return this.getPaginatedUsers(1, 100, { searchTerm: '', role: 'All', status: 'All' }).pipe(
      map(response => response.results)
    );
  }

  // Deprecated: Refactor components to use getAllUsersForSelect or getPaginatedUsers
  getUsers() {
    return computed(() => this.users());
  }

  getPaginatedUsers(
    page: number,
    limit: number,
    filters: { searchTerm: string, role: string, status: string }
  ): Observable<PaginatedResponse<User>> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters.searchTerm) {
      params = params.set('name', filters.searchTerm);
    }

    if (filters.role && filters.role !== 'All') {
      params = params.set('role', filters.role);
    }

    if (filters.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<User>>(this.USERS_URL, { params });
  }

  addUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.USERS_URL, user).pipe(
      tap(newUser => {
        this.users.update(current => [...current, newUser]);
      })
    );
  }

  updateUser(updatedUser: User): Observable<User> {
    const userId = updatedUser.id || (updatedUser as any)._id;
    const { id, ...data } = updatedUser as any;
    return this.http.patch<User>(`${this.USERS_URL}/${userId}`, data).pipe(
      tap(savedUser => {
        this.users.update(current => current.map(u => (u.id === userId || (u as any)._id === userId) ? savedUser : u));
      })
    );
  }

  deleteUser(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.USERS_URL}/${id}`).pipe(
      tap(() => {
        this.users.update(current => current.filter(u => u.id !== id && (u as any)._id !== id));
      })
    );
  }

  getUser(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.USERS_URL}/${id}`);
  }
}
