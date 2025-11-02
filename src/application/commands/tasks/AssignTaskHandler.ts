import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { AssignTaskCommand } from './AssignTaskCommand.js';
import type { Task } from '../../../domain/entities/Task.js';
import { TaskAssignmentService } from '../../services/TaskAssignmentService.js';
import { EventBus } from '../../events/EventBus.js';
import { TaskAssignedEvent } from '../../../domain/events/TaskEvents.js';
import { logger } from '../../../utils/logger.util.js';

/**
 * Assign Task Command Handler
 *
 * Handles the execution of AssignTaskCommand.
 * Uses TaskAssignmentService for business logic and publishes TaskAssignedEvent.
 *
 * Flow:
 * 1. Validate inputs via service (task exists, user exists and active)
 * 2. Assign task using domain entity method
 * 3. Persist changes
 * 4. Publish TaskAssignedEvent for subscribers
 *
 * @example
 * ```typescript
 * const handler = container.resolve(AssignTaskHandler);
 * const task = await handler.execute(command);
 * ```
 */
@injectable()
export class AssignTaskHandler implements ICommandHandler<AssignTaskCommand, Task> {
  constructor(
    @inject(TaskAssignmentService)
    private readonly assignmentService: TaskAssignmentService,
    @inject(EventBus)
    private readonly eventBus: EventBus
  ) {}

  /**
   * Execute the AssignTaskCommand
   *
   * @param command - The command containing task and assignee IDs
   * @returns Promise resolving to the updated task
   * @throws {AppError} If task or assignee not found, or assignee is inactive
   */
  async execute(command: AssignTaskCommand): Promise<Task> {
    const { taskId, assigneeId } = command;

    logger.info('Assigning task', { taskId, assigneeId });

    // Use service to handle business logic
    const task = await this.assignmentService.assignTask(taskId, assigneeId);

    // Publish domain event
    const event = new TaskAssignedEvent(task.id, assigneeId);

    await this.eventBus.publish(event);

    logger.info('Task assigned successfully', {
      taskId: task.id,
      assigneeId,
      eventPublished: true,
    });

    return task;
  }
}
