import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { CompleteTaskCommand } from './CompleteTaskCommand.js';
import type { Task } from '../../../domain/entities/Task.js';
import { PrismaTaskRepository } from '../../../infrastructure/database/prisma/PrismaTaskRepository.js';

/**
 * Complete Task Command Handler
 */
@injectable()
export class CompleteTaskHandler implements ICommandHandler<CompleteTaskCommand, Task> {
  constructor(@inject(PrismaTaskRepository) private readonly taskRepo: PrismaTaskRepository) {}

  async execute(command: CompleteTaskCommand): Promise<Task> {
    const task = await this.taskRepo.findById(command.taskId);
    if (!task) {
      throw new Error(`Task with ID ${command.taskId} not found`);
    }

    task.complete();
    return this.taskRepo.update(task);
  }
}
