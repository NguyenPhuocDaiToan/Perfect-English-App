
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { SaveButtonComponent, SaveButtonState } from '../ui/save-button/save-button.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SelectComponent } from '../../shared/select/select.component';
import { USER_ROLES, USER_STATUSES } from '../../../models/constants';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SaveButtonComponent, PaginationComponent, SelectComponent],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private fb: FormBuilder = inject(FormBuilder);

  // User Data
  users = signal<User[]>([]);
  status = signal<'loading' | 'loaded' | 'error'>('loading');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  totalResults = signal(0);

  // Form State
  showForm = signal(false);
  isEditing = signal(false);
  currentUser = signal<User | null>(null);
  saveState = signal<SaveButtonState>('idle');
  
  // Select Options
  roleOptions = USER_ROLES;
  statusOptions = USER_STATUSES;
  
  // Computed options for SelectComponent
  roleOptionsForSelect = computed(() => this.roleOptions.map(o => ({ value: o, label: o })));
  statusOptionsForSelect = computed(() => this.statusOptions.map(o => ({ value: o, label: o })));
  filterRoleOptions = computed(() => [{ value: 'All', label: 'All Roles' }, ...this.roleOptionsForSelect()]);
  filterStatusOptions = computed(() => [{ value: 'All', label: 'All Statuses' }, ...this.statusOptionsForSelect()]);

  // Filtering State
  searchTerm = signal('');
  filterRoleControl = new FormControl('All');
  filterStatusControl = new FormControl('All');

  resultsText = computed(() => {
    const total = this.totalResults();
    if (total === 0) return 'No results found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = start + this.users().length - 1;
    return `Showing ${start} to ${end} of ${total} results`;
  });
  
  userForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Student', Validators.required],
    status: ['Active', Validators.required],
    avatarUrl: [''],
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const term = this.searchTerm();
      const role = this.filterRoleControl.value ?? 'All';
      const status = this.filterStatusControl.value ?? 'All';
      untracked(() => this.fetchUsers(page, { searchTerm: term, role, status }));
    });
  }

  private fetchUsers(page: number, filters: { searchTerm: string, role: string, status: string }) {
    this.status.set('loading');
    this.userService.getPaginatedUsers(page, this.pageSize(), filters).subscribe({
      next: response => {
        this.users.set(response.results);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalResults);
        this.currentPage.set(response.page);
        this.status.set('loaded');
      },
      error: () => {
        this.status.set('error');
        this.toastService.show('Failed to load users', 'error');
      }
    });
  }

  onSearchTermChange(term: string) { this.searchTerm.set(term); this.currentPage.set(1); }
  onPageChange(newPage: number) { this.currentPage.set(newPage); }

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
            this.toastService.show(this.isEditing() ? 'User updated successfully' : 'User added successfully', 'success');
            this.closeForm();
            this.refetchCurrentPage();
        },
        error: () => {
            this.saveState.set('idle');
            this.toastService.show('Failed to save user', 'error');
        }
    });
  }

  async deleteUser(id: number) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete User',
      type: 'danger'
    });

    if (confirmed) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
            this.toastService.show('User deleted successfully', 'success');
            if (this.users().length === 1 && this.currentPage() > 1) {
                this.currentPage.update(p => p - 1);
            } else {
                this.refetchCurrentPage();
            }
        },
        error: () => this.toastService.show('Failed to delete user', 'error')
      });
    }
  }

  private refetchCurrentPage() {
    this.fetchUsers(this.currentPage(), { 
      searchTerm: this.searchTerm(), 
      role: this.filterRoleControl.value ?? 'All', 
      status: this.filterStatusControl.value ?? 'All'
    });
  }
}
