import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { UpdateTaskCommand } from './UpdateTaskCommand.js';
import type { Task } from '../../../domain/entities/Task.js';
import { PrismaTaskRepository } from '../../../infrastructure/database/prisma/PrismaTaskRepository.js';
import { EventBus } from '../../events/EventBus.js';
import {
  TaskUpdatedEvent,
  TaskStatusChangedEvent,
  TaskPriorityChangedEvent,
} from '../../../domain/events/TaskEvents.js';
import { logger } from '../../../utils/logger.util.js';

/**
 * Update Task Command Handler
 */
@injectable()
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand, Task> {
  constructor(
    @inject(PrismaTaskRepository) private readonly taskRepo: PrismaTaskRepository,
    @inject(EventBus) private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepo.findById(command.taskId);
    if (!task) {
      throw new Error(`Task with ID ${command.taskId} not found`);
    }

    const events: (TaskUpdatedEvent | TaskStatusChangedEvent | TaskPriorityChangedEvent)[] = [];
    const changes: { title?: string; description?: string | null } = {};

    // Track changes for event
    if (command.title !== undefined) {
      task.updateTitle(command.title);
      changes.title = command.title;
    }

    if (command.description !== undefined) {
      task.updateDescription(command.description);
      changes.description = command.description;
    }

    if (command.priority !== undefined) {
      const oldPriority = task.priority;
      task.updatePriority(command.priority);
      events.push(new TaskPriorityChangedEvent(task.id, oldPriority, command.priority));
    }

    if (command.status !== undefined) {
      const oldStatus = task.status;
      task.changeStatus(command.status);
      events.push(new TaskStatusChangedEvent(task.id, oldStatus, command.status));
    }

    if (command.dueDate !== undefined) {
      if (command.dueDate === null) {
        task.clearDueDate();
      } else {
        task.setDueDate(command.dueDate);
      }
    }

    if (command.assigneeId !== undefined) {
      if (command.assigneeId === null) {
        task.unassign();
      } else {
        task.assignTo(command.assigneeId);
      }
    }

    const updatedTask = await this.taskRepo.update(task);

    // Publish TaskUpdatedEvent if title or description changed
    if (Object.keys(changes).length > 0) {
      events.push(new TaskUpdatedEvent(updatedTask.id, changes));
    }

    // Publish all events
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    if (events.length > 0) {
      logger.info('Task updated', {
        taskId: updatedTask.id,
        eventsPublished: events.length,
      });
    }

    return updatedTask;
  }
}
