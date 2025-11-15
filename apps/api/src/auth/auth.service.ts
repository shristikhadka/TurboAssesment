// Import NestJS decorators and utilities
import { Injectable, UnauthorizedException } from '@nestjs/common';
// Import TypeORM decorators and repository
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import JWT service for generating tokens
import { JwtService } from '@nestjs/jwt';
// Import bcrypt for password hashing
import * as bcrypt from 'bcryptjs';
// Import User entity (the database table)
import { User, UserRole } from '../entities/user.entity';
// Import Organization entity
import { Organization } from '../entities/organization.entity';
// Import DTOs (data validation objects)
import { RegisterDTO } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// @Injectable() makes this class a service that can be injected into other classes
@Injectable()
export class AuthService {
  // Constructor: This runs when AuthService is created
  // We're injecting dependencies here (Dependency Injection)
  constructor(
    // @InjectRepository(User) tells NestJS to inject the User repository
    // Repository<User> is TypeORM's way to interact with the users table
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    // Inject Organization repository to validate organization exists
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    
    // JwtService is injected automatically (we'll configure it in auth.module.ts)
    // This service can generate and verify JWT tokens
    private jwtService: JwtService,
  ) {}

  // Method 1: Register a new user
  // Takes RegisterDTO (validated data: email, password, organizationId)
  // Returns: User object (without password!)
  async register(dto: RegisterDTO) {
    // Step 1: Check if user with this email already exists
    // findOne() queries the database
    // where: { email: dto.email } means "find user where email matches"
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    // If user exists, throw an error (can't register with same email twice)
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // Step 1.5: Check if organization exists
    // We need to validate that the organizationId is valid
    const organization = await this.organizationRepository.findOne({
      where: { id: dto.organizationId },
    });

    // If organization doesn't exist, throw an error
    if (!organization) {
      throw new UnauthorizedException('Organization not found');
    }

    // Step 2: Hash the password before saving
    // bcrypt.hash() takes the plain password and a "salt rounds" number
    // Salt rounds = 10 means it will hash the password 2^10 times (very secure!)
    // This makes the password unreadable in the database
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Step 3: Create a new user object
    // userRepository.create() creates a User object (doesn't save to DB yet)
    // We're setting all the fields from the DTO, but using hashed password
    const newUser = this.userRepository.create({
      email: dto.email,
      password: hashedPassword, // Store hashed password, not plain text!
      organizationId: dto.organizationId,
      role: UserRole.USER, // Default role for new users
    });

    // Step 4: Save the user to the database
    // userRepository.save() actually writes to the database
    // This creates a new row in the "users" table
    const savedUser = await this.userRepository.save(newUser);

    // Step 5: Return user WITHOUT password (security!)
    // We don't want to send the password back to the client
    // Object destructuring: { password, ...rest } separates password from other fields
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  // Method 2: Login (authenticate existing user)
  // Takes LoginDto (email and password)
  // Returns: { access_token: 'jwt-token-string' }
  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // Step 1: Find user by email
    // We need to find the user first to get their hashed password
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    // Step 2: Check if user exists
    // If no user found, throw unauthorized error
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Step 3: Compare the provided password with the stored hashed password
    // bcrypt.compare() takes plain password and hashed password
    // It hashes the plain password and compares with the stored hash
    // Returns true if they match, false if they don't
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    // Step 4: If password doesn't match, throw error
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Step 5: Password is valid! Generate JWT token
    // JWT payload contains data that will be in the token
    // sub = "subject" (usually the user ID)
    // email and role are included so we can use them later
    const payload = {
      email: user.email,
      sub: user.id, // "sub" is standard JWT field for user ID
      role: user.role,
    };

    // Step 6: Sign (generate) the JWT token
    // jwtService.sign() creates a JWT token with the payload
    // The token is encrypted and can be verified later
    const access_token = this.jwtService.sign(payload);

    // Step 7: Return the token
    // The client will use this token in future requests
    return { access_token };
  }

  // Method 3: Validate user (used by JWT strategy)
  // This is called automatically when a JWT token is validated
  // Takes user ID from JWT token payload
  // Returns: User object (will be available as req.user in controllers)
  async validateUser(userId: number): Promise<User | null> {
    // Find user by ID
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Return user if found, null if not found
    // null means token is invalid (user doesn't exist)
    return user || null;
  }
}