import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect ALL routes with JWT + Roles
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // POST /tasks - Create a new task
  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER) // Only ADMIN and USER can create
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req, // req.user is available from JwtAuthGuard
  ) {
    // req.user contains the logged-in user (from JWT token)
    const user = req.user as User;
    return await this.tasksService.create(createTaskDto, user);
  }

  // GET /tasks - Get all tasks (organization-scoped)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VIEWER) // All roles can view
  async findAll(@Request() req) {
    const user = req.user as User;
    return await this.tasksService.findAll(user);
  }

  // GET /tasks/:id - Get single task by ID
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VIEWER) // All roles can view
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const user = req.user as User;
    return await this.tasksService.findOne(id, user);
  }

  // PUT /tasks/:id - Update a task
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER) // Only ADMIN and USER can update
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    const user = req.user as User;
    return await this.tasksService.update(id, updateTaskDto, user);
  }

  // DELETE /tasks/:id - Delete a task
  @Delete(':id')
  @Roles(UserRole.ADMIN) // Only ADMIN can delete
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const user = req.user as User;
    await this.tasksService.remove(id, user);
    return { message: 'Task deleted successfully' };
  }
}

