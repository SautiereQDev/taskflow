/**
 * Task Service
 *
 * Centralized business logic service for task operations.
 * Handles all task-related use cases including CRUD operations,
 * assignments, filtering, and pagination.
 *
 * @module application/services/TaskService
 * @since 2.0.0
 */

import { inject, injectable } from 'tsyringe';
import { z } from 'zod';
import { Task } from '@domain/entities/Task.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority } from '@domain/value-objects/TaskPriority.js';
import type {
  ITaskRepository,
  ITaskFilters,
  IPaginatedTasks,
} from '@domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { EventBus } from '@application/events/EventBus.js';
import { TaskCreatedEvent, TaskAssignedEvent } from '@domain/events/TaskEvents.js';
import { AppError } from '@utils/AppError.js';
import { logger } from '@utils/logger.util.js';

// ──────────────────────────────────────────────────────────────────────────────
// Input DTOs & Validation Schemas
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Schema for task creation input validation
 *
 * @constant
 */
export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable()
    .default(null),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  creatorId: z.string().cuid('Invalid creator ID').trim(),
  assigneeId: z.string().cuid('Invalid assignee ID').trim().optional().nullable().default(null),
  dueDate: z.coerce.date().optional().nullable().default(null),
});

/**
 * Input type for creating a new task
 *
 * @typedef {Object} CreateTaskInput
 */
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

/**
 * Schema for task update input validation
 *
 * @constant
 */
export const UpdateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().cuid('Invalid assignee ID').trim().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

/**
 * Input type for updating an existing task
 *
 * @typedef {Object} UpdateTaskInput
 */
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Task Service Implementation
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Task Service
 *
 * Provides centralized business logic for all task-related operations.
 * Handles validation, business rules enforcement, and persistence.
 *
 * @class TaskService
 * @injectable
 *
 * @example
 * ```typescript
 * const taskService = container.resolve(TaskService);
 * const task = await taskService.createTask({
 *   title: 'Implement feature X',
 *   creatorId: 'user-123',
 *   priority: TaskPriority.HIGH
 * });
 * ```
 */
@injectable()
export class TaskService {
  /**
   * Creates an instance of TaskService
   *
   * @param {ITaskRepository} taskRepository - Repository for task persistence
   * @param {IUserRepository} userRepository - Repository for user validation
   * @param {EventBus} eventBus - Event bus for publishing domain events
   */
  constructor(
    @inject('ITaskRepository') private readonly taskRepository: ITaskRepository,
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject(EventBus) private readonly eventBus: EventBus
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // CREATE Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Creates a new task
   *
   * Validates input data, checks creator and assignee existence,
   * creates the task entity, persists it, and publishes a TaskCreatedEvent.
   *
   * @async
   * @param {CreateTaskInput} input - Task creation data
   * @returns {Promise<Task>} The created task entity
   *
   * @throws {z.ZodError} If input validation fails
   * @throws {AppError} If creator not found (404)
   * @throws {AppError} If assignee not found (404)
   *
   * @example
   * ```typescript
   * const task = await taskService.createTask({
   *   title: 'Fix bug #123',
   *   description: 'Critical bug in authentication',
   *   priority: TaskPriority.URGENT,
   *   creatorId: 'user-abc',
   *   assigneeId: 'user-xyz',
   *   dueDate: new Date('2025-12-31')
   * });
   * ```
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    // Validate input with Zod schema
    const validated = CreateTaskSchema.parse(input);

    logger.debug('Creating task', {
      title: validated.title,
      creatorId: validated.creatorId,
      priority: validated.priority,
    });

    // Validate creator exists
    const creator = await this.userRepository.findById(validated.creatorId);
    if (!creator) {
      throw new AppError('Creator user not found', 404, {
        creatorId: validated.creatorId,
      });
    }

    // Validate assignee exists (if provided)
    if (validated.assigneeId) {
      const assignee = await this.userRepository.findById(validated.assigneeId);
      if (!assignee) {
        throw new AppError('Assignee user not found', 404, {
          assigneeId: validated.assigneeId,
        });
      }
    }

    // Create domain entity
    const task = Task.create({
      id: this.generateTaskId(),
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      creatorId: validated.creatorId,
      assigneeId: validated.assigneeId,
      dueDate: validated.dueDate,
    });

    // Persist to database
    const savedTask = await this.taskRepository.create(task);

    // Publish domain event for side effects (notifications, logging, etc.)
    await this.eventBus.publish(
      new TaskCreatedEvent(savedTask.id, savedTask.title, savedTask.creatorId, savedTask.priority)
    );

    logger.info('Task created successfully', {
      taskId: savedTask.id,
      title: savedTask.title,
      creatorId: savedTask.creatorId,
    });

    return savedTask;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // READ Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves all tasks with optional filtering and pagination
   *
   * Supports filtering by status, priority, assignee, creator, due date, and search terms.
   * Results are paginated and sorted by creation date (newest first).
   *
   * @async
   * @param {ITaskFilters} [filters={}] - Optional filter criteria
   * @returns {Promise<IPaginatedTasks>} Paginated list of tasks
   *
   * @example
   * ```typescript
   * // Get all urgent tasks assigned to a user
   * const result = await taskService.findAllTasks({
   *   assigneeId: 'user-123',
   *   priority: [TaskPriority.URGENT, TaskPriority.HIGH],
   *   status: [TaskStatus.IN_PROGRESS, TaskStatus.REVIEW],
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  async findAllTasks(filters: ITaskFilters = {}, page = 1, limit = 20): Promise<IPaginatedTasks> {
    return await this.taskRepository.findAll(filters, page, limit);
  }

  /**
   * Retrieves a single task by its unique identifier
   *
   * @async
   * @param {string} taskId - Unique task identifier
   * @returns {Promise<Task | null>} The task entity or null if not found
   *
   * @example
   * ```typescript
   * const task = await taskService.findTaskById('task-123');
   * if (!task) {
   *   throw new Error('Task not found');
   * }
   * ```
   */
  async findTaskById(taskId: string): Promise<Task | null> {
    const task = await this.taskRepository.findById(taskId);

    if (task) {
      logger.debug('Task found', { taskId, title: task.title });
    } else {
      logger.debug('Task not found', { taskId });
    }

    return task;
  }

  /**
   * Retrieves all tasks assigned to a specific user
   *
   * @async
   * @param {string} assigneeId - User ID of the assignee
   * @returns {Promise<Task[]>} Array of tasks assigned to the user
   *
   * @example
   * ```typescript
   * const userTasks = await taskService.findTasksByAssignee('user-123');
   * console.log(`User has ${userTasks.length} tasks assigned`);
   * ```
   */
  async findTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return await this.taskRepository.findByAssignee(assigneeId);
  }

  /**
   * Retrieves all tasks created by a specific user
   *
   * @async
   * @param {string} creatorId - User ID of the creator
   * @returns {Promise<Task[]>} Array of tasks created by the user
   *
   * @example
   * ```typescript
   * const createdTasks = await taskService.findTasksByCreator('user-123');
   * ```
   */
  async findTasksByCreator(creatorId: string): Promise<Task[]> {
    return await this.taskRepository.findByCreator(creatorId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Updates an existing task with partial data
   *
   * Validates the task exists, validates the update data,
   * applies changes through domain methods, and persists the updated entity.
   *
   * @async
   * @param {string} taskId - Unique task identifier
   * @param {UpdateTaskInput} input - Partial task update data
   * @returns {Promise<Task>} The updated task entity
   *
   * @throws {z.ZodError} If input validation fails
   * @throws {AppError} If task not found (404)
   * @throws {AppError} If assignee not found (404)
   *
   * @example
   * ```typescript
   * const updated = await taskService.updateTask('task-123', {
   *   title: 'Updated title',
   *   priority: TaskPriority.HIGH,
   *   status: TaskStatus.IN_PROGRESS
   * });
   * ```
   */
  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    // Validate input
    const validated = UpdateTaskSchema.parse(input);

    // Find existing task
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404, { taskId });
    }

    logger.debug('Updating task', { taskId, updates: validated });

    // Validate assignee if being changed
    await this.validateAssigneeChange(task, validated.assigneeId);

    // Apply all updates through domain methods
    this.applyTaskUpdates(task, validated);

    // Persist changes
    const updatedTask = await this.taskRepository.update(task);

    logger.info('Task updated successfully', {
      taskId: updatedTask.id,
      title: updatedTask.title,
    });

    return updatedTask;
  }

  /**
   * Assigns a task to a specific user
   *
   * Validates both task and user existence, performs the assignment,
   * and publishes a TaskAssignedEvent for notifications.
   *
   * @async
   * @param {string} taskId - Unique task identifier
   * @param {string} assigneeId - User ID to assign the task to
   * @returns {Promise<Task>} The updated task with new assignee
   *
   * @throws {AppError} If task not found (404)
   * @throws {AppError} If assignee not found (404)
   *
   * @example
   * ```typescript
   * const task = await taskService.assignTask('task-123', 'user-456');
   * console.log(`Task assigned to ${task.assigneeId}`);
   * ```
   */
  async assignTask(taskId: string, assigneeId: string): Promise<Task> {
    // Validate task exists
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404, { taskId });
    }

    // Validate assignee exists
    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) {
      throw new AppError('Assignee user not found', 404, { assigneeId });
    }

    logger.debug('Assigning task', { taskId, assigneeId });

    // Perform assignment through domain method
    task.assignTo(assigneeId);

    // Persist changes
    const updatedTask = await this.taskRepository.update(task);

    // Publish event for notifications
    await this.eventBus.publish(new TaskAssignedEvent(updatedTask.id, assigneeId));

    logger.info('Task assigned successfully', {
      taskId: updatedTask.id,
      assigneeId,
      title: updatedTask.title,
    });

    return updatedTask;
  }

  /**
   * Removes the assignee from a task
   *
   * @async
   * @param {string} taskId - Unique task identifier
   * @returns {Promise<Task>} The updated task with no assignee
   *
   * @throws {AppError} If task not found (404)
   *
   * @example
   * ```typescript
   * const task = await taskService.unassignTask('task-123');
   * console.log(`Task unassigned: ${task.assigneeId === null}`);
   * ```
   */
  async unassignTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404, { taskId });
    }

    logger.debug('Unassigning task', { taskId });

    task.unassign();

    const updatedTask = await this.taskRepository.update(task);

    logger.info('Task unassigned successfully', { taskId: updatedTask.id });

    return updatedTask;
  }

  /**
   * Marks a task as completed
   *
   * Sets the task status to DONE and records the completion timestamp.
   *
   * @async
   * @param {string} taskId - Unique task identifier
   * @returns {Promise<Task>} The completed task entity
   *
   * @throws {AppError} If task not found (404)
   *
   * @example
   * ```typescript
   * const task = await taskService.completeTask('task-123');
   * console.log(`Task completed at: ${task.completedAt}`);
   * ```
   */
  async completeTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404, { taskId });
    }

    logger.debug('Completing task', { taskId });

    task.complete();

    const completedTask = await this.taskRepository.update(task);

    logger.info('Task completed successfully', {
      taskId: completedTask.id,
      title: completedTask.title,
      completedAt: completedTask.completedAt,
    });

    return completedTask;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Permanently deletes a task
   *
   * @async
   * @param {string} taskId - Unique task identifier
   * @returns {Promise<void>}
   *
   * @throws {AppError} If task not found (404)
   *
   * @example
   * ```typescript
   * await taskService.deleteTask('task-123');
   * console.log('Task deleted successfully');
   * ```
   */
  async deleteTask(taskId: string): Promise<void> {
    // Validate task exists before deletion
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404, { taskId });
    }

    logger.debug('Deleting task', { taskId, title: task.title });

    await this.taskRepository.delete(taskId);

    logger.info('Task deleted successfully', { taskId, title: task.title });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Helper Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Validates assignee change when updating a task
   *
   * @private
   * @async
   * @param {Task} task - Current task entity
   * @param {string | null | undefined} newAssigneeId - New assignee ID (if changing)
   * @throws {AppError} If assignee not found (404)
   */
  private async validateAssigneeChange(
    task: Task,
    newAssigneeId: string | null | undefined
  ): Promise<void> {
    if (newAssigneeId !== undefined && newAssigneeId !== null) {
      if (newAssigneeId !== task.assigneeId) {
        const assignee = await this.userRepository.findById(newAssigneeId);
        if (!assignee) {
          throw new AppError('Assignee user not found', 404, {
            assigneeId: newAssigneeId,
          });
        }
      }
    }
  }

  /**
   * Applies validated updates to task entity
   *
   * @private
   * @param {Task} task - Task entity to update
   * @param {UpdateTaskInput} validated - Validated update data
   */
  private applyTaskUpdates(task: Task, validated: UpdateTaskInput): void {
    if (validated.title !== undefined) {
      task.updateTitle(validated.title);
    }

    if (validated.description !== undefined) {
      task.updateDescription(validated.description);
    }

    if (validated.status !== undefined) {
      task.changeStatus(validated.status);
    }

    if (validated.priority !== undefined) {
      task.updatePriority(validated.priority);
    }

    if (validated.assigneeId !== undefined) {
      if (validated.assigneeId === null) {
        task.unassign();
      } else {
        task.assignTo(validated.assigneeId);
      }
    }

    if (validated.dueDate !== undefined) {
      if (validated.dueDate === null) {
        task.clearDueDate();
      } else {
        task.setDueDate(validated.dueDate);
      }
    }
  }

  /**
   * Generates a unique task ID
   *
   * Uses CUID format for sortable, collision-resistant IDs.
   *
   * @private
   * @returns {string} Unique task ID
   */
  private generateTaskId(): string {
    // Using a simple timestamp-based ID for now
    // In production, use a proper CUID/UUID library
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 11);
    return `task_${timestamp}${randomPart}`;
  }

  /**
   * Convert Task entities to list DTOs with assignee information
   * Helper method for controllers that need DTOs for view models
   *
   * @param tasks - Array of Task entities
   * @returns Array of ITaskListItemDto with enriched assignee data
   */
  async toListDtos(
    tasks: Task[]
  ): Promise<import('@application/dtos/TaskDto.js').ITaskListItemDto[]> {
    // Extract unique assignee IDs
    const assigneeIds = [
      ...new Set(tasks.map((t) => t.assigneeId).filter((id): id is string => id !== null)),
    ];

    // Batch fetch all assignees
    const assignees =
      assigneeIds.length > 0
        ? await Promise.all(assigneeIds.map((id) => this.userRepository.findById(id)))
        : [];

    // Create a map for quick lookup
    const assigneeMap = new Map(
      assignees
        .filter((u): u is import('@domain/entities/User.js').User => u !== null)
        .map((u) => [u.id, u])
    );

    // Map tasks to DTOs
    return tasks.map((task) => {
      const assignee = task.assigneeId ? assigneeMap.get(task.assigneeId) : null;

      return {
        id: task.id,
        title: task.title,
        creatorId: task.creatorId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignee: assignee
          ? {
              id: assignee.id,
              name: assignee.name,
              email: assignee.email.value,
            }
          : null,
      };
    });
  }
}
