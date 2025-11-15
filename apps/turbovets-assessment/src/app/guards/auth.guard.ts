import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// AUTH GUARD: Protects routes - only allows access if user is logged in
// If not logged in, redirects to /login
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user has a token (is logged in)
  if (authService.isLoggedIn()) {
    return true; // Allow access
  }

  // Not logged in - redirect to login page
  router.navigate(['/login']);
  return false; // Block access
};

