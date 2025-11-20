import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EventsGateway } from '@events/events.gateway';
import { EventsService } from '@events/events.service';
import { User, UserRole } from '@/users/entities/user.entity';
import { RedisService } from '@/common/cache/redis-cache.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private eventsGateway: EventsGateway,
    private eventsService: EventsService,
    private redisService: RedisService,
  ) {}

  async create(dto: CreateTaskDto, user: any): Promise<Task> {
    const isAdmin = user.role === 'admin';

    const taskData = {
      title: dto.title,
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      createdById: user.userId,
      assignedToId:
        isAdmin && dto.assignedToId ? dto.assignedToId : user.userId,
    };

    const insertResult = await this.taskRepo.insert(taskData);
    const insertedId = insertResult.identifiers[0].id as number;

    const savedTask = await this.taskRepo.findOne({
      where: { id: insertedId },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!savedTask) throw new Error('Task creation failed');

    // Event log
    await this.eventsService.log(
      'task.created',
      savedTask.id,
      user.userId,
      savedTask,
    );

    // Emit events based on creator role
    if (isAdmin) {
      // Admin: notify all admins + assignee
      const admins = await this.userRepo.find({
        where: {
          role: UserRole.ADMIN,
        },
      });
      admins.forEach((admin) =>
        this.eventsGateway.emitToUser(admin.id, 'taskCreated', savedTask),
      );

      if (savedTask.assignedToId && savedTask.assignedToId !== user.userId) {
        this.eventsGateway.emitToUser(
          savedTask.assignedToId,
          'taskAssigned',
          savedTask,
        );
      }
    } else {
      // Regular user: notify self + all admins
      this.eventsGateway.emitToUser(user.userId, 'taskCreated', savedTask);

      const admins = await this.userRepo.find({
        where: { role: UserRole.ADMIN },
      });
      admins.forEach((admin) =>
        this.eventsGateway.emitToUser(admin.id, 'taskCreated', savedTask),
      );
    }

    // Evict Cache
    await this.redisService.del(
      this.redisService.generateCacheKey(user.userId, user.role),
    );

    return savedTask;
  }

  async findAll(user: any): Promise<Task[]> {
    if (user.role === 'admin') {
      return this.taskRepo.find({
        relations: ['assignedTo', 'createdBy'],
        order: { createdAt: 'DESC' },
      });
    }

    const tasks = await this.taskRepo.find({
      where: [{ createdById: user.userId }, { assignedToId: user.userId }],
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    return tasks;
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: number, dto: UpdateTaskDto, user: any): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!task) throw new NotFoundException('Task not found');

    // 2. Authorization check (owner or admin)
    const isOwner =
      task.createdById === user.userId || task.assignedToId === user.userId;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    // 3. Detect assignment change for notification
    const oldAssignedToId = task.assignedToId;
    const newAssignedToId = dto.assignedToId;

    // 4. Apply update
    await this.taskRepo.update(id, dto as any);

    // 5. Fetch updated task with relations (ONE QUERY ONLY)
    const updatedTask = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });

    // This should never happen now, but keep for safety
    if (!updatedTask) throw new NotFoundException('Task not found');

    // 6. Emit real-time events
    if (newAssignedToId && newAssignedToId !== oldAssignedToId) {
      this.eventsGateway.emitToUser(
        newAssignedToId,
        'taskAssigned',
        updatedTask,
      );
    }

    this.eventsGateway.emitGlobal('taskUpdated', updatedTask);

    // Evict Cache
    await this.redisService.del(
      this.redisService.generateCacheKey(user.userId, user.role),
    );

    return updatedTask;
  }

  async remove(id: number, user: any) {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
    await this.eventsService.log('task.deleted', id, user.userId);
    this.eventsGateway.emitGlobal('taskDeleted', { id });

    // Evict Cache
    await this.redisService.del(
      this.redisService.generateCacheKey(user.userId, user.role),
    );
  }
}
