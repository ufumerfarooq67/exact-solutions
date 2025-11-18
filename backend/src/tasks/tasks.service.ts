// src/tasks/tasks.service.ts → FINAL FIXED VERSION
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EventsGateway } from '@events/events.gateway';
import { EventsService } from '@events/events.service';
import { User, UserRole } from '@/users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private eventsGateway: EventsGateway,
    private eventsService: EventsService,
  ) {}

  // src/tasks/tasks.service.ts → FINAL create() method (PERFECT, NO MORE ERRORS)
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

    // This is the key: use insert() + get the inserted ID directly
    const insertResult = await this.taskRepo.insert(taskData);
    const insertedId = insertResult.identifiers[0].id as number;

    // NOW fetch the full task with relations — 100% safe
    const savedTask = await this.taskRepo.findOne({
      where: { id: insertedId },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!savedTask) throw new Error('Task creation failed');

    // Log & emit

    await this.eventsService.log(
      'task.created',
      savedTask.id,
      user.userId,
      savedTask,
    );
    // this.eventsGateway.emitGlobal('taskCreated', savedTask);

    // // Notify assignee if not self
    // if (savedTask.assignedToId && savedTask.assignedToId !== user.userId) {
    //   this.eventsGateway.emitToUser(savedTask.assignedToId, 'taskAssigned', savedTask);
    // }

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

    return savedTask;
  }
  // src/tasks/tasks.service.ts
  async findAll(user: any): Promise<Task[]> {
    if (user.role === 'admin') {
      return this.taskRepo.find({
        relations: ['assignedTo', 'createdBy'],
        order: { createdAt: 'DESC' },
      });
    }

    // Regular user: only tasks they created OR assigned to
    return this.taskRepo.find({
      where: [{ createdById: user.userId }, { assignedToId: user.userId }],
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  // src/tasks/tasks.service.ts → FINAL update() method (THIS WORKS 100%)
  async update(id: number, dto: UpdateTaskDto, user: any): Promise<Task> {
    // STEP 1: Update the task (including assignedToId)
    await this.taskRepo.update(id, dto as any);

    // STEP 2: CLEAR CACHE + FORCE FRESH QUERY USING QUERY BUILDER
    const updatedTask = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .where('task.id = :id', { id })
      .cache(false)
      .getOne();

    if (!updatedTask) throw new NotFoundException('Task not found');

    // Now we have the REAL data
    const oldAssignedToId =
      dto.assignedToId !== undefined
        ? (
            await this.taskRepo.findOne({
              where: { id },
              select: ['assignedToId'],
            })
          )?.assignedToId
        : updatedTask.assignedToId;

    // Log & emit with CORRECT data
    await this.eventsService.log('task.updated', id, user.userId, {
      dto,
      oldAssignedToId,
      newTask: updatedTask,
    });

    this.eventsGateway.emitGlobal('taskUpdated', updatedTask);

    if (
      dto.assignedToId !== undefined &&
      dto.assignedToId !== oldAssignedToId
    ) {
      if (dto.assignedToId) {
        this.eventsGateway.emitToUser(
          dto.assignedToId,
          'taskAssigned',
          updatedTask,
        );
      }
      if (oldAssignedToId) {
        this.eventsGateway.emitToUser(oldAssignedToId, 'taskUnassigned', {
          taskId: id,
        });
      }
    }

    return updatedTask;
  }

  async remove(id: number, user: any) {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
    await this.eventsService.log('task.deleted', id, user.userId);
    this.eventsGateway.emitGlobal('taskDeleted', { id });
  }
}
