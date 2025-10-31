import { injectable, inject } from 'tsyringe';
import type { Task } from '../../../domain/entities/Task.js';
import type {
  ITaskRepository,
  ITaskFilters,
  IPaginatedTasks,
} from '../../../domain/repositories/ITaskRepository.js';
import { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';
import { PrismaService } from './PrismaService.js';
import { TaskMapper } from '../mappers/TaskMapper.js';
import { TaskQueryBuilder } from '../query-builders/TaskQueryBuilder.js';

/**
 * Prisma Task Repository
 *
 * Implements ITaskRepository interface using Prisma ORM.
 * Provides optimized queries for task management operations.
 */
@injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<Task | null> {
    const prismaTask = await this.prismaService.client.task.findUnique({
      where: { id },
      include: TaskQueryBuilder.defaultInclude(),
    });

    return prismaTask ? TaskMapper.toDomain(prismaTask) : null;
  }

  /**
   * Find all tasks with optional filters and pagination
   */
  async findAll(filters?: ITaskFilters, page = 1, limit = 10): Promise<IPaginatedTasks> {
    const where = filters ? TaskQueryBuilder.buildFilters(filters) : {};
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prismaService.client.task.findMany({
        where,
        include: TaskQueryBuilder.defaultInclude(),
        orderBy: TaskQueryBuilder.defaultOrderBy(),
        skip,
        take: limit,
      }),
      this.prismaService.client.task.count({ where }),
    ]);

    return {
      items: items.map((task) => TaskMapper.toDomain(task)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find tasks by assignee
   */
  async findByAssignee(assigneeId: string): Promise<Task[]> {
    const prismaTasks = await this.prismaService.client.task.findMany({
      where: TaskQueryBuilder.byAssignee(assigneeId),
      include: TaskQueryBuilder.defaultInclude(),
      orderBy: TaskQueryBuilder.defaultOrderBy(),
    });

    return prismaTasks.map((task) => TaskMapper.toDomain(task));
  }

  /**
   * Find tasks by creator
   */
  async findByCreator(creatorId: string): Promise<Task[]> {
    const prismaTasks = await this.prismaService.client.task.findMany({
      where: TaskQueryBuilder.byCreator(creatorId),
      include: TaskQueryBuilder.defaultInclude(),
      orderBy: TaskQueryBuilder.defaultOrderBy(),
    });

    return prismaTasks.map((task) => TaskMapper.toDomain(task));
  }

  /**
   * Find tasks by status
   */
  async findByStatus(status: TaskStatus): Promise<Task[]> {
    const prismaTasks = await this.prismaService.client.task.findMany({
      where: TaskQueryBuilder.byStatus(status as never),
      include: TaskQueryBuilder.defaultInclude(),
      orderBy: TaskQueryBuilder.defaultOrderBy(),
    });

    return prismaTasks.map((task) => TaskMapper.toDomain(task));
  }

  /**
   * Find overdue tasks
   */
  async findOverdue(): Promise<Task[]> {
    const prismaTasks = await this.prismaService.client.task.findMany({
      where: TaskQueryBuilder.overdue(),
      include: TaskQueryBuilder.defaultInclude(),
      orderBy: { dueDate: 'asc' },
    });

    return prismaTasks.map((task) => TaskMapper.toDomain(task));
  }

  /**
   * Find tasks due within a date range
   */
  async findDueInRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const prismaTasks = await this.prismaService.client.task.findMany({
      where: TaskQueryBuilder.dueInRange(startDate, endDate),
      include: TaskQueryBuilder.defaultInclude(),
      orderBy: { dueDate: 'asc' },
    });

    return prismaTasks.map((task) => TaskMapper.toDomain(task));
  }

  /**
   * Save a new task
   */
  async create(task: Task): Promise<Task> {
    const data = TaskMapper.toPrisma(task);

    const createdTask = await this.prismaService.client.task.create({
      data,
      include: TaskQueryBuilder.defaultInclude(),
    });

    return TaskMapper.toDomain(createdTask);
  }

  /**
   * Update an existing task
   */
  async update(task: Task): Promise<Task> {
    const data = TaskMapper.toPrisma(task);

    const updatedTask = await this.prismaService.client.task.update({
      where: { id: task.id },
      data,
      include: TaskQueryBuilder.defaultInclude(),
    });

    return TaskMapper.toDomain(updatedTask);
  }

  /**
   * Delete a task by ID
   */
  async delete(id: string): Promise<void> {
    await this.prismaService.client.task.delete({
      where: { id },
    });
  }

  /**
   * Check if task exists by ID
   */
  async existsById(id: string): Promise<boolean> {
    const count = await this.prismaService.client.task.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Count tasks with optional filters
   */
  async count(filters?: ITaskFilters): Promise<number> {
    const where = filters ? TaskQueryBuilder.buildFilters(filters) : {};
    return this.prismaService.client.task.count({ where });
  }

  /**
   * Count tasks by status
   */
  async countByStatus(status: TaskStatus): Promise<number> {
    return this.prismaService.client.task.count({
      where: TaskQueryBuilder.byStatus(status as never),
    });
  }

  /**
   * Count tasks by assignee
   */
  async countByAssignee(assigneeId: string): Promise<number> {
    return this.prismaService.client.task.count({
      where: TaskQueryBuilder.byAssignee(assigneeId),
    });
  }
}
