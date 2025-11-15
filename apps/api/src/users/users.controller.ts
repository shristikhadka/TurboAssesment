import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect with JWT + Roles
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users - Create a new user (ADMIN only)
  @Post()
  @Roles(UserRole.ADMIN) // Only ADMIN can create users
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() req,
  ) {
    const currentUser = req.user as User;
    return await this.usersService.createUser(createUserDto, currentUser);
  }

  // GET /users - Get all users in organization (ADMIN only)
  @Get()
  @Roles(UserRole.ADMIN) // Only ADMIN can view all users
  async getAllUsers(@Request() req) {
    const currentUser = req.user as User;
    return await this.usersService.findAllUsers(currentUser);
  }
}

