import { inject, injectable } from 'tsyringe';
import type { ITaskRepository } from '../../domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { TaskStatus } from '../../domain/value-objects/TaskStatus.js';
import { TaskPriority } from '../../domain/value-objects/TaskPriority.js';

/**
 * Dashboard Metrics Result
 */
export interface IDashboardMetrics {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  completionRate: number;
  overdueTasks: number;
  tasksCreatedThisWeek: number;
  tasksCompletedThisWeek: number;
  activeUsers: number;
}

/**
 * User Productivity Metrics
 */
export interface IUserProductivityMetrics {
  userId: string;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

/**
 * Dashboard Metrics Service
 *
 * Calculates and aggregates metrics for dashboard displays.
 * Provides insights into task management and team productivity.
 *
 * @example
 * ```typescript
 * const metricsService = container.resolve(DashboardMetricsService);
 * const metrics = await metricsService.getOverallMetrics();
 * const userMetrics = await metricsService.getUserMetrics('user-123');
 * ```
 */
@injectable()
export class DashboardMetricsService {
  constructor(
    @inject('ITaskRepository' as never)
    private readonly taskRepository: ITaskRepository,
    @inject('IUserRepository' as never)
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Get overall dashboard metrics
   *
   * Aggregates statistics across all tasks and users.
   *
   * @returns Promise resolving to dashboard metrics
   */
  async getOverallMetrics(): Promise<IDashboardMetrics> {
    // Fetch all tasks (in production, use optimized aggregation queries)
    const allTasksResult = await this.taskRepository.findAll({}, 1, 10000);
    const allTasks = allTasksResult.items;

    // Calculate tasks by status
    const tasksByStatus: Record<string, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.DONE]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    for (const task of allTasks) {
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
    }

    // Calculate tasks by priority
    const tasksByPriority: Record<string, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.URGENT]: 0,
    };

    for (const task of allTasks) {
      tasksByPriority[task.priority] = (tasksByPriority[task.priority] || 0) + 1;
    }

    // Calculate completion rate
    const completedTasks = tasksByStatus[TaskStatus.DONE] || 0;
    const totalTasks = allTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate overdue tasks
    const now = new Date();
    const overdueTasks = allTasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < now &&
        task.status !== TaskStatus.DONE &&
        task.status !== TaskStatus.CANCELLED
    ).length;

    // Calculate tasks created/completed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const tasksCreatedThisWeek = allTasks.filter((task) => task.createdAt >= oneWeekAgo).length;

    const tasksCompletedThisWeek = allTasks.filter(
      (task) => task.completedAt && task.completedAt >= oneWeekAgo
    ).length;

    // Get active users count
    const allUsers = await this.userRepository.findAll();
    const activeUsers = allUsers.filter((user) => user.isActive).length;

    return {
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      completionRate,
      overdueTasks,
      tasksCreatedThisWeek,
      tasksCompletedThisWeek,
      activeUsers,
    };
  }

  /**
   * Get productivity metrics for a specific user
   *
   * @param userId - User ID to get metrics for
   * @returns Promise resolving to user productivity metrics
   */
  async getUserMetrics(userId: string): Promise<IUserProductivityMetrics> {
    // Fetch user's tasks
    const userTasksResult = await this.taskRepository.findAll({ assigneeId: userId }, 1, 1000);
    const userTasks = userTasksResult.items;

    const assignedTasks = userTasks.length;
    const completedTasks = userTasks.filter((task) => task.status === TaskStatus.DONE).length;

    const now = new Date();
    const overdueTasks = userTasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < now &&
        task.status !== TaskStatus.DONE &&
        task.status !== TaskStatus.CANCELLED
    ).length;

    const completionRate =
      assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

    return {
      userId,
      assignedTasks,
      completedTasks,
      overdueTasks,
      completionRate,
    };
  }

  /**
   * Get team capacity overview
   *
   * Shows workload distribution across team members.
   *
   * @returns Promise resolving to array of user metrics
   */
  async getTeamCapacity(): Promise<IUserProductivityMetrics[]> {
    const allUsers = await this.userRepository.findAll();
    const activeUsers = allUsers.filter((user) => user.isActive);

    const capacityMetrics: IUserProductivityMetrics[] = [];

    for (const user of activeUsers) {
      const userMetrics = await this.getUserMetrics(user.id);
      capacityMetrics.push(userMetrics);
    }

    // Sort by assigned tasks (descending)
    return capacityMetrics.sort((a, b) => b.assignedTasks - a.assignedTasks);
  }
}
