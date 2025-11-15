// Import NestJS module decorator
import { Module } from '@nestjs/common';
// Import TypeORM to access User repository in services
import { TypeOrmModule } from '@nestjs/typeorm';
// Import JWT module for generating tokens
import { JwtModule } from '@nestjs/jwt';
// Import Passport for authentication strategies
import { PassportModule } from '@nestjs/passport';
// Import User entity (the database table)
import { User } from '../entities/user.entity';
// Import Organization entity
import { Organization } from '../entities/organization.entity';
// Import our services and controllers
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

// @Module() decorator defines this as a NestJS module
// Modules group related functionality together
@Module({
  // imports: Other modules/features this module needs
  imports: [
    // TypeOrmModule.forFeature([User, Organization]) gives us access to repositories
    // This allows us to use @InjectRepository(User) and @InjectRepository(Organization) in AuthService
    // Without this, we can't query the database tables
    TypeOrmModule.forFeature([User, Organization]),
    
    // PassportModule is needed for authentication strategies
    // This enables Passport to work with NestJS
    // Required for JwtStrategy to work
    PassportModule,
    
    // JwtModule.register() configures JWT token generation
    // This makes JwtService available to inject in AuthService
    JwtModule.register({
      // secret: The secret key used to sign JWT tokens
      // MUST match secretOrKey in jwt.strategy.ts!
      // In production, use: process.env.JWT_SECRET
      secret: 'your-secret-key-change-in-production',
      
      // signOptions: Configuration for token generation
      signOptions: {
        expiresIn: '1d', // Token expires in 1 day
        // Other options: '1h' (1 hour), '7d' (7 days), '30d' (30 days)
      },
    }),
  ],
  
  // providers: Services that can be injected into other classes
  // These are the classes that contain business logic
  providers: [
    AuthService,   // Our authentication service (register, login, etc.)
    JwtStrategy,   // JWT validation strategy (validates tokens)
  ],
  
  // controllers: Controllers that handle HTTP requests
  // These define the API endpoints
  controllers: [AuthController],
  
  // exports: What this module makes available to other modules
  // We don't need to export anything (AuthModule is self-contained)
  // If other modules needed AuthService, we'd export it here
})
export class AuthModule {}

