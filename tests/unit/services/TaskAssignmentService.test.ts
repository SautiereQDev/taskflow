/**
 * TaskAssignmentService Unit Tests
 *
 * Tests task assignment business logic with mocked repositories.
 * Mocks: ITaskRepository, IUserRepository
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { TaskAssignmentService } from '@application/services/TaskAssignmentService.js';
import type { ITaskRepository } from '@domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { Task } from '@domain/entities/Task.js';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority } from '@domain/value-objects/TaskPriority.js';

type MockRepository<T> = {
  [K in keyof T]: Mock<any, any>;
};

describe('TaskAssignmentService', () => {
  let service: TaskAssignmentService;
  let mockTaskRepository: MockRepository<ITaskRepository>;
  let mockUserRepository: MockRepository<IUserRepository>;

  beforeEach(() => {
    mockTaskRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByAssignee: vi.fn(),
      findByCreator: vi.fn(),
      findByStatus: vi.fn(),
      findOverdue: vi.fn(),
      findDueInRange: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsById: vi.fn(),
      count: vi.fn(),
      countByStatus: vi.fn(),
      countByAssignee: vi.fn(),
    };

    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByRole: vi.fn(),
      findActive: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsByEmail: vi.fn(),
      existsById: vi.fn(),
      count: vi.fn(),
    };

    service = new TaskAssignmentService(
      mockTaskRepository as unknown as ITaskRepository,
      mockUserRepository as unknown as IUserRepository
    );
  });

  describe('assignTask()', () => {
    it('should assign task to active user', async () => {
      const taskId = 'task-123';
      const assigneeId = 'user-456';

      const task = Task.create({
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-789',
      });

      const assignee = User.create({
        id: 'user-1',
        name: 'Assignee User',
        email: Email.create('assignee@example.com'),
        password: Password.fromHash('$2a$12$hash'),
        role: UserRole.USER,
      });

      mockTaskRepository.findById.mockResolvedValue(task);
      mockUserRepository.findById.mockResolvedValue(assignee);
      mockTaskRepository.update.mockResolvedValue(task);

      const result = await service.assignTask(taskId, assigneeId);

      expect(result).toBe(task);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(assigneeId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(task);
    });

    it('should throw AppError when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.assignTask('nonexistent-task', 'user-123')).rejects.toThrow(
        'Task not found'
      );
    });

    it('should throw AppError when assignee not found', async () => {
      const task = Task.create({
        id: 'task-2',
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-789',
      });

      mockTaskRepository.findById.mockResolvedValue(task);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.assignTask('task-123', 'nonexistent-user')).rejects.toThrow(
        'Assignee not found'
      );
    });

    it('should throw AppError when assignee is inactive', async () => {
      const task = Task.create({
        id: 'task-3',
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-789',
      });

      const inactiveUser = User.create({
        id: 'user-2',
        name: 'Inactive User',
        email: Email.create('inactive@example.com'),
        password: Password.fromHash('$2a$12$hash'),
        role: UserRole.USER,
      });
      inactiveUser.deactivate();

      mockTaskRepository.findById.mockResolvedValue(task);
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      await expect(service.assignTask('task-123', 'inactive-user')).rejects.toThrow(
        'Cannot assign task to inactive user'
      );
    });
  });

  describe('unassignTask()', () => {
    it('should unassign task successfully', async () => {
      const taskId = 'task-123';
      const task = Task.create({
        id: 'task-4',
        title: 'Assigned Task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-789',
        assigneeId: 'user-456',
      });

      mockTaskRepository.findById.mockResolvedValue(task);
      mockTaskRepository.update.mockResolvedValue(task);

      const result = await service.unassignTask(taskId);

      expect(result).toBe(task);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(task);
    });

    it('should throw AppError when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.unassignTask('nonexistent-task')).rejects.toThrow('Task not found');
    });
  });
});
