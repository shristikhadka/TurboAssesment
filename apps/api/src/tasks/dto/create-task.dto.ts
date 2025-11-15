import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional() // Description is optional
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional() // Status defaults to PENDING
  status?: TaskStatus;
}

