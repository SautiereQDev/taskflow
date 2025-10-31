import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { CreateTaskCommand } from './CreateTaskCommand.js';
import type { Task } from '../../../domain/entities/Task.js';
import { Task as TaskEntity } from '../../../domain/entities/Task.js';
import { PrismaTaskRepository } from '../../../infrastructure/database/prisma/PrismaTaskRepository.js';
import { PrismaUserRepository } from '../../../infrastructure/database/prisma/PrismaUserRepository.js';

/**
 * Create Task Command Handler
 */
@injectable()
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand, Task> {
  constructor(
    @inject(PrismaTaskRepository) private readonly taskRepo: PrismaTaskRepository,
    @inject(PrismaUserRepository) private readonly userRepo: PrismaUserRepository
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    // Validate creator exists
    const creator = await this.userRepo.findById(command.creatorId);
    if (!creator) {
      throw new Error(`Creator with ID ${command.creatorId} not found`);
    }

    // Validate assignee exists (if provided)
    if (command.assigneeId) {
      const assignee = await this.userRepo.findById(command.assigneeId);
      if (!assignee) {
        throw new Error(`Assignee with ID ${command.assigneeId} not found`);
      }
    }

    // Create domain entity
    const task = TaskEntity.create({
      title: command.title,
      description: command.description,
      status: command.status,
      priority: command.priority,
      dueDate: command.dueDate,
      creatorId: command.creatorId,
      assigneeId: command.assigneeId,
    });

    // Persist
    return this.taskRepo.create(task);
  }
}
