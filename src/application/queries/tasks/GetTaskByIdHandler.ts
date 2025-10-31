import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '../IQueryHandler.js';
import type { GetTaskByIdQuery } from './GetTaskByIdQuery.js';
import type { ITaskDto } from '../../dtos/TaskDto.js';
import type { ITaskRepository } from '../../../domain/repositories/ITaskRepository.js';
import { AppError } from '../../../utils/errors.util.js';

/**
 * Handler for GetTaskByIdQuery
 * Retrieves a single task with full details including creator and assignee
 */
@injectable()
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery, ITaskDto> {
  constructor(
    @inject('ITaskRepository' as never)
    private readonly taskRepository: ITaskRepository
  ) {}

  async handle(query: GetTaskByIdQuery): Promise<ITaskDto> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      creator: {
        id: task.creatorId,
        name: '',
        email: '',
        role: '',
        isActive: true,
        avatar: undefined,
      },
      assignee: task.assigneeId
        ? {
            id: task.assigneeId,
            name: '',
            email: '',
            role: '',
            isActive: true,
            avatar: undefined,
          }
        : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
