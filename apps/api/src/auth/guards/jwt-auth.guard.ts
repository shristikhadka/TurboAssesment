// Import AuthGuard from Passport
import { AuthGuard } from '@nestjs/passport';

// JwtAuthGuard extends AuthGuard('jwt')
// 'jwt' refers to the JWT strategy we created
// This guard automatically:
//   1. Extracts JWT token from request
//   2. Validates token using JwtStrategy
//   3. Attaches user to req.user
//   4. Blocks request if token is invalid/missing
export class JwtAuthGuard extends AuthGuard('jwt') {}