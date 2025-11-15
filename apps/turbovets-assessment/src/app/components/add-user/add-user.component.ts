import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, CreateUserDto } from '../../services/user.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-xl font-bold mb-4">Add New User</h3>

      <!-- Error message -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Success message -->
      <div *ngIf="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ success }}
      </div>

      <!-- User form -->
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Email input -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            [(ngModel)]="userData.email"
            name="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="user@example.com"
          />
        </div>

        <!-- Password input -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password (min 6 characters) *
          </label>
          <input
            type="password"
            id="password"
            [(ngModel)]="userData.password"
            name="password"
            required
            minlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
          />
        </div>

        <!-- Role select -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            [(ngModel)]="userData.role"
            name="role"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button
            type="submit"
            [disabled]="loading"
            class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating...' : 'Create User' }}
          </button>
          <button
            type="button"
            (click)="onCancel()"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
})
export class AddUserComponent {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  userData: CreateUserDto = {
    email: '',
    password: '',
    role: 'USER',
  };

  loading = false;
  error = '';
  success = '';

  private userService = inject(UserService);

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.userService.createUser(this.userData).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'User created successfully!';
        setTimeout(() => {
          this.saved.emit();
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create user';
        this.loading = false;
      },
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}

