import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { CompleteTaskCommand } from './CompleteTaskCommand.js';
import type { Task } from '../../../domain/entities/Task.js';
import { PrismaTaskRepository } from '../../../infrastructure/database/prisma/PrismaTaskRepository.js';
import { EventBus } from '../../events/EventBus.js';
import { TaskCompletedEvent } from '../../../domain/events/TaskEvents.js';
import { logger } from '../../../utils/logger.util.js';

/**
 * Complete Task Command Handler
 */
@injectable()
export class CompleteTaskHandler implements ICommandHandler<CompleteTaskCommand, Task> {
  constructor(
    @inject(PrismaTaskRepository) private readonly taskRepo: PrismaTaskRepository,
    @inject(EventBus) private readonly eventBus: EventBus
  ) {}

  async execute(command: CompleteTaskCommand): Promise<Task> {
    const task = await this.taskRepo.findById(command.taskId);
    if (!task) {
      throw new Error(`Task with ID ${command.taskId} not found`);
    }

    task.complete();
    const completedTask = await this.taskRepo.update(task);

    // Publish domain event
    const event = new TaskCompletedEvent(completedTask.id);
    await this.eventBus.publish(event);

    logger.info('Task completed', {
      taskId: completedTask.id,
      eventPublished: true,
    });

    return completedTask;
  }
}
