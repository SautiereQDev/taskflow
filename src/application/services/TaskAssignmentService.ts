import { inject, injectable } from 'tsyringe';
import type { ITaskRepository } from '../../domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { Task } from '../../domain/entities/Task.js';
import { TaskStatus } from '../../domain/value-objects/TaskStatus.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Task Assignment Service
 *
 * Handles business logic for assigning tasks to users.
 * Implements rules and validations for task assignment.
 *
 * Business Rules:
 * - User must exist and be active
 * - Task must exist
 * - User cannot assign tasks to inactive users
 * - Assignment is recorded with timestamp
 *
 * @example
 * ```typescript
 * const assignmentService = container.resolve(TaskAssignmentService);
 * await assignmentService.assignTask('task-123', 'user-456');
 * ```
 */
@injectable()
export class TaskAssignmentService {
  constructor(
    @inject('ITaskRepository' as never)
    private readonly taskRepository: ITaskRepository,
    @inject('IUserRepository' as never)
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Assign a task to a user
   *
   * @param taskId - Task ID to assign
   * @param assigneeId - User ID to assign task to
   * @returns Promise resolving to updated task
   * @throws {AppError} If task or user not found, or user is inactive
   */
  async assignTask(taskId: string, assigneeId: string): Promise<Task> {
    // Validate task exists
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Validate assignee exists and is active
    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) {
      throw new AppError('Assignee not found', 404);
    }

    if (!assignee.isActive) {
      throw new AppError('Cannot assign task to inactive user', 400);
    }

    // Assign task using domain method
    task.assignTo(assigneeId);

    // Persist changes
    return await this.taskRepository.update(task);
  }

  /**
   * Unassign a task (remove assignee)
   *
   * @param taskId - Task ID to unassign
   * @returns Promise resolving to updated task
   * @throws {AppError} If task not found
   */
  async unassignTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    task.unassign();

    return await this.taskRepository.update(task);
  }

  /**
   * Reassign a task to a different user
   *
   * @param taskId - Task ID to reassign
   * @param newAssigneeId - New assignee user ID
   * @returns Promise resolving to updated task
   * @throws {AppError} If task or user not found, or user is inactive
   */
  async reassignTask(taskId: string, newAssigneeId: string): Promise<Task> {
    // Reuse assignTask logic (includes all validations)
    return await this.assignTask(taskId, newAssigneeId);
  }

  /**
   * Get all tasks assigned to a user
   *
   * @param userId - User ID
   * @param includeCompleted - Whether to include completed tasks
   * @returns Promise resolving to array of tasks
   */
  async getTasksForUser(userId: string, includeCompleted = false): Promise<Task[]> {
    // Fetch all tasks for the user
    const result = await this.taskRepository.findAll({ assigneeId: userId }, 1, 100);

    // Filter out completed tasks if needed
    if (!includeCompleted) {
      return result.items.filter(
        (task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED
      );
    }

    return result.items;
  }
}
