import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private userService = inject(UserService);
  private fb: FormBuilder = inject(FormBuilder);

  // User Data
  private allUsers = this.userService.getUsers();

  // Form State
  showForm = signal(false);
  isEditing = signal(false);
  currentUser = signal<User | null>(null);
  saveState = signal<SaveButtonState>('idle');
  
  // Select Options
  roleOptions: User['role'][] = ['Admin', 'Editor', 'Teacher', 'Student'];
  statusOptions: User['status'][] = ['Active', 'Inactive', 'Suspended'];

  // Filtering State
  searchTerm = signal('');
  filterRole = signal<string>('All');
  filterStatus = signal<string>('All');

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const role = this.filterRole();
    const status = this.filterStatus();

    return this.allUsers().filter(user => 
      (user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)) &&
      (role === 'All' || user.role === role) &&
      (status === 'All' || user.status === status)
    );
  });
  
  userForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Student', Validators.required],
    status: ['Active', Validators.required],
    avatarUrl: [''],
  });

  openAddForm() {
    this.isEditing.set(false);
    this.currentUser.set(null);
    this.userForm.reset({ role: 'Student', status: 'Active' });
    this.saveState.set('idle');
    this.showForm.set(true);
  }

  openEditForm(user: User) {
    this.isEditing.set(true);
    this.currentUser.set(user);
    this.userForm.setValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl || ''
    });
    this.saveState.set('idle');
    this.showForm.set(true);
  }
  
  closeForm() {
    this.showForm.set(false);
  }

  saveUser() {
    if (this.userForm.invalid || this.saveState() !== 'idle') {
      return;
    }

    this.saveState.set('loading');
    
    const currentUserData = this.currentUser() || { createdAt: new Date().toISOString().split('T')[0] };

    const saveObservable = this.isEditing() && this.currentUser()
      ? this.userService.updateUser({ ...currentUserData, ...this.userForm.value, id: this.currentUser()!.id })
      : this.userService.addUser(this.userForm.value);

    saveObservable.subscribe({
        next: () => {
            this.saveState.set('success');
            setTimeout(() => {
                this.closeForm();
            }, 1500);
        },
        error: () => {
            this.saveState.set('idle');
        }
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe();
    }
  }
}
