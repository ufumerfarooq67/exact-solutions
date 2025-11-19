import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { EventsModule } from '@events/events.module';
import { User } from '@/users/entities/user.entity';
import { RedisService } from '@/common/cache/redis-cache.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from '@/common/cache/redis-cache.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User]),
    EventsModule, // Socket and Mongo DB Logging
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    RedisService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
