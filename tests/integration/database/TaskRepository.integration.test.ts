/**
 * PrismaTaskRepository Integration Tests
 * Tests actual database operations with PostgreSQL test database
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaTaskRepository } from '@infrastructure/database/prisma/PrismaTaskRepository.js';
import { PrismaUserRepository } from '@infrastructure/database/prisma/PrismaUserRepository.js';
import { PrismaService } from '@infrastructure/database/prisma/PrismaService.js';
import { Task } from '@domain/entities/Task.js';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority } from '@domain/value-objects/TaskPriority.js';
import { cleanDatabase, disconnectTestDatabase } from '@tests/utils/test-db.js';

describe('PrismaTaskRepository Integration Tests', () => {
  let prismaService: PrismaService;
  let taskRepository: PrismaTaskRepository;
  let userRepository: PrismaUserRepository;
  let testCreator: User;
  let testAssignee: User;

  beforeAll(async () => {
    // Use test database
    prismaService = new PrismaService();
    taskRepository = new PrismaTaskRepository(prismaService);
    userRepository = new PrismaUserRepository(prismaService);

    // Ensure database connection
    await prismaService.ping();

    // Create test users
    const creatorPassword = await Password.create('CreatorPass123!');
    testCreator = await userRepository.create(
      User.create({
        name: 'Task Creator',
        email: Email.create('task-creator@test.com'),
        password: creatorPassword,
        role: UserRole.MANAGER,
      })
    );

    const assigneePassword = await Password.create('AssigneePass123!');
    testAssignee = await userRepository.create(
      User.create({
        name: 'Task Assignee',
        email: Email.create('task-assignee@test.com'),
        password: assigneePassword,
        role: UserRole.USER,
      })
    );
  });

  afterAll(async () => {
    // Cleanup and disconnect
    await cleanDatabase();
    await disconnectTestDatabase();
    await prismaService.disconnect();
  });

  beforeEach(async () => {
    // Clean tasks before each test (keep users)
    await prismaService.client.task.deleteMany({
      where: {
        OR: [{ createdById: testCreator.id }, { assigneeId: testAssignee.id }],
      },
    });
  });

  describe('create()', () => {
    it('should create a new task', async () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task Create',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: testCreator.id,
        assigneeId: testAssignee.id,
      });

      // Act
      const created = await taskRepository.create(task);

      // Assert
      expect(created).toBeDefined();
      expect(created.id).toBe(task.id);
      expect(created.title).toBe('Test Task Create');
      expect(created.status).toBe(TaskStatus.TODO);
      expect(created.priority).toBe(TaskPriority.MEDIUM);
      expect(created.createdById).toBe(testCreator.id);
      expect(created.assigneeId).toBe(testAssignee.id);
    });

    it('should create task with due date', async () => {
      // Arrange
      const dueDate = new Date('2025-12-31');
      const task = Task.create({
        title: 'Task with Due Date',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        createdById: testCreator.id,
        dueDate,
      });

      // Act
      const created = await taskRepository.create(task);

      // Assert
      expect(created.dueDate).toBeDefined();
      expect(created.dueDate?.toISOString()).toBe(dueDate.toISOString());
    });

    it('should create task without assignee', async () => {
      // Arrange
      const task = Task.create({
        title: 'Unassigned Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        createdById: testCreator.id,
      });

      // Act
      const created = await taskRepository.create(task);

      // Assert
      expect(created.assigneeId).toBeNull();
    });

    it('should create task without description', async () => {
      // Arrange
      const task = Task.create({
        title: 'Task Without Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: testCreator.id,
      });

      // Act
      const created = await taskRepository.create(task);

      // Assert
      expect(created.description).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should find task by ID', async () => {
      // Arrange
      const task = Task.create({
        title: 'Find By ID Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        createdById: testCreator.id,
      });
      const created = await taskRepository.create(task);

      // Act
      const found = await taskRepository.findById(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find By ID Task');
    });

    it('should return null for non-existent ID', async () => {
      // Act
      const found = await taskRepository.findById('non-existent-id');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findByAssignee()', () => {
    it('should find tasks by assignee', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Assigned Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
          assigneeId: testAssignee.id,
        })
      );

      await taskRepository.create(
        Task.create({
          title: 'Assigned Task 2',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          createdById: testCreator.id,
          assigneeId: testAssignee.id,
        })
      );

      // Act
      const tasks = await taskRepository.findByAssignee(testAssignee.id);

      // Assert
      expect(tasks.length).toBe(2);
      expect(tasks.every((t) => t.assigneeId === testAssignee.id)).toBe(true);
    });

    it('should return empty array for assignee with no tasks', async () => {
      // Act
      const tasks = await taskRepository.findByAssignee('non-existent-assignee');

      // Assert
      expect(tasks).toEqual([]);
    });
  });

  describe('findByCreator()', () => {
    it('should find tasks by creator', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Created Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          createdById: testCreator.id,
        })
      );

      await taskRepository.create(
        Task.create({
          title: 'Created Task 2',
          status: TaskStatus.DONE,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
        })
      );

      // Act
      const tasks = await taskRepository.findByCreator(testCreator.id);

      // Assert
      expect(tasks.length).toBeGreaterThanOrEqual(2);
      expect(tasks.every((t) => t.createdById === testCreator.id)).toBe(true);
    });
  });

  describe('findByStatus()', () => {
    it('should find tasks by status', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'In Progress Task',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          createdById: testCreator.id,
          assigneeId: testAssignee.id,
        })
      );

      await taskRepository.create(
        Task.create({
          title: 'TODO Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          createdById: testCreator.id,
        })
      );

      // Act
      const inProgressTasks = await taskRepository.findByStatus(TaskStatus.IN_PROGRESS);

      // Assert
      expect(inProgressTasks.length).toBeGreaterThanOrEqual(1);
      expect(inProgressTasks.every((t) => t.status === TaskStatus.IN_PROGRESS)).toBe(true);
    });
  });

  describe('findOverdue()', () => {
    it('should find overdue tasks', async () => {
      // Arrange - Create task with past due date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7); // 7 days ago

      await taskRepository.create(
        Task.create({
          title: 'Overdue Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.URGENT,
          createdById: testCreator.id,
          assigneeId: testAssignee.id,
          dueDate: pastDate,
        })
      );

      // Create a task due in the future (should not be included)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await taskRepository.create(
        Task.create({
          title: 'Future Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
          dueDate: futureDate,
        })
      );

      // Act
      const overdueTasks = await taskRepository.findOverdue();

      // Assert
      expect(overdueTasks.length).toBeGreaterThanOrEqual(1);
      const overdueTask = overdueTasks.find((t) => t.title === 'Overdue Task');
      expect(overdueTask).toBeDefined();
    });

    it('should not include completed tasks as overdue', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      await taskRepository.create(
        Task.create({
          title: 'Completed Past Due Task',
          status: TaskStatus.DONE,
          priority: TaskPriority.HIGH,
          createdById: testCreator.id,
          dueDate: pastDate,
        })
      );

      // Act
      const overdueTasks = await taskRepository.findOverdue();

      // Assert
      const completedTask = overdueTasks.find((t) => t.title === 'Completed Past Due Task');
      expect(completedTask).toBeUndefined();
    });
  });

  describe('findDueInRange()', () => {
    it('should find tasks due within date range', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await taskRepository.create(
        Task.create({
          title: 'Due Tomorrow',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
          dueDate: tomorrow,
        })
      );

      // Act
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const tasks = await taskRepository.findDueInRange(today, nextWeek);

      // Assert
      expect(tasks.length).toBeGreaterThanOrEqual(1);
      const task = tasks.find((t) => t.title === 'Due Tomorrow');
      expect(task).toBeDefined();
    });

    it('should not include tasks outside date range', async () => {
      // Arrange
      const farFuture = new Date();
      farFuture.setMonth(farFuture.getMonth() + 6);

      await taskRepository.create(
        Task.create({
          title: 'Far Future Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          createdById: testCreator.id,
          dueDate: farFuture,
        })
      );

      // Act
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const tasks = await taskRepository.findDueInRange(today, nextWeek);

      // Assert
      const farTask = tasks.find((t) => t.title === 'Far Future Task');
      expect(farTask).toBeUndefined();
    });
  });

  describe('findAll() with pagination', () => {
    it('should return paginated results', async () => {
      // Arrange - Create multiple tasks
      for (let i = 1; i <= 5; i++) {
        await taskRepository.create(
          Task.create({
            title: `Paginated Task ${i}`,
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            createdById: testCreator.id,
          })
        );
      }

      // Act
      const result = await taskRepository.findAll(undefined, 1, 3);

      // Assert
      expect(result.items.length).toBeLessThanOrEqual(3);
      expect(result.total).toBeGreaterThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
      expect(result.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('should filter by status', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Done Task Filter',
          status: TaskStatus.DONE,
          priority: TaskPriority.LOW,
          createdById: testCreator.id,
        })
      );

      await taskRepository.create(
        Task.create({
          title: 'TODO Task Filter',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
        })
      );

      // Act
      const result = await taskRepository.findAll({ status: TaskStatus.DONE }, 1, 10);

      // Assert
      expect(result.items.every((t) => t.status === TaskStatus.DONE)).toBe(true);
    });

    it('should filter by priority', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Urgent Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.URGENT,
          createdById: testCreator.id,
        })
      );

      // Act
      const result = await taskRepository.findAll({ priority: TaskPriority.URGENT }, 1, 10);

      // Assert
      expect(result.items.every((t) => t.priority === TaskPriority.URGENT)).toBe(true);
    });

    it('should filter by assigneeId', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Assigned Filter Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
          assigneeId: testAssignee.id,
        })
      );

      // Act
      const result = await taskRepository.findAll({ assigneeId: testAssignee.id }, 1, 10);

      // Assert
      expect(result.items.every((t) => t.assigneeId === testAssignee.id)).toBe(true);
    });

    it('should filter by creatorId', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Creator Filter Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          createdById: testCreator.id,
        })
      );

      // Act
      const result = await taskRepository.findAll({ creatorId: testCreator.id }, 1, 10);

      // Assert
      expect(result.items.every((t) => t.createdById === testCreator.id)).toBe(true);
    });

    it('should search by title', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Searchable Unique Task Title',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
        })
      );

      // Act
      const result = await taskRepository.findAll({ search: 'Unique' }, 1, 10);

      // Assert
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      expect(result.items.find((t) => t.title.includes('Unique'))).toBeDefined();
    });
  });

  describe('update()', () => {
    it('should update task properties', async () => {
      // Arrange
      let task = Task.create({
        title: 'Original Title',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        createdById: testCreator.id,
      });
      task = await taskRepository.create(task);

      // Act
      task.updateDetails({ title: 'Updated Title', priority: TaskPriority.HIGH });
      const updated = await taskRepository.update(task);

      // Assert
      expect(updated.title).toBe('Updated Title');
      expect(updated.priority).toBe(TaskPriority.HIGH);
    });

    it('should mark task as complete', async () => {
      // Arrange
      let task = Task.create({
        title: 'Task to Complete',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        createdById: testCreator.id,
      });
      task = await taskRepository.create(task);

      // Act
      task.complete();
      const updated = await taskRepository.update(task);

      // Assert
      expect(updated.status).toBe(TaskStatus.DONE);
      expect(updated.completedAt).toBeDefined();
    });

    it('should assign task to user', async () => {
      // Arrange
      let task = Task.create({
        title: 'Task to Assign',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: testCreator.id,
      });
      task = await taskRepository.create(task);

      // Act
      task.assignTo(testAssignee.id);
      const updated = await taskRepository.update(task);

      // Assert
      expect(updated.assigneeId).toBe(testAssignee.id);
    });

    it('should unassign task', async () => {
      // Arrange
      let task = Task.create({
        title: 'Task to Unassign',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: testCreator.id,
        assigneeId: testAssignee.id,
      });
      task = await taskRepository.create(task);

      // Act
      task.unassign();
      const updated = await taskRepository.update(task);

      // Assert
      expect(updated.assigneeId).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should delete task', async () => {
      // Arrange
      const task = Task.create({
        title: 'Task to Delete',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        createdById: testCreator.id,
      });
      const created = await taskRepository.create(task);

      // Act
      await taskRepository.delete(created.id);

      // Assert
      const found = await taskRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should not throw error when deleting non-existent task', async () => {
      // Act & Assert
      await expect(taskRepository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('count()', () => {
    it('should count all tasks', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Count Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          createdById: testCreator.id,
        })
      );

      await taskRepository.create(
        Task.create({
          title: 'Count Task 2',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
        })
      );

      // Act
      const total = await taskRepository.count();

      // Assert
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should count tasks by priority', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Urgent Count Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.URGENT,
          createdById: testCreator.id,
        })
      );

      // Act
      const urgentCount = await taskRepository.count({ priority: TaskPriority.URGENT });

      // Assert
      expect(urgentCount).toBeGreaterThanOrEqual(1);
    });

    it('should count tasks by status', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'In Progress Count',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
        })
      );

      // Act
      const inProgressCount = await taskRepository.count({ status: TaskStatus.IN_PROGRESS });

      // Assert
      expect(inProgressCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('countByStatus()', () => {
    it('should count tasks by specific status', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Done Status Count',
          status: TaskStatus.DONE,
          priority: TaskPriority.LOW,
          createdById: testCreator.id,
        })
      );

      // Act
      const doneCount = await taskRepository.countByStatus(TaskStatus.DONE);

      // Assert
      expect(doneCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('countByAssignee()', () => {
    it('should count tasks by assignee', async () => {
      // Arrange
      await taskRepository.create(
        Task.create({
          title: 'Assignee Count 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: testCreator.id,
          assigneeId: testAssignee.id,
        })
      );

      await taskRepository.create(
        Task.create({
          title: 'Assignee Count 2',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          createdById: testCreator.id,
          assigneeId: testAssignee.id,
        })
      );

      // Act
      const assigneeCount = await taskRepository.countByAssignee(testAssignee.id);

      // Assert
      expect(assigneeCount).toBe(2);
    });
  });

  describe('existsById()', () => {
    it('should return true for existing task', async () => {
      // Arrange
      const task = Task.create({
        title: 'Exists Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        createdById: testCreator.id,
      });
      const created = await taskRepository.create(task);

      // Act
      const exists = await taskRepository.existsById(created.id);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false for non-existent task', async () => {
      // Act
      const exists = await taskRepository.existsById('non-existent-id');

      // Assert
      expect(exists).toBe(false);
    });
  });
});
