import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { EventsModule } from '@events/events.module';
import { User } from '@/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User]),
    EventsModule, // Socket and Mongo DB Logging
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}