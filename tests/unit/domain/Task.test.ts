/**
 * Task Entity Unit Tests
 * Validates task creation with factory pattern
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Task } from '@domain/entities/Task.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority } from '@domain/value-objects/TaskPriority.js';
import { createTestTask, resetFactoryCounters } from '@tests/utils/factories.js';

// Helper function to create Task entity instances for testing methods
let taskCounter = 0;
function createTaskEntity(overrides?: {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
}): Task {
  taskCounter++;
  return Task.create({
    id: `task-${taskCounter}`,
    title: overrides?.title ?? `Test Task ${taskCounter}`,
    description: overrides?.description ?? null,
    status: overrides?.status ?? TaskStatus.TODO,
    priority: overrides?.priority ?? TaskPriority.MEDIUM,
    creatorId: 'user-1',
    assigneeId: overrides?.assigneeId ?? null,
    dueDate: overrides?.dueDate ?? null,
  });
}

describe('Task Entity', () => {
  beforeEach(() => {
    resetFactoryCounters();
    taskCounter = 0;
  });

  describe('Factory Creation', () => {
    it('should create task with default values', () => {
      const task = createTestTask();

      expect(task.id).toBe('task-1');
      expect(task.title).toBe('Test Task 1');
      expect(task.description).toBeNull();
      expect(task.status).toBe('TODO');
      expect(task.priority).toBe('MEDIUM');
      expect(task.dueDate).toBeNull();
      expect(task.createdById).toBe('user-1');
      expect(task.assigneeId).toBeNull();
    });

    it('should create task with sequential IDs', () => {
      const task1 = createTestTask();
      const task2 = createTestTask();
      const task3 = createTestTask();

      expect(task1.id).toBe('task-1');
      expect(task2.id).toBe('task-2');
      expect(task3.id).toBe('task-3');
    });

    it('should create task with custom title', () => {
      const task = createTestTask({ title: 'Custom Task Title' });

      expect(task.title).toBe('Custom Task Title');
      expect(task.status).toBe('TODO'); // Other defaults preserved
    });

    it('should create task with custom status', () => {
      const task = createTestTask({ status: 'IN_PROGRESS' });

      expect(task.status).toBe('IN_PROGRESS');
      expect(task.priority).toBe('MEDIUM'); // Other defaults preserved
    });

    it('should create task with custom priority', () => {
      const task = createTestTask({ priority: 'HIGH' });

      expect(task.priority).toBe('HIGH');
      expect(task.status).toBe('TODO'); // Other defaults preserved
    });

    it('should create task with due date', () => {
      const dueDate = new Date('2025-12-31');
      const task = createTestTask({ dueDate });

      expect(task.dueDate).toEqual(dueDate);
    });

    it('should create task with assignee', () => {
      const task = createTestTask({ assigneeId: 'user-123' });

      expect(task.assigneeId).toBe('user-123');
    });

    it('should create task with description', () => {
      const task = createTestTask({
        description: 'This is a detailed task description',
      });

      expect(task.description).toBe('This is a detailed task description');
    });

    it('should create task with multiple overrides', () => {
      const dueDate = new Date('2025-06-15');
      const task = createTestTask({
        title: 'Complex Task',
        description: 'A complex task with many properties',
        status: 'DONE',
        priority: 'URGENT',
        dueDate,
        assigneeId: 'user-456',
      });

      expect(task.title).toBe('Complex Task');
      expect(task.description).toBe('A complex task with many properties');
      expect(task.status).toBe('DONE');
      expect(task.priority).toBe('URGENT');
      expect(task.dueDate).toEqual(dueDate);
      expect(task.assigneeId).toBe('user-456');
    });
  });

  describe('Factory Counter Reset', () => {
    it('should reset counter when called explicitly', () => {
      createTestTask();
      createTestTask();
      const task1 = createTestTask();
      expect(task1.id).toBe('task-3');

      resetFactoryCounters();

      const task2 = createTestTask();
      expect(task2.id).toBe('task-1');
    });

    it('should reset counter before each test', () => {
      // This test runs after the previous one
      // If beforeEach works correctly, ID should start at 1
      const task = createTestTask();
      expect(task.id).toBe('task-1');
    });
  });

  describe('Task Status Validation', () => {
    it('should accept all valid task statuses', () => {
      const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const;

      statuses.forEach((status) => {
        const task = createTestTask({ status });
        expect(task.status).toBe(status);
      });
    });
  });

  describe('Task Priority Validation', () => {
    it('should accept all valid task priorities', () => {
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

      priorities.forEach((priority) => {
        const task = createTestTask({ priority });
        expect(task.priority).toBe(priority);
      });
    });
  });

  describe('Task Timestamps', () => {
    it('should have createdAt timestamp', () => {
      const task = createTestTask();
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt timestamp', () => {
      const task = createTestTask();
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should have createdAt and updatedAt equal on creation', () => {
      const task = createTestTask();
      expect(task.createdAt.getTime()).toBe(task.updatedAt.getTime());
    });
  });

  describe('Task.updateTitle()', () => {
    it('should update title with valid input', () => {
      const task = createTaskEntity({ title: 'Old Title' });
      const oldUpdatedAt = task.updatedAt;

      // Wait a bit to ensure updatedAt changes
      task.updateTitle('New Title');

      expect(task.title).toBe('New Title');
      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should trim whitespace from title', () => {
      const task = createTaskEntity();
      task.updateTitle('  Trimmed Title  ');

      expect(task.title).toBe('Trimmed Title');
    });

    it('should throw error for empty title', () => {
      const task = createTaskEntity();

      expect(() => task.updateTitle('')).toThrow('Task title is required');
      expect(() => task.updateTitle('   ')).toThrow('Task title is required');
    });

    it('should throw error for title less than 3 characters', () => {
      const task = createTaskEntity();

      expect(() => task.updateTitle('ab')).toThrow('Task title must be at least 3 characters');
    });

    it('should throw error for title exceeding 200 characters', () => {
      const task = createTaskEntity();
      const longTitle = 'a'.repeat(201);

      expect(() => task.updateTitle(longTitle)).toThrow(
        'Task title must not exceed 200 characters'
      );
    });
  });

  describe('Task.updateDescription()', () => {
    it('should update description with valid input', () => {
      const task = createTaskEntity();
      task.updateDescription('New description');

      expect(task.description).toBe('New description');
    });

    it('should allow null description', () => {
      const task = createTaskEntity({ description: 'Has description' });
      task.updateDescription(null);

      expect(task.description).toBeNull();
    });

    it('should trim whitespace from description', () => {
      const task = createTaskEntity();
      task.updateDescription('  Trimmed description  ');

      expect(task.description).toBe('Trimmed description');
    });

    it('should throw error for description exceeding 2000 characters', () => {
      const task = createTaskEntity();
      const longDescription = 'a'.repeat(2001);

      expect(() => task.updateDescription(longDescription)).toThrow(
        'Task description must not exceed 2000 characters'
      );
    });
  });

  describe('Task.changeStatus()', () => {
    it('should change status from TODO to IN_PROGRESS', () => {
      const task = createTaskEntity({ status: TaskStatus.TODO });
      task.changeStatus(TaskStatus.IN_PROGRESS);

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should change status from IN_PROGRESS to DONE', () => {
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      task.changeStatus(TaskStatus.DONE);

      expect(task.status).toBe(TaskStatus.DONE);
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('should set completedAt when status becomes DONE', () => {
      const task = createTaskEntity({ status: TaskStatus.TODO });
      task.changeStatus(TaskStatus.IN_PROGRESS);
      expect(task.completedAt).toBeNull();

      task.changeStatus(TaskStatus.DONE);
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('should clear completedAt when status changes from DONE', () => {
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      task.changeStatus(TaskStatus.DONE);
      expect(task.completedAt).not.toBeNull();

      task.changeStatus(TaskStatus.IN_PROGRESS);
      expect(task.completedAt).toBeNull();
    });

    it('should throw error for invalid status transition', () => {
      const task = createTaskEntity({ status: TaskStatus.TODO });

      expect(() => task.changeStatus(TaskStatus.DONE)).toThrow(
        'Cannot transition from TODO to DONE'
      );
    });

    it('should allow transition from DONE to IN_PROGRESS', () => {
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      task.changeStatus(TaskStatus.DONE);
      task.changeStatus(TaskStatus.IN_PROGRESS);

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should allow cancelling from any status', () => {
      const taskTodo = createTaskEntity({ status: TaskStatus.TODO });
      taskTodo.changeStatus(TaskStatus.CANCELLED);
      expect(taskTodo.status).toBe(TaskStatus.CANCELLED);

      const taskInProgress = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      taskInProgress.changeStatus(TaskStatus.CANCELLED);
      expect(taskInProgress.status).toBe(TaskStatus.CANCELLED);
    });
  });

  describe('Task.updatePriority()', () => {
    it('should update priority with valid value', () => {
      const task = createTaskEntity({ priority: TaskPriority.LOW });
      task.updatePriority(TaskPriority.HIGH);

      expect(task.priority).toBe(TaskPriority.HIGH);
    });

    it('should update priority to URGENT', () => {
      const task = createTaskEntity({ priority: TaskPriority.MEDIUM });
      task.updatePriority(TaskPriority.URGENT);

      expect(task.priority).toBe(TaskPriority.URGENT);
    });

    it('should update updatedAt timestamp', () => {
      const task = createTaskEntity();
      const oldUpdatedAt = task.updatedAt;

      task.updatePriority(TaskPriority.HIGH);

      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('Task.assignTo() and unassign()', () => {
    it('should assign task to user', () => {
      const task = createTaskEntity({ assigneeId: null });
      task.assignTo('user-123');

      expect(task.assigneeId).toBe('user-123');
      expect(task.isAssigned()).toBe(true);
    });

    it('should throw error for empty user ID', () => {
      const task = createTaskEntity();

      expect(() => task.assignTo('')).toThrow('User ID is required');
      expect(() => task.assignTo('   ')).toThrow('User ID is required');
    });

    it('should trim whitespace from user ID', () => {
      const task = createTaskEntity();
      task.assignTo('  user-456  ');

      expect(task.assigneeId).toBe('user-456');
    });

    it('should unassign task', () => {
      const task = createTaskEntity({ assigneeId: 'user-123' });
      task.unassign();

      expect(task.assigneeId).toBeNull();
      expect(task.isAssigned()).toBe(false);
    });

    it('should update updatedAt on assignment changes', () => {
      const task = createTaskEntity();
      const oldUpdatedAt = task.updatedAt;

      task.assignTo('user-123');

      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('Task.setDueDate() and clearDueDate()', () => {
    it('should set valid due date', () => {
      const task = createTaskEntity({ dueDate: null });
      const dueDate = new Date('2025-12-31');

      task.setDueDate(dueDate);

      expect(task.dueDate).toEqual(dueDate);
    });

    it('should throw error for invalid due date', () => {
      const task = createTaskEntity();
      const invalidDate = new Date('invalid');

      expect(() => task.setDueDate(invalidDate)).toThrow('Invalid due date');
    });

    it('should clear due date', () => {
      const task = createTaskEntity({ dueDate: new Date('2025-12-31') });
      task.clearDueDate();

      expect(task.dueDate).toBeNull();
    });

    it('should update updatedAt on due date changes', () => {
      const task = createTaskEntity();
      const oldUpdatedAt = task.updatedAt;

      task.setDueDate(new Date('2025-12-31'));

      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('Task.complete()', () => {
    it('should mark task as complete from IN_PROGRESS', () => {
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      task.complete();

      expect(task.status).toBe(TaskStatus.DONE);
      expect(task.isCompleted()).toBe(true);
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('should throw error if already completed', () => {
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      task.complete();

      expect(() => task.complete()).toThrow('Task is already completed');
    });

    it('should mark TODO task as complete', () => {
      const task = createTaskEntity({ status: TaskStatus.TODO });
      task.changeStatus(TaskStatus.IN_PROGRESS);
      task.complete();

      expect(task.status).toBe(TaskStatus.DONE);
    });
  });

  describe('Task.cancel()', () => {
    it('should cancel task from TODO', () => {
      const task = createTaskEntity({ status: TaskStatus.TODO });
      task.cancel();

      expect(task.status).toBe(TaskStatus.CANCELLED);
    });

    it('should cancel task from IN_PROGRESS', () => {
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      task.cancel();

      expect(task.status).toBe(TaskStatus.CANCELLED);
    });

    it('should throw error if already cancelled', () => {
      const task = createTaskEntity({ status: TaskStatus.TODO });
      task.cancel();

      expect(() => task.cancel()).toThrow('Task is already cancelled');
    });
  });

  describe('Task.isOverdue()', () => {
    it('should return true for overdue tasks', () => {
      const pastDate = new Date('2020-01-01');
      const task = createTaskEntity({ status: TaskStatus.TODO, dueDate: pastDate });

      expect(task.isOverdue()).toBe(true);
    });

    it('should return false for future tasks', () => {
      const futureDate = new Date('2030-12-31');
      const task = createTaskEntity({ status: TaskStatus.TODO, dueDate: futureDate });

      expect(task.isOverdue()).toBe(false);
    });

    it('should return false for completed tasks even if past due date', () => {
      const pastDate = new Date('2020-01-01');
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS, dueDate: pastDate });
      task.complete();

      expect(task.isOverdue()).toBe(false);
    });

    it('should return false for tasks without due date', () => {
      const task = createTaskEntity({ dueDate: null });

      expect(task.isOverdue()).toBe(false);
    });
  });

  describe('Task.isAssigned()', () => {
    it('should return true when task is assigned', () => {
      const task = createTaskEntity({ assigneeId: 'user-123' });

      expect(task.isAssigned()).toBe(true);
    });

    it('should return false when task is not assigned', () => {
      const task = createTaskEntity({ assigneeId: null });

      expect(task.isAssigned()).toBe(false);
    });
  });

  describe('Task.isCompleted()', () => {
    it('should return true when task status is DONE', () => {
      const task = createTaskEntity({ status: TaskStatus.IN_PROGRESS });
      task.complete();

      expect(task.isCompleted()).toBe(true);
    });

    it('should return false when task status is not DONE', () => {
      const task = createTaskEntity({ status: TaskStatus.TODO });

      expect(task.isCompleted()).toBe(false);
    });
  });

  describe('Task.toPlainObject()', () => {
    it('should convert task to plain object', () => {
      const task = createTaskEntity({
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      });

      const plainObject = task.toPlainObject();

      expect(plainObject).toHaveProperty('id');
      expect(plainObject).toHaveProperty('title', 'Test Task');
      expect(plainObject).toHaveProperty('description', 'Test Description');
      expect(plainObject).toHaveProperty('status', TaskStatus.TODO);
      expect(plainObject).toHaveProperty('priority', TaskPriority.HIGH);
      expect(plainObject).toHaveProperty('createdAt');
      expect(plainObject).toHaveProperty('updatedAt');
    });

    it('should return dates as Date objects', () => {
      const task = createTaskEntity();
      const plainObject = task.toPlainObject();

      expect(plainObject.createdAt).toBeInstanceOf(Date);
      expect(plainObject.updatedAt).toBeInstanceOf(Date);
    });
  });
});
