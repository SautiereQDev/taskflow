import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '../IQueryHandler.js';
import type { GetAllTasksQuery } from './GetAllTasksQuery.js';
import type { IPaginatedTasksDto, ITaskListItemDto } from '../../dtos/TaskDto.js';
import type { ITaskRepository } from '../../../domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
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
    private readonly taskRepository: ITaskRepository,
    @inject('IUserRepository' as never)
    private readonly userRepository: IUserRepository
  ) {}

  async handle(query: GetAllTasksQuery): Promise<IPaginatedTasksDto> {
    // Convert filters to domain enums
    const statusFilter = this.mapStatuses(query.status);
    const priorityFilter = this.mapPriorities(query.priority);

    const filters = {
      status:
        statusFilter?.length === 1
          ? statusFilter[0]
          : statusFilter && statusFilter.length > 0
            ? statusFilter
            : undefined,
      priority:
        priorityFilter?.length === 1
          ? priorityFilter[0]
          : priorityFilter && priorityFilter.length > 0
            ? priorityFilter
            : undefined,
      assigneeId: query.assigneeId,
      creatorId: query.creatorId,
      dueDateFilter: query.dueDateFilter,
      search: query.search,
    };

    const result = await this.taskRepository.findAll(filters, query.page, query.limit);

    const userIds = new Set<string>();
    for (const task of result.items) {
      userIds.add(task.creatorId);
      if (task.assigneeId) {
        userIds.add(task.assigneeId);
      }
    }

    const users = await Promise.all(
      Array.from(userIds).map(async (id) => {
        const user = await this.userRepository.findById(id);
        return user ?? null;
      })
    );

    const usersMap = new Map(
      users
        .filter((user): user is NonNullable<typeof user> => user !== null)
        .map((user) => [
          user.id,
          {
            id: user.id,
            name: user.name,
            email: user.email.value,
          },
        ])
    );

    const taskDtos: ITaskListItemDto[] = result.items.map((task) => ({
      id: task.id,
      title: task.title,
      creatorId: task.creatorId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assigneeId ? (usersMap.get(task.assigneeId) ?? null) : null,
    }));

    return {
      items: taskDtos,
      total: result.total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(result.total / query.limit),
    };
  }

  private mapStatuses(statuses?: string[]): TaskStatus[] | undefined {
    if (!statuses || statuses.length === 0) {
      return undefined;
    }

    const validStatuses = Object.values(TaskStatus);
    const mapped = statuses
      .map((status) =>
        validStatuses.includes(status as TaskStatus) ? (status as TaskStatus) : null
      )
      .filter((status): status is TaskStatus => status !== null);

    return mapped.length > 0 ? mapped : undefined;
  }

  private mapPriorities(priorities?: string[]): TaskPriority[] | undefined {
    if (!priorities || priorities.length === 0) {
      return undefined;
    }

    const validPriorities = Object.values(TaskPriority);
    const mapped = priorities
      .map((priority) =>
        validPriorities.includes(priority as TaskPriority) ? (priority as TaskPriority) : null
      )
      .filter((priority): priority is TaskPriority => priority !== null);

    return mapped.length > 0 ? mapped : undefined;
  }
}
