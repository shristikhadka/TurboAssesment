import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// API base URL
const API_URL = 'http://localhost:3000';

// User interface
export interface User {
  id: number;
  email: string;
  role: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

// Create user DTO
export interface CreateUserDto {
  email: string;
  password: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // GET AUTH HEADERS: Helper to add Authorization header
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // CREATE: Create a new user (ADMIN only)
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${API_URL}/users`, user, {
      headers: this.getHeaders(),
    });
  }

  // GET ALL: Get all users in organization (ADMIN only)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`, {
      headers: this.getHeaders(),
    });
  }
}

