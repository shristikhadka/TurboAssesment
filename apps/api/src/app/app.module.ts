import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, Organization, Task } from '../entities';
// Import AuthModule to enable authentication routes
import { AuthModule } from '../auth/auth.module';
// Import TasksModule to enable task CRUD routes
import { TasksModule } from '../tasks/tasks.module';
// Import UsersModule to enable user management routes
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Organization, Task],
      synchronize: true, // Only for development - creates/updates tables automatically
      logging: true, // Log SQL queries (helpful for development)
    }),
    // Add AuthModule here - this registers all auth routes and services
    AuthModule,
    // Add TasksModule here - this registers all task CRUD routes
    TasksModule,
    // Add UsersModule here - this registers all user management routes
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
