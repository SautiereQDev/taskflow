import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignTaskHandler } from './AssignTaskHandler.js';
import { AssignTaskCommand } from './AssignTaskCommand.js';
import { TaskAssignmentService } from '../../services/TaskAssignmentService.js';
import { EventBus } from '../../events/EventBus.js';
import { Task } from '../../../domain/entities/Task.js';
import { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';
import { TaskPriority } from '../../../domain/value-objects/TaskPriority.js';

describe('AssignTaskHandler', () => {
  let handler: AssignTaskHandler;
  let mockAssignmentService: TaskAssignmentService;
  let mockEventBus: EventBus;

  beforeEach(() => {
    // Mock TaskAssignmentService
    mockAssignmentService = {
      assignTask: vi.fn(),
    } as unknown as TaskAssignmentService;

    // Mock EventBus
    mockEventBus = {
      publish: vi.fn(),
    } as unknown as EventBus;

    handler = new AssignTaskHandler(mockAssignmentService, mockEventBus);
  });

  describe('execute', () => {
    it('should assign task and publish event', async () => {
      // Arrange
      const command = new AssignTaskCommand('task-123', 'user-456');
      const mockTask = new Task(
        'task-123',
        'Test Task',
        'Description',
        TaskStatus.TODO,
        TaskPriority.MEDIUM,
        'creator-123',
        'user-456',
        null,
        new Date(),
        new Date()
      );

      vi.spyOn(mockAssignmentService, 'assignTask').mockResolvedValue(mockTask);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBe(mockTask);
      expect(mockAssignmentService.assignTask).toHaveBeenCalledWith('task-123', 'user-456');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: 'task-123',
          assigneeId: 'user-456',
          eventType: 'TaskAssigned',
        })
      );
    });

    it('should throw error if task not found', async () => {
      // Arrange
      const command = new AssignTaskCommand('invalid-task', 'user-456');
      vi.spyOn(mockAssignmentService, 'assignTask').mockRejectedValue(new Error('Task not found'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Task not found');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should throw error if assignee not found', async () => {
      // Arrange
      const command = new AssignTaskCommand('task-123', 'invalid-user');
      vi.spyOn(mockAssignmentService, 'assignTask').mockRejectedValue(
        new Error('Assignee not found')
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Assignee not found');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should throw error if assignee is inactive', async () => {
      // Arrange
      const command = new AssignTaskCommand('task-123', 'inactive-user');
      vi.spyOn(mockAssignmentService, 'assignTask').mockRejectedValue(
        new Error('Cannot assign task to inactive user')
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Cannot assign task to inactive user');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });
});

describe('AssignTaskCommand', () => {
  it('should create command with valid data', () => {
    // Act
    const command = new AssignTaskCommand('task-123', 'user-456');

    // Assert
    expect(command.taskId).toBe('task-123');
    expect(command.assigneeId).toBe('user-456');
  });

  it('should throw error if taskId is empty', () => {
    // Act & Assert
    expect(() => new AssignTaskCommand('', 'user-456')).toThrow('Task ID is required');
  });

  it('should throw error if assigneeId is empty', () => {
    // Act & Assert
    expect(() => new AssignTaskCommand('task-123', '')).toThrow('Assignee ID is required');
  });

  it('should throw error if taskId is whitespace only', () => {
    // Act & Assert
    expect(() => new AssignTaskCommand('   ', 'user-456')).toThrow('Task ID is required');
  });

  it('should throw error if assigneeId is whitespace only', () => {
    // Act & Assert
    expect(() => new AssignTaskCommand('task-123', '   ')).toThrow('Assignee ID is required');
  });
});
