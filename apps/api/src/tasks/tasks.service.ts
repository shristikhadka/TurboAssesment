import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../entities/task.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    // Inject Task repository to interact with tasks table
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  // RBAC HELPER: Check if user has required role
  private hasRole(user: User, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(user.role);
  }

  // CREATE: Create a new task
  // RBAC: ADMIN, USER can create tasks. VIEWER cannot.
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // Service-layer RBAC enforcement
    if (!this.hasRole(user, [UserRole.ADMIN, UserRole.USER])) {
      throw new ForbiddenException('Only ADMIN and USER roles can create tasks');
    }

    // Create new task object
    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || TaskStatus.PENDING, // Default to PENDING
      assignedToId: user.id, // Assign to current user
      organizationId: user.organizationId, // Same organization as user
    });

    // Save to database
    return await this.taskRepository.save(task);
  }

  // READ: Get all tasks for current user's organization
  // RBAC: All roles can view tasks (organization-scoped)
  async findAll(user: User): Promise<Task[]> {
    // Find all tasks in the same organization as the user
    // This enforces organization-level scoping!
    return await this.taskRepository.find({
      where: {
        organizationId: user.organizationId, // Only tasks from user's org
      },
      relations: ['assignedTo'], // Include assigned user info
      order: {
        createdAt: 'DESC', // Newest first
      },
    });
  }

  // READ: Get single task by ID
  // RBAC: All roles can view tasks (organization-scoped)
  async findOne(id: number, user: User): Promise<Task> {
    // Find task by ID
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'organization'], // Include related data
    });

    // Check if task exists
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if task belongs to user's organization (organization scoping!)
    if (task.organizationId !== user.organizationId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  // UPDATE: Update a task
  // RBAC: ADMIN, USER can update tasks. VIEWER cannot.
  async update(id: number, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    // Service-layer RBAC enforcement
    if (!this.hasRole(user, [UserRole.ADMIN, UserRole.USER])) {
      throw new ForbiddenException('Only ADMIN and USER roles can update tasks');
    }

    // First, find the task (this also checks organization access)
    const task = await this.findOne(id, user);

    // Update task fields (only provided fields)
    Object.assign(task, updateTaskDto);

    // Save updated task
    return await this.taskRepository.save(task);
  }

  // DELETE: Delete a task
  // RBAC: Only ADMIN can delete tasks
  async remove(id: number, user: User): Promise<void> {
    // Service-layer RBAC enforcement
    if (!this.hasRole(user, [UserRole.ADMIN])) {
      throw new ForbiddenException('Only ADMIN role can delete tasks');
    }

    // First, find the task (this also checks organization access)
    const task = await this.findOne(id, user);

    // Delete the task
    await this.taskRepository.remove(task);
  }
}
