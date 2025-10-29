import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private userService = inject(UserService);

  users = this.userService.getUsers();

  showForm = signal(false);
  isEditing = signal(false);
  currentUser = signal<User | null>(null);
  
  roleOptions: Array<'Member' | 'Teacher' | 'Admin'> = ['Member', 'Teacher', 'Admin'];
  isRoleDropdownOpen = signal(false);

  // FIX: The FormBuilder was not being correctly typed when injected as a class property.
  // It's injected here directly to resolve the issue.
  userForm: FormGroup = inject(FormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Member', Validators.required],
  });

  openAddForm() {
    this.isEditing.set(false);
    this.currentUser.set(null);
    this.userForm.reset({ role: 'Member' });
    this.showForm.set(true);
  }

  openEditForm(user: User) {
    this.isEditing.set(true);
    this.currentUser.set(user);
    this.userForm.setValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    this.showForm.set(true);
  }
  
  closeForm() {
    this.showForm.set(false);
    this.isRoleDropdownOpen.set(false);
  }

  saveUser() {
    if (this.userForm.invalid) {
      return;
    }

    if (this.isEditing() && this.currentUser()) {
      const userData: User = { 
        ...this.currentUser()!,
        ...this.userForm.value 
      };
      this.userService.updateUser(userData).subscribe(() => this.closeForm());
    } else {
      this.userService.addUser(this.userForm.value).subscribe(() => this.closeForm());
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe();
    }
  }

  selectRole(role: 'Member' | 'Teacher' | 'Admin') {
    this.userForm.get('role')?.setValue(role);
    this.isRoleDropdownOpen.set(false);
  }
}