import type {
  Task as PrismaTask,
  TaskStatus as PrismaTaskStatus,
  TaskPriority as PrismaTaskPriority,
} from '@prisma/client';
import { Task } from '../../../domain/entities/Task.js';
import { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';
import { TaskPriority } from '../../../domain/value-objects/TaskPriority.js';

/**
 * Task Mapper
 *
 * Maps between Prisma Task model and Domain Task entity.
 * Handles status and priority enum conversions.
 */
export class TaskMapper {
  /**
   * Map Prisma Task to Domain Task entity
   *
   * @param prismaTask - Prisma task model
   * @returns Domain Task entity
   */
  static toDomain(prismaTask: PrismaTask): Task {
    return Task.create({
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description,
      status: this.mapStatusToDomain(prismaTask.status),
      priority: this.mapPriorityToDomain(prismaTask.priority),
      creatorId: prismaTask.createdById,
      assigneeId: prismaTask.assigneeId,
      dueDate: prismaTask.dueDate,
      completedAt: prismaTask.completedAt,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    });
  }

  /**
   * Map Domain Task entity to Prisma format
   *
   * @param task - Domain Task entity
   * @returns Plain object for Prisma operations
   */
  static toPrisma(task: Task): Omit<PrismaTask, 'createdAt' | 'updatedAt'> {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: this.mapStatusToPrisma(task.status),
      priority: this.mapPriorityToPrisma(task.priority),
      createdById: task.creatorId,
      assigneeId: task.assigneeId,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
    };
  }

  /**
   * Map Prisma TaskStatus to Domain TaskStatus
   */
  private static mapStatusToDomain(prismaStatus: PrismaTaskStatus): TaskStatus {
    const statusMap: Record<PrismaTaskStatus, TaskStatus> = {
      TODO: TaskStatus.TODO,
      IN_PROGRESS: TaskStatus.IN_PROGRESS,
      DONE: TaskStatus.DONE,
      CANCELLED: TaskStatus.CANCELLED,
    };
    return statusMap[prismaStatus];
  }

  /**
   * Map Domain TaskStatus to Prisma TaskStatus
   */
  private static mapStatusToPrisma(domainStatus: TaskStatus): PrismaTaskStatus {
    const statusMap: Record<TaskStatus, PrismaTaskStatus> = {
      [TaskStatus.TODO]: 'TODO',
      [TaskStatus.IN_PROGRESS]: 'IN_PROGRESS',
      [TaskStatus.DONE]: 'DONE',
      [TaskStatus.CANCELLED]: 'CANCELLED',
    };
    return statusMap[domainStatus];
  }

  /**
   * Map Prisma TaskPriority to Domain TaskPriority
   */
  private static mapPriorityToDomain(prismaPriority: PrismaTaskPriority): TaskPriority {
    const priorityMap: Record<PrismaTaskPriority, TaskPriority> = {
      LOW: TaskPriority.LOW,
      MEDIUM: TaskPriority.MEDIUM,
      HIGH: TaskPriority.HIGH,
      URGENT: TaskPriority.URGENT,
    };
    return priorityMap[prismaPriority];
  }

  /**
   * Map Domain TaskPriority to Prisma TaskPriority
   */
  private static mapPriorityToPrisma(domainPriority: TaskPriority): PrismaTaskPriority {
    const priorityMap: Record<TaskPriority, PrismaTaskPriority> = {
      [TaskPriority.LOW]: 'LOW',
      [TaskPriority.MEDIUM]: 'MEDIUM',
      [TaskPriority.HIGH]: 'HIGH',
      [TaskPriority.URGENT]: 'URGENT',
    };
    return priorityMap[domainPriority];
  }
}
