/**
 * Task Entity Unit Tests
 * Validates task creation with factory pattern
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestTask, resetFactoryCounters } from '@tests/utils/factories.js';

describe('Task Entity', () => {
  beforeEach(() => {
    resetFactoryCounters();
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
});
