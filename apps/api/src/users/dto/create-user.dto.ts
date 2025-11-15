import { IsEmail, IsString, MinLength, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional() // Defaults to USER if not provided
  role?: UserRole;
}

