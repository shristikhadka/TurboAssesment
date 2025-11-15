// Import NestJS decorators
import { Injectable, UnauthorizedException } from '@nestjs/common';
// Import Passport utilities
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// Import TypeORM
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import User entity
import { User } from '../../entities/user.entity';

// @Injectable() makes this a service that can be injected
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Constructor: Configure the JWT strategy
  constructor(
    // Inject User repository to look up users
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // super() calls the parent class (PassportStrategy) constructor
    // We pass configuration options here
    super({
      // jwtFromRequest: How to extract JWT token from the request
      // ExtractJwt.fromAuthHeaderAsBearerToken() means:
      //   Look for token in Authorization header like: "Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // secretOrKey: The secret used to sign JWT tokens
      // MUST match the secret in auth.module.ts!
      // In production, use environment variable: process.env.JWT_SECRET
      secretOrKey: 'your-secret-key-change-in-production',
      
      // ignoreExpiration: false means check if token is expired
      // If true, expired tokens would still be accepted (bad!)
      ignoreExpiration: false,
    });
  }

  // validate() method: Called automatically when JWT token is found
  // This runs for EVERY request that has a JWT token
  // payload: The decoded JWT token (contains email, sub, role from login)
  // Returns: User object (will be available as req.user in controllers)
  async validate(payload: any): Promise<User> {
    // payload.sub is the user ID we put in the token during login
    // Find the user in the database
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    // If user doesn't exist, throw error (invalid token)
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return the user object
    // This will be attached to the request as req.user
    // Controllers can access it with @Request() decorator
    return user;
  }
}