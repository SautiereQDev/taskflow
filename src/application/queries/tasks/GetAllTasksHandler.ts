import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '../IQueryHandler.js';
import type { GetAllTasksQuery } from './GetAllTasksQuery.js';
import type { IPaginatedTasksDto, ITaskListItemDto } from '../../dtos/TaskDto.js';
import type { ITaskRepository } from '../../../domain/repositories/ITaskRepository.js';
import { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';
import { TaskPriority } from '../../../domain/value-objects/TaskPriority.js';

/**
 * Handler for GetAllTasksQuery
 * Retrieves paginated task list with optional filters
 */
@injectable()
export class GetAllTasksHandler implements IQueryHandler<GetAllTasksQuery, IPaginatedTasksDto> {
  constructor(
    @inject('ITaskRepository' as never)
    private readonly taskRepository: ITaskRepository
  ) {}

  async handle(query: GetAllTasksQuery): Promise<IPaginatedTasksDto> {
    // Build filter object with proper type conversions
    const filters = {
      status: query.status ? (query.status as TaskStatus) : undefined,
      priority: query.priority ? (query.priority as TaskPriority) : undefined,
      assigneeId: query.assigneeId,
      creatorId: query.creatorId,
      search: query.search,
    };

    const result = await this.taskRepository.findAll(filters, query.page, query.limit);

    // Map to ITaskListItemDto
    const taskDtos: ITaskListItemDto[] = result.items.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assigneeId
        ? {
            id: task.assigneeId,
            name: '',
            avatar: null,
          }
        : null,
    }));

    return {
      items: taskDtos,
      total: result.total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(result.total / query.limit),
    };
  }
}
