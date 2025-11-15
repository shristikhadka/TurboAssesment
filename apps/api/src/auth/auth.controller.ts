// Import NestJS decorators for creating HTTP endpoints
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
// Import AuthService (the business logic we created)
import { AuthService } from './auth.service';
// Import DTOs (for validating incoming data)
import { RegisterDTO } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// Import JWT guard (to protect routes that need authentication)
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// @Controller('auth') means all routes in this controller start with /auth
// Example: @Post('register') becomes POST /auth/register
@Controller('auth')
export class AuthController {
  // Constructor: Inject AuthService
  // NestJS automatically creates AuthService and gives it to us
  constructor(private authService: AuthService) {}

  // POST /auth/register
  // This is a PUBLIC endpoint (no @UseGuards) - anyone can register
  @Post('register')
  // @Body() automatically extracts JSON body from request
  // RegisterDTO validates the data (email must be valid, password min 6 chars, etc.)
  async register(@Body() dto: RegisterDTO) {
    // Call our authService.register() method which:
    //   1. Checks if email already exists
    //   2. Hashes the password
    //   3. Saves user to database
    //   4. Returns user without password
    const user = await this.authService.register(dto);
    
    // Return the user (password is already removed in the service)
    return user;
  }

  // POST /auth/login
  // This is also PUBLIC - anyone can try to login
  @Post('login')
  // @Body() extracts and validates login credentials
  async login(@Body() dto: LoginDto) {
    // Call our authService.login() method which:
    //   1. Finds user by email
    //   2. Compares password with bcrypt
    //   3. Generates JWT token if password is correct
    //   4. Returns { access_token: '...' }
    const result = await this.authService.login(dto);
    
    // Return the token
    // Client will use this token in future requests
    return result;
  }

  // GET /auth/profile
  // This is a PROTECTED endpoint - requires valid JWT token
  @UseGuards(JwtAuthGuard) // This protects the route - blocks if no valid token
  @Get('profile')
  // @Request() gives us the full request object
  // req.user is automatically added by JwtAuthGuard (from JwtStrategy.validate())
  // This contains the User object of the currently logged-in user
  async getProfile(@Request() req) {
    // req.user contains the User object from JwtStrategy
    // Remove password before returning (security best practice)
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }
}

