import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService, Task, TaskStatus } from '../../services/task.service';
import { AuthService, User } from '../../services/auth.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { AddUserComponent } from '../add-user/add-user.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskFormComponent, AddUserComponent],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">My Tasks</h1>
            <p class="text-sm text-gray-600 mt-1">Role: <strong>{{ currentUser?.role }}</strong></p>
          </div>
          <div class="flex gap-4">
            <!-- Add User button (ADMIN only) -->
            <button
              *ngIf="isAdmin()"
              (click)="showAddUser = !showAddUser"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              {{ showAddUser ? 'Cancel' : '+ Add User' }}
            </button>
            <!-- New Task button (ADMIN and USER only) -->
            <button
              *ngIf="canCreateTask()"
              (click)="showForm = !showForm"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {{ showForm ? 'Cancel' : '+ New Task' }}
            </button>
            <button
              (click)="logout()"
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Error message -->
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>

        <!-- Add User form (ADMIN only) -->
        <div *ngIf="showAddUser" class="mb-6">
          <app-add-user
            (saved)="onUserSaved()"
            (cancelled)="showAddUser = false"
          ></app-add-user>
        </div>

        <!-- Task form (shown when creating/editing) -->
        <div *ngIf="showForm" class="mb-6">
          <app-task-form
            [task]="selectedTask"
            (saved)="onTaskSaved()"
            (cancelled)="showForm = false; selectedTask = null"
          ></app-task-form>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading" class="text-center py-8">
          <p class="text-gray-600">Loading tasks...</p>
        </div>

        <!-- Tasks list -->
        <div *ngIf="!loading && tasks.length === 0" class="text-center py-8">
          <p class="text-gray-600">No tasks yet. Create your first task!</p>
        </div>

        <!-- Tasks grid -->
        <div *ngIf="!loading && tasks.length > 0" class="grid gap-4">
          <div
            *ngFor="let task of tasks"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ task.title }}</h3>
                <p *ngIf="task.description" class="text-gray-600 mb-4">{{ task.description }}</p>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span>Status: <strong>{{ task.status }}</strong></span>
                  <span>Created: {{ formatDate(task.createdAt) }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <!-- Status badge -->
                <span
                  [class]="getStatusClass(task.status)"
                  class="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ task.status }}
                </span>
                <!-- Edit button (ADMIN and USER only) -->
                <button
                  *ngIf="canUpdateTask()"
                  (click)="editTask(task)"
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                >
                  Edit
                </button>
                <!-- Delete button (ADMIN only) -->
                <button
                  (click)="deleteTask(task.id)"
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  error = '';
  showForm = false;
  showAddUser = false;
  selectedTask: Task | null = null;
  currentUser: User | null = null;

  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadUserProfile();
    this.loadTasks();
  }

  // Load current user profile
  loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
      },
    });
  }

  // Load all tasks
  loadTasks() {
    this.loading = true;
    this.error = '';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load tasks';
        this.loading = false;
      },
    });
  }

  // Edit task
  editTask(task: Task) {
    this.selectedTask = task;
    this.showForm = true;
  }

  // Task saved (from form component)
  onTaskSaved() {
    this.showForm = false;
    this.selectedTask = null;
    this.loadTasks(); // Reload tasks
  }

  // Delete task
  deleteTask(id: number) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.loadTasks(); // Reload tasks
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete task';
      },
    });
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Get CSS class for status badge
  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // User saved (from add-user component)
  onUserSaved() {
    this.showAddUser = false;
  }

  // RBAC Helper Methods
  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  canCreateTask(): boolean {
    return this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'USER';
  }

  canUpdateTask(): boolean {
    return this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'USER';
  }

  // Logout
  logout() {
    this.authService.logout();
  }
}

