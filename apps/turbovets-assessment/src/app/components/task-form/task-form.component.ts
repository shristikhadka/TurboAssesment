import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-xl font-bold mb-4">{{ task ? 'Edit Task' : 'Create New Task' }}</h3>

      <!-- Error message -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Task form -->
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Title input -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            [(ngModel)]="formData.title"
            name="title"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
          />
        </div>

        <!-- Description input -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            [(ngModel)]="formData.description"
            name="description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description (optional)"
          ></textarea>
        </div>

        <!-- Status select -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            [(ngModel)]="formData.status"
            name="status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option [value]="TaskStatus.PENDING">PENDING</option>
            <option [value]="TaskStatus.IN_PROGRESS">IN_PROGRESS</option>
            <option [value]="TaskStatus.COMPLETED">COMPLETED</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button
            type="submit"
            [disabled]="loading"
            class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task') }}
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
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null; // If provided, we're editing
  @Output() saved = new EventEmitter<void>(); // Emit when task is saved
  @Output() cancelled = new EventEmitter<void>(); // Emit when form is cancelled

  formData: CreateTaskDto | UpdateTaskDto = {
    title: '',
    description: '',
    status: TaskStatus.PENDING,
  };

  loading = false;
  error = '';
  TaskStatus = TaskStatus; // Expose enum to template

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    // If editing, populate form with task data
    if (this.task) {
      this.formData = {
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
      };
    }
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    if (this.task) {
      // Update existing task
      this.taskService.updateTask(this.task.id, this.formData as UpdateTaskDto).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update task';
          this.loading = false;
        },
      });
    } else {
      // Create new task
      this.taskService.createTask(this.formData as CreateTaskDto).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create task';
          this.loading = false;
        },
      });
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}

