import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { DeleteTaskCommand } from './DeleteTaskCommand.js';
import { PrismaTaskRepository } from '../../../infrastructure/database/prisma/PrismaTaskRepository.js';

/**
 * Delete Task Command Handler
 */
@injectable()
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand, void> {
  constructor(@inject(PrismaTaskRepository) private readonly taskRepo: PrismaTaskRepository) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const exists = await this.taskRepo.existsById(command.taskId);
    if (!exists) {
      throw new Error(`Task with ID ${command.taskId} not found`);
    }

    await this.taskRepo.delete(command.taskId);
  }
}
