import { Route } from '@angular/router';
import { authGuard } from './guards/auth.guard';

// Import components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TaskListComponent } from './components/task-list/task-list.component';

export const appRoutes: Route[] = [
  // Public routes (no auth required)
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  // Protected routes (require authentication)
  {
    path: 'tasks',
    component: TaskListComponent,
    canActivate: [authGuard], // Protect with auth guard
  },
  // Default route - redirect to tasks if logged in, else login
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full',
  },
  // Catch all - redirect to tasks
  {
    path: '**',
    redirectTo: '/tasks',
  },
];
