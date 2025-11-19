// src/tasks/tasks.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from '@users/entities/user.entity';
import { EventsGateway } from '@events/events.gateway';
import { EventsService } from '@events/events.service';
import { ForbiddenException } from '@nestjs/common';

const mockTask = {
  id: 1,
  title: 'Test Task',
  createdById: 1,
  assignedToId: null,
} as unknown as Task;

describe('TasksService', () => {
  let service: TasksService;

  const mockTaskRepo = {
    insert: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      cache: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  const mockUserRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockEventsGateway = {
    emitToUser: jest.fn(),
    emitGlobal: jest.fn(),
  };

  const mockEventsService = { log: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('update', () => {
    beforeEach(() => {
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockTaskRepo.update.mockResolvedValue({ affected: 1 });
    });

    it('should prevent non-owner/non-admin from updating', async () => {
      await expect(
        service.update(1, { title: 'Hack' }, { userId: 999, role: 'user' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow owner to update', async () => {
      const updatedTask = { ...mockTask, title: 'My Updated Task' };
      mockTaskRepo.findOne.mockResolvedValueOnce(mockTask);
      mockTaskRepo.findOne.mockResolvedValueOnce(updatedTask);

      const result = await service.update(
        1,
        { title: 'My Updated Task' },
        { userId: 1, role: 'user' },
      );

      expect(result.title).toBe('My Updated Task');
    });

    it('should emit taskAssigned when assignment changes', async () => {
      const assignedTask = { ...mockTask, assignedToId: 50 };
      mockTaskRepo.findOne.mockResolvedValueOnce(mockTask);
      mockTaskRepo.findOne.mockResolvedValueOnce(assignedTask);

      await service.update(
        1,
        { assignedToId: 50 },
        { userId: 100, role: 'admin' },
      );

      expect(mockEventsGateway.emitToUser).toHaveBeenCalledWith(
        50,
        'taskAssigned',
        expect.any(Object),
      );
    });
  });
});
