import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>

        <!-- Error message -->
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>

        <!-- Success message -->
        <div *ngIf="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {{ success }}
        </div>

        <!-- Register form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Email input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              [(ngModel)]="registerData.email"
              name="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <!-- Password input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              id="password"
              [(ngModel)]="registerData.password"
              name="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <!-- Organization ID input -->
          <div>
            <label for="organizationId" class="block text-sm font-medium text-gray-700 mb-1">
              Organization ID
            </label>
            <input
              type="number"
              id="organizationId"
              [(ngModel)]="registerData.organizationId"
              name="organizationId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
            <p class="mt-1 text-xs text-gray-500">Use organization ID 1 for testing</p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <!-- Link to login -->
        <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <a routerLink="/login" class="text-blue-500 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    email: '',
    password: '',
    organizationId: 1, // Default to organization 1
  };

  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.success = '';

    // Call register service
    this.authService.register(this.registerData).subscribe({
      next: () => {
        // Success - show message and redirect to login
        this.success = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        // Error - show message
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}

