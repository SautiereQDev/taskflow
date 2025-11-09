/**
 * DashboardMetricsService Unit Tests
 *
 * Tests dashboard metrics calculation with mocked repositories.
 * Mocks: ITaskRepository, IUserRepository
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import {
  DashboardMetricsService,
  type IDashboardMetrics,
  type IUserProductivityMetrics,
} from '@application/services/DashboardMetricsService.js';
import type { ITaskRepository } from '@domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { Task } from '@domain/entities/Task.js';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority } from '@domain/value-objects/TaskPriority.js';

// Mock repository type
type MockRepository<T> = {
  [K in keyof T]: Mock<any, any>;
};

describe('DashboardMetricsService', () => {
  let service: DashboardMetricsService;
  let mockTaskRepository: MockRepository<ITaskRepository>;
  let mockUserRepository: MockRepository<IUserRepository>;

  beforeEach(() => {
    // Create mock task repository
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

    // Create mock user repository
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

    // Create service with mocked dependencies
    service = new DashboardMetricsService(
      mockTaskRepository as unknown as ITaskRepository,
      mockUserRepository as unknown as IUserRepository
    );
  });

  describe('getOverallMetrics()', () => {
    it('should calculate metrics for empty task list', async () => {
      // Arrange
      mockTaskRepository.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10000,
        totalPages: 0,
      });

      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const metrics: IDashboardMetrics = await service.getOverallMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.totalTasks).toBe(0);
      expect(metrics.completionRate).toBe(0);
      expect(metrics.overdueTasks).toBe(0);
      expect(metrics.tasksCreatedThisWeek).toBe(0);
      expect(metrics.tasksCompletedThisWeek).toBe(0);
      expect(metrics.activeUsers).toBe(0);
    });

    it('should calculate tasks by status', async () => {
      // Arrange
      const tasks = [
        Task.create({
          id: 'task-1',
          title: 'TODO Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-2',
          title: 'In Progress Task',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-3',
          title: 'Done Task',
          status: TaskStatus.DONE,
          priority: TaskPriority.LOW,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-4',
          title: 'Cancelled Task',
          status: TaskStatus.CANCELLED,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
      ];

      mockTaskRepository.findAll.mockResolvedValue({
        items: tasks,
        total: 4,
        page: 1,
        limit: 10000,
        totalPages: 1,
      });

      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const metrics = await service.getOverallMetrics();

      // Assert
      expect(metrics.tasksByStatus[TaskStatus.TODO]).toBe(1);
      expect(metrics.tasksByStatus[TaskStatus.IN_PROGRESS]).toBe(1);
      expect(metrics.tasksByStatus[TaskStatus.DONE]).toBe(1);
      expect(metrics.tasksByStatus[TaskStatus.CANCELLED]).toBe(1);
    });

    it('should calculate tasks by priority', async () => {
      // Arrange
      const tasks = [
        Task.create({
          id: 'task-5',
          title: 'Low Priority',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-6',
          title: 'Medium Priority',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-7',
          title: 'High Priority',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-8',
          title: 'Urgent Priority',
          status: TaskStatus.TODO,
          priority: TaskPriority.URGENT,
          creatorId: 'creator-1',
        }),
      ];

      mockTaskRepository.findAll.mockResolvedValue({
        items: tasks,
        total: 4,
        page: 1,
        limit: 10000,
        totalPages: 1,
      });

      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const metrics = await service.getOverallMetrics();

      // Assert
      expect(metrics.tasksByPriority[TaskPriority.LOW]).toBe(1);
      expect(metrics.tasksByPriority[TaskPriority.MEDIUM]).toBe(1);
      expect(metrics.tasksByPriority[TaskPriority.HIGH]).toBe(1);
      expect(metrics.tasksByPriority[TaskPriority.URGENT]).toBe(1);
    });

    it('should calculate completion rate correctly', async () => {
      // Arrange
      const tasks = [
        Task.create({
          id: 'task-9',
          title: 'Done Task 1',
          status: TaskStatus.DONE,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-10',
          title: 'Done Task 2',
          status: TaskStatus.DONE,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-11',
          title: 'TODO Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
        Task.create({
          id: 'task-12',
          title: 'In Progress Task',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
      ];

      mockTaskRepository.findAll.mockResolvedValue({
        items: tasks,
        total: 4,
        page: 1,
        limit: 10000,
        totalPages: 1,
      });

      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const metrics = await service.getOverallMetrics();

      // Assert
      expect(metrics.totalTasks).toBe(4);
      expect(metrics.completionRate).toBe(50); // 2 out of 4 = 50%
    });

    it('should calculate overdue tasks (excluding completed and cancelled)', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7); // 7 days ago

      const tasks = [
        Task.create({
          id: 'task-13',
          title: 'Overdue TODO',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          creatorId: 'creator-1',
          dueDate: pastDate,
        }),
        Task.create({
          id: 'task-14',
          title: 'Overdue In Progress',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          creatorId: 'creator-1',
          dueDate: pastDate,
        }),
        Task.create({
          id: 'task-15',
          title: 'Overdue but Done',
          status: TaskStatus.DONE,
          priority: TaskPriority.HIGH,
          creatorId: 'creator-1',
          dueDate: pastDate,
        }),
        Task.create({
          id: 'task-16',
          title: 'Overdue but Cancelled',
          status: TaskStatus.CANCELLED,
          priority: TaskPriority.HIGH,
          creatorId: 'creator-1',
          dueDate: pastDate,
        }),
        Task.create({
          id: 'task-17',
          title: 'Not Overdue',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          creatorId: 'creator-1',
        }),
      ];

      mockTaskRepository.findAll.mockResolvedValue({
        items: tasks,
        total: 5,
        page: 1,
        limit: 10000,
        totalPages: 1,
      });

      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const metrics = await service.getOverallMetrics();

      // Assert
      expect(metrics.overdueTasks).toBe(2); // Only TODO and IN_PROGRESS overdue tasks
    });

    it('should calculate tasks created this week', async () => {
      // Arrange
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const recentTask = Task.create({
        id: 'task-18',
        title: 'Recent Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-1',
      });
      // Force createdAt to recent (within last week)
      Object.defineProperty(recentTask, 'createdAt', {
        value: new Date(),
        writable: false,
      });

      const oldTask = Task.create({
        id: 'task-19',
        title: 'Old Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-1',
      });
      // Force createdAt to old (more than 1 week ago)
      Object.defineProperty(oldTask, 'createdAt', {
        value: twoWeeksAgo,
        writable: false,
      });

      mockTaskRepository.findAll.mockResolvedValue({
        items: [recentTask, oldTask],
        total: 2,
        page: 1,
        limit: 10000,
        totalPages: 1,
      });

      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const metrics = await service.getOverallMetrics();

      // Assert
      expect(metrics.tasksCreatedThisWeek).toBe(1);
    });

    it('should calculate tasks completed this week', async () => {
      // Arrange
      const completedTask = Task.create({
        id: 'task-20',
        title: 'Completed This Week',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-1',
      });
      // Force completedAt to recent
      Object.defineProperty(completedTask, 'completedAt', {
        value: new Date(),
        writable: false,
      });

      const oldCompletedTask = Task.create({
        id: 'task-21',
        title: 'Completed Long Ago',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        creatorId: 'creator-1',
      });
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      Object.defineProperty(oldCompletedTask, 'completedAt', {
        value: twoWeeksAgo,
        writable: false,
      });

      mockTaskRepository.findAll.mockResolvedValue({
        items: [completedTask, oldCompletedTask],
        total: 2,
        page: 1,
        limit: 10000,
        totalPages: 1,
      });

      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const metrics = await service.getOverallMetrics();

      // Assert
      expect(metrics.tasksCompletedThisWeek).toBe(1);
    });

    it('should handle 100% completion rate', async () => {
      it('should handle 100% completion rate', async () => {
        // Arrange
        const tasks = [
          Task.create({
            id: 'task-22',
            title: 'Done Task 1',
            status: TaskStatus.DONE,
            priority: TaskPriority.MEDIUM,
            creatorId: 'creator-1',
          }),
          Task.create({
            id: 'task-23',
            title: 'Done Task 2',
            status: TaskStatus.DONE,
            priority: TaskPriority.HIGH,
            creatorId: 'creator-1',
          }),
        ];

        mockTaskRepository.findAll.mockResolvedValue({
          items: tasks,
          total: 2,
          page: 1,
          limit: 10000,
          totalPages: 1,
        });

        mockUserRepository.findAll.mockResolvedValue([]);

        // Act
        const metrics = await service.getOverallMetrics();

        // Assert
        expect(metrics.completionRate).toBe(100);
      });
    });

    describe('getUserMetrics()', () => {
      it('should calculate metrics for user with no tasks', async () => {
        // Arrange
        const userId = 'user-123';

        mockTaskRepository.findAll.mockResolvedValue({
          items: [],
          total: 0,
          page: 1,
          limit: 1000,
          totalPages: 0,
        });

        // Act
        const metrics: IUserProductivityMetrics = await service.getUserMetrics(userId);

        // Assert
        expect(metrics).toBeDefined();
        expect(metrics.userId).toBe(userId);
        expect(metrics.assignedTasks).toBe(0);
        expect(metrics.completedTasks).toBe(0);
        expect(metrics.overdueTasks).toBe(0);
        expect(metrics.completionRate).toBe(0);
      });

      it('should calculate user productivity metrics', async () => {
        // Arrange
        const userId = 'user-456';
        const tasks = [
          Task.create({
            id: 'task-24',
            title: 'Done Task',
            status: TaskStatus.DONE,
            priority: TaskPriority.MEDIUM,
            creatorId: 'creator-1',
            assigneeId: userId,
          }),
          Task.create({
            id: 'task-25',
            title: 'In Progress Task',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            creatorId: 'creator-1',
            assigneeId: userId,
          }),
          Task.create({
            id: 'task-26',
            title: 'TODO Task',
            status: TaskStatus.TODO,
            priority: TaskPriority.LOW,
            creatorId: 'creator-1',
            assigneeId: userId,
          }),
        ];

        mockTaskRepository.findAll.mockResolvedValue({
          items: tasks,
          total: 3,
          page: 1,
          limit: 1000,
          totalPages: 1,
        });

        // Act
        const metrics = await service.getUserMetrics(userId);

        // Assert
        expect(metrics.userId).toBe(userId);
        expect(metrics.assignedTasks).toBe(3);
        expect(metrics.completedTasks).toBe(1);
        expect(metrics.completionRate).toBe(33); // 1 out of 3 = 33%
      });

      it('should calculate overdue tasks for user', async () => {
        // Arrange
        const userId = 'user-789';
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);

        const tasks = [
          Task.create({
            id: 'task-27',
            title: 'Overdue Task 1',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            creatorId: 'creator-1',
            assigneeId: userId,
            dueDate: pastDate,
          }),
          Task.create({
            id: 'task-28',
            title: 'Overdue Task 2',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.URGENT,
            creatorId: 'creator-1',
            assigneeId: userId,
            dueDate: pastDate,
          }),
          Task.create({
            id: 'task-29',
            title: 'Not Overdue',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            creatorId: 'creator-1',
            assigneeId: userId,
          }),
        ];

        mockTaskRepository.findAll.mockResolvedValue({
          items: tasks,
          total: 3,
          page: 1,
          limit: 1000,
          totalPages: 1,
        });

        // Act
        const metrics = await service.getUserMetrics(userId);

        // Assert
        expect(metrics.overdueTasks).toBe(2);
      });

      it('should not count completed overdue tasks', async () => {
        // Arrange
        const userId = 'user-999';
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);

        const tasks = [
          Task.create({
            id: 'task-30',
            title: 'Overdue but Completed',
            status: TaskStatus.DONE,
            priority: TaskPriority.HIGH,
            creatorId: 'creator-1',
            assigneeId: userId,
            dueDate: pastDate,
          }),
          Task.create({
            id: 'task-31',
            title: 'Overdue but Cancelled',
            status: TaskStatus.CANCELLED,
            priority: TaskPriority.MEDIUM,
            creatorId: 'creator-1',
            assigneeId: userId,
            dueDate: pastDate,
          }),
        ];

        mockTaskRepository.findAll.mockResolvedValue({
          items: tasks,
          total: 2,
          page: 1,
          limit: 1000,
          totalPages: 1,
        });

        // Act
        const metrics = await service.getUserMetrics(userId);

        // Assert
        expect(metrics.overdueTasks).toBe(0);
      });

      it('should calculate 100% completion rate', async () => {
        // Arrange
        const userId = 'user-complete';
        const tasks = [
          Task.create({
            id: 'task-32',
            title: 'Done 1',
            status: TaskStatus.DONE,
            priority: TaskPriority.MEDIUM,
            creatorId: 'creator-1',
            assigneeId: userId,
          }),
          Task.create({
            id: 'task-33',
            title: 'Done 2',
            status: TaskStatus.DONE,
            priority: TaskPriority.HIGH,
            creatorId: 'creator-1',
            assigneeId: userId,
          }),
        ];

        mockTaskRepository.findAll.mockResolvedValue({
          items: tasks,
          total: 2,
          page: 1,
          limit: 1000,
          totalPages: 1,
        });

        // Act
        const metrics = await service.getUserMetrics(userId);

        // Assert
        expect(metrics.completionRate).toBe(100);
      });

      it('should filter tasks by assigneeId', async () => {
        // Arrange
        const userId = 'specific-user';

        mockTaskRepository.findAll.mockResolvedValue({
          items: [],
          total: 0,
          page: 1,
          limit: 1000,
          totalPages: 0,
        });

        // Act
        await service.getUserMetrics(userId);

        // Assert
        expect(mockTaskRepository.findAll).toHaveBeenCalledWith({ assigneeId: userId }, 1, 1000);
      });
    });

    describe('getTeamCapacity()', () => {
      it('should return empty array when no users', async () => {
        // Arrange
        mockUserRepository.findAll.mockResolvedValue([]);

        // Act
        const capacity = await service.getTeamCapacity();

        // Assert
        expect(capacity).toEqual([]);
      });

      it('should calculate capacity for all active users', async () => {
        // Arrange
        const user1 = User.create({
          id: 'user-4',
          name: 'User 1',
          email: Email.create('user1@example.com'),
          password: Password.fromHash('$2a$12$hash'),
          role: UserRole.USER,
        });
        Object.defineProperty(user1, 'id', { value: 'user-1', writable: false });

        const user2 = User.create({
          id: 'user-5',
          name: 'User 2',
          email: Email.create('user2@example.com'),
          password: Password.fromHash('$2a$12$hash'),
          role: UserRole.USER,
        });
        Object.defineProperty(user2, 'id', { value: 'user-2', writable: false });

        mockUserRepository.findAll.mockResolvedValue([user1, user2]);

        // Mock getUserMetrics calls
        mockTaskRepository.findAll
          .mockResolvedValueOnce({
            items: [
              Task.create({
                id: 'task-34',
                title: 'Task 1',
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                creatorId: 'creator',
                assigneeId: 'user-1',
              }),
            ],
            total: 1,
            page: 1,
            limit: 1000,
            totalPages: 1,
          })
          .mockResolvedValueOnce({
            items: [
              Task.create({
                id: 'task-35',
                title: 'Task 2',
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                creatorId: 'creator',
                assigneeId: 'user-2',
              }),
            ],
            total: 1,
            page: 1,
            limit: 1000,
            totalPages: 1,
          });

        // Act
        const capacity = await service.getTeamCapacity();

        // Assert
        expect(capacity).toHaveLength(2);
        expect(capacity[0].userId).toBe('user-1');
        expect(capacity[1].userId).toBe('user-2');
      });

      it('should sort by assigned tasks descending', async () => {
        // Arrange
        const user1 = User.create({
          id: 'user-8',
          name: 'User 1',
          email: Email.create('user1@example.com'),
          password: Password.fromHash('$2a$12$hash'),
          role: UserRole.USER,
        });
        Object.defineProperty(user1, 'id', { value: 'user-1', writable: false });

        const user2 = User.create({
          id: 'user-9',
          name: 'User 2',
          email: Email.create('user2@example.com'),
          password: Password.fromHash('$2a$12$hash'),
          role: UserRole.USER,
        });
        Object.defineProperty(user2, 'id', { value: 'user-2', writable: false });

        mockUserRepository.findAll.mockResolvedValue([user1, user2]);

        // User 1 has 5 tasks, User 2 has 2 tasks
        mockTaskRepository.findAll
          .mockResolvedValueOnce({
            items: new Array(5).fill(null).map(() =>
              Task.create({
                id: 'task-36',
                title: 'Task',
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                creatorId: 'creator',
                assigneeId: 'user-1',
              })
            ),
            total: 5,
            page: 1,
            limit: 1000,
            totalPages: 1,
          })
          .mockResolvedValueOnce({
            items: new Array(2).fill(null).map(() =>
              Task.create({
                id: 'task-37',
                title: 'Task',
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                creatorId: 'creator',
                assigneeId: 'user-2',
              })
            ),
            total: 2,
            page: 1,
            limit: 1000,
            totalPages: 1,
          });

        // Act
        const capacity = await service.getTeamCapacity();

        // Assert
        expect(capacity[0].userId).toBe('user-1');
        expect(capacity[0].assignedTasks).toBe(5);
        expect(capacity[1].userId).toBe('user-2');
        expect(capacity[1].assignedTasks).toBe(2);
      });
    });

    describe('error handling', () => {
      it('should propagate repository errors in getOverallMetrics', async () => {
        // Arrange
        mockTaskRepository.findAll.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(service.getOverallMetrics()).rejects.toThrow('Database error');
      });

      it('should propagate repository errors in getUserMetrics', async () => {
        // Arrange
        mockTaskRepository.findAll.mockRejectedValue(new Error('Query failed'));

        // Act & Assert
        await expect(service.getUserMetrics('user-123')).rejects.toThrow('Query failed');
      });

      it('should propagate repository errors in getTeamCapacity', async () => {
        // Arrange
        mockUserRepository.findAll.mockRejectedValue(new Error('User query failed'));

        // Act & Assert
        await expect(service.getTeamCapacity()).rejects.toThrow('User query failed');
      });
    });
  });
});
