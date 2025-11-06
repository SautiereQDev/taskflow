import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '../IQueryHandler.js';
import type { GetTaskByIdQuery } from './GetTaskByIdQuery.js';
import type { ITaskDto } from '../../dtos/TaskDto.js';
import type { IUserSummaryDto } from '../../dtos/UserDto.js';
import type { ITaskRepository } from '../../../domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { AppError } from '../../../utils/AppError.js';

/**
 * Handler for GetTaskByIdQuery
 * Retrieves a single task with full details including creator and assignee
 */
@injectable()
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery, ITaskDto> {
  constructor(
    @inject('ITaskRepository' as never)
    private readonly taskRepository: ITaskRepository,
    @inject('IUserRepository' as never)
    private readonly userRepository: IUserRepository
  ) {}

  async handle(query: GetTaskByIdQuery): Promise<ITaskDto> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const [creator, assignee] = await Promise.all([
      this.userRepository.findById(task.creatorId),
      task.assigneeId ? this.userRepository.findById(task.assigneeId) : Promise.resolve(null),
    ]);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      creator: this.toUserSummary(task.creatorId, creator),
      assignee: task.assigneeId ? this.toUserSummary(task.assigneeId, assignee) : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private toUserSummary(
    userId: string,
    user: Awaited<ReturnType<IUserRepository['findById']>>
  ): IUserSummaryDto {
    if (!user) {
      return {
        id: userId,
        name: 'Utilisateur inconnu',
        email: '',
        role: '',
        isActive: false,
        avatar: undefined,
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      role: user.role,
      isActive: user.isActive,
      avatar: undefined,
    };
  }
}
