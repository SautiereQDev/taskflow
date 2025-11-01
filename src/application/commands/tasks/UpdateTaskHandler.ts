import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { UpdateTaskCommand } from './UpdateTaskCommand.js';
import type { Task } from '../../../domain/entities/Task.js';
import { PrismaTaskRepository } from '../../../infrastructure/database/prisma/PrismaTaskRepository.js';

/**
 * Update Task Command Handler
 */
@injectable()
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand, Task> {
  constructor(@inject(PrismaTaskRepository) private readonly taskRepo: PrismaTaskRepository) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepo.findById(command.taskId);
    if (!task) {
      throw new Error(`Task with ID ${command.taskId} not found`);
    }

    // Update individual properties if provided
    if (command.title !== undefined) {
      task.updateTitle(command.title);
    }

    if (command.description !== undefined) {
      task.updateDescription(command.description);
    }

    if (command.priority !== undefined) {
      task.updatePriority(command.priority);
    }

    if (command.status !== undefined) {
      task.changeStatus(command.status);
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

    return this.taskRepo.update(task);
  }
}
