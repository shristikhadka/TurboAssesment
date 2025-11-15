import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  // CREATE USER: Only ADMIN can create users in their organization
  async createUser(createUserDto: CreateUserDto, currentUser: User): Promise<Omit<User, 'password'>> {
    // Check if user is ADMIN (service-layer RBAC)
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only ADMIN can create users');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user in the same organization as the admin
    const newUser = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role || UserRole.USER, // Default to USER
      organizationId: currentUser.organizationId, // Same organization as admin
    });

    const savedUser = await this.userRepository.save(newUser);
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  // GET ALL USERS: Get all users in current user's organization
  async findAllUsers(currentUser: User): Promise<Omit<User, 'password'>[]> {
    // Find all users in the same organization
    const users = await this.userRepository.find({
      where: {
        organizationId: currentUser.organizationId,
      },
      select: ['id', 'email', 'role', 'organizationId', 'createdAt', 'updatedAt'], // Exclude password
      order: {
        createdAt: 'DESC',
      },
    });

    return users;
  }
}

