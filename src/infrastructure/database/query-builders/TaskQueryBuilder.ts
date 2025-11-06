import type { Prisma } from '@prisma/client';
import type { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';
import type { TaskPriority } from '../../../domain/value-objects/TaskPriority.js';

/**
 * Task Query Builder
 *
 * Provides reusable Prisma query filters for Task operations.
 * Optimized for common dashboard and list queries.
 */
export class TaskQueryBuilder {
  /**
   * Build where clause for finding tasks by status
   */
  static byStatus(status: TaskStatus): Prisma.TaskWhereInput {
    return { status };
  }

  /**
   * Build where clause for finding tasks by priority
   */
  static byPriority(priority: TaskPriority): Prisma.TaskWhereInput {
    return { priority };
  }

  /**
   * Build where clause for finding tasks by assignee
   */
  static byAssignee(assigneeId: string): Prisma.TaskWhereInput {
    return { assigneeId };
  }

  /**
   * Build where clause for finding tasks by creator
   */
  static byCreator(creatorId: string): Prisma.TaskWhereInput {
    return { creatorId: creatorId };
  }

  /**
   * Build where clause for finding unassigned tasks
   */
  static unassigned(): Prisma.TaskWhereInput {
    return { assigneeId: null };
  }

  /**
   * Build where clause for finding overdue tasks
   */
  static overdue(): Prisma.TaskWhereInput {
    return {
      dueDate: { lt: new Date() },
      status: { notIn: ['DONE', 'CANCELLED'] },
    };
  }

  /**
   * Build where clause for finding tasks due in a date range
   */
  static dueInRange(startDate: Date, endDate: Date): Prisma.TaskWhereInput {
    return {
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  /**
   * Build where clause for searching tasks by title or description
   */
  static search(search: string): Prisma.TaskWhereInput {
    return {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  /**
   * Build where clause with multiple filters
   *
   * @param filters - Filter options
   * @returns Combined Prisma where clause
   */
  static buildFilters(filters: {
    status?: TaskStatus | TaskStatus[];
    priority?: TaskPriority | TaskPriority[];
    assigneeId?: string;
    creatorId?: string;
    isOverdue?: boolean;
    dueDateFilter?: 'overdue' | 'today' | 'week';
    search?: string;
  }): Prisma.TaskWhereInput {
    const conditions: Prisma.TaskWhereInput[] = [];

    if (filters.status !== undefined) {
      if (Array.isArray(filters.status)) {
        conditions.push({ status: { in: filters.status } });
      } else {
        conditions.push({ status: filters.status });
      }
    }

    if (filters.priority !== undefined) {
      if (Array.isArray(filters.priority)) {
        conditions.push({ priority: { in: filters.priority } });
      } else {
        conditions.push({ priority: filters.priority });
      }
    }

    if (filters.assigneeId !== undefined) {
      conditions.push({ assigneeId: filters.assigneeId });
    }

    if (filters.creatorId !== undefined) {
      conditions.push({ creatorId: filters.creatorId });
    }

    if (filters.isOverdue) {
      conditions.push({
        dueDate: { lt: new Date() },
      });
      conditions.push({
        status: { notIn: ['DONE', 'CANCELLED'] },
      });
    }

    if (filters.dueDateFilter) {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      switch (filters.dueDateFilter) {
        case 'overdue':
          conditions.push({
            dueDate: { lt: startOfToday },
          });
          conditions.push({
            status: { notIn: ['DONE', 'CANCELLED'] },
          });
          break;
        case 'today': {
          const endOfToday = new Date(startOfToday);
          endOfToday.setHours(23, 59, 59, 999);
          conditions.push({
            dueDate: {
              gte: startOfToday,
              lte: endOfToday,
            },
          });
          break;
        }
        case 'week': {
          const endOfWeek = new Date(startOfToday);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          endOfWeek.setHours(23, 59, 59, 999);
          conditions.push({
            dueDate: {
              gte: startOfToday,
              lte: endOfWeek,
            },
          });
          break;
        }
        default:
          break;
      }
    }

    if (filters.search) {
      conditions.push({
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }

  /**
   * Default include for task relations
   */
  static defaultInclude(): Prisma.TaskInclude {
    return {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    };
  }

  /**
   * Select only essential fields (for lists)
   */
  static selectEssential(): Prisma.TaskSelect {
    return {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    };
  }

  /**
   * Default ordering for task lists
   */
  static defaultOrderBy(): Prisma.TaskOrderByWithRelationInput[] {
    return [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }];
  }
}
