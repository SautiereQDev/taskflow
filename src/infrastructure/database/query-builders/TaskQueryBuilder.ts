import type { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

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
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    creatorId?: string;
    isOverdue?: boolean;
    search?: string;
  }): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    if (filters.priority !== undefined) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId !== undefined) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.creatorId !== undefined) {
      where.creatorId = filters.creatorId;
    }

    if (filters.isOverdue) {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['DONE', 'CANCELLED'] };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
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
