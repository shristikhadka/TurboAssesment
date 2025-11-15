import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// API base URL - change if your backend runs on different port
const API_URL = 'http://localhost:3000';

// Interface for login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface for register request
export interface RegisterRequest {
  email: string;
  password: string;
  organizationId: number;
}

// Interface for login response
export interface LoginResponse {
  access_token: string;
}

// Interface for user data
export interface User {
  id: number;
  email: string;
  role: string;
  organizationId: number;
}

@Injectable({
  providedIn: 'root', // Available throughout the app
})
export class AuthService {
  private http = inject(HttpClient); // For making HTTP requests
  private router = inject(Router); // For navigation

  // LOGIN: Send email/password, get JWT token
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, credentials).pipe(
      // After successful login, save token
      tap((response) => {
        this.setToken(response.access_token);
      })
    );
  }

  // REGISTER: Create new user account
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${API_URL}/auth/register`, data);
  }

  // GET PROFILE: Get current user info (requires token)
  getProfile(): Observable<User> {
    return this.http.get<User>(`${API_URL}/auth/profile`);
  }

  // SAVE TOKEN: Store JWT token in localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // GET TOKEN: Retrieve JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // CHECK IF LOGGED IN: Returns true if token exists
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // LOGOUT: Remove token and redirect to login
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // GET AUTH HEADER: Returns header object for API requests
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}

