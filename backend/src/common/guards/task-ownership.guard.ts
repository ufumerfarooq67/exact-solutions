import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TasksService } from '@tasks/tasks.service';

@Injectable()
export class TaskOwnershipGuard implements CanActivate {
  constructor(private tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const taskId = parseInt(request.params.id);

    if (!taskId) return true;

    const task = await this.tasksService.findOne(taskId);

    // Admin can do anything
    if (user.role === 'admin') return true;

    // User can only modify their own tasks
    if (task.createdById === user.userId || task.assignedToId === user.userId) {
      return true;
    }

    throw new ForbiddenException('You can only modify your own tasks');
  }
}