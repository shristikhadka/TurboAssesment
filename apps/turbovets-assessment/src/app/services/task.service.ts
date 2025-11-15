import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// API base URL
const API_URL = 'http://localhost:3000';

// Task status enum (matches backend)
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// Task interface (matches backend entity)
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedToId: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

// Create task DTO
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
}

// Update task DTO
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // To get auth headers

  // GET AUTH HEADERS: Helper to add Authorization header
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // CREATE: Create a new task
  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${API_URL}/tasks`, task, {
      headers: this.getHeaders(),
    });
  }

  // READ ALL: Get all tasks (organization-scoped)
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_URL}/tasks`, {
      headers: this.getHeaders(),
    });
  }

  // READ ONE: Get task by ID
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${API_URL}/tasks/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // UPDATE: Update a task
  updateTask(id: number, task: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${API_URL}/tasks/${id}`, task, {
      headers: this.getHeaders(),
    });
  }

  // DELETE: Delete a task
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tasks/${id}`, {
      headers: this.getHeaders(),
    });
  }
}

