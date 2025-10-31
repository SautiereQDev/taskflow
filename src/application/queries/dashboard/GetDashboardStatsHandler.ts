import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '../IQueryHandler.js';
import type { GetDashboardStatsQuery } from './GetDashboardStatsQuery.js';
import type { IDashboardStatsDto } from '../../dtos/DashboardDto.js';
import type { ITaskRepository } from '../../../domain/repositories/ITaskRepository.js';
import { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';

/**
 * Handler for GetDashboardStatsQuery
 * Aggregates task statistics for dashboard display
 */
@injectable()
export class GetDashboardStatsHandler
  implements IQueryHandler<GetDashboardStatsQuery, IDashboardStatsDto>
{
  constructor(
    @inject('ITaskRepository' as never)
    private readonly taskRepository: ITaskRepository
  ) {}

  async handle(query: GetDashboardStatsQuery): Promise<IDashboardStatsDto> {
    const filters = query.userId ? { assigneeId: query.userId } : undefined;

    // Fetch all tasks (in production, use optimized COUNT queries)
    const allTasks = await this.taskRepository.findAll(filters, 1, 1000);

    // Calculate statistics
    const totalTasks = allTasks.items.length;
    const todoTasks = allTasks.items.filter((t) => t.status === TaskStatus.TODO).length;
    const inProgressTasks = allTasks.items.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS
    ).length;
    const doneTasks = allTasks.items.filter((t) => t.status === TaskStatus.DONE).length;
    const overdueTasks = allTasks.items.filter(
      (t) => t.dueDate && t.dueDate < new Date() && t.status !== TaskStatus.DONE
    ).length;

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  }
}
