// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { EventsModule } from '@events/events.module'; // For EventsGateway + EventsService
import { User } from '@/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User]),
    EventsModule, // Critical: gives access to real-time gateway & MongoDB logging
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // In case other modules need it later
})
export class TasksModule {}