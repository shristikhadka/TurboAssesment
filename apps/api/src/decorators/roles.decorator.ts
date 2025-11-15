import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

// ROLE DECORATOR: Used to specify which roles can access a route
// Example: @Roles(UserRole.ADMIN, UserRole.USER)
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

