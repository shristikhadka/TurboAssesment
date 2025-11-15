import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, // Standalone component (no module needed)
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

        <!-- Error message -->
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>

        <!-- Login form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Email input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              [(ngModel)]="credentials.email"
              name="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <!-- Password input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              [(ngModel)]="credentials.password"
              name="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- Link to register -->
        <p class="mt-4 text-center text-sm text-gray-600">
          Don't have an account?
          <a routerLink="/register" class="text-blue-500 hover:underline">Register here</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: '',
  };

  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    // Call login service
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Success - redirect to tasks page
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        // Error - show message
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      },
    });
  }
}

