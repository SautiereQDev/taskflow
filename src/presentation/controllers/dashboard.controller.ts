/**
 * Dashboard Controller
 *
 * Handles HTTP requests for dashboard views.
 * Displays statistics and overview information.
 *
 * @module presentation/controllers/dashboard.controller
 */

import type { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { UserService } from '@application/services/UserService.js';
import { TaskService } from '@application/services/TaskService.js';
import type { User } from '@domain/entities/User.js';
import type { IPaginatedTasks } from '@domain/repositories/ITaskRepository.js';
import {
  DashboardMetricsService,
  type IUserProductivityMetrics,
} from '@application/services/DashboardMetricsService.js';
import { TaskStatus, getTaskStatusLabel } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority, getTaskPriorityLabel } from '@domain/value-objects/TaskPriority.js';
import { renderOrPartial } from '@presentation/utils/response.helpers.js';
import {
  toTaskListItemViewModel,
  type ICurrentUserContext,
  type ITaskListItemViewModel,
} from '@presentation/view-models/index.js';
import type { IAuthenticatedRequest } from './auth.controller.js';

/**
 * DashboardController
 *
 * Thin HTTP handler for dashboard views.
 * Retrieves statistics and renders dashboard pages.
 */
@injectable()
export class DashboardController {
  constructor(
    @inject(UserService) private readonly userService: UserService,
    @inject(TaskService) private readonly taskService: TaskService,
    @inject(DashboardMetricsService)
    private readonly dashboardMetricsService: DashboardMetricsService
  ) {}

  /**
   * GET /dashboard - Render main dashboard with statistics
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   */
  async index(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    const locale = (req.getLocale?.() as 'fr' | 'en') ?? 'fr';
    const currentUser: ICurrentUserContext | null = req.user
      ? { id: req.user.id, role: req.user.role }
      : null;

    const [
      userStats,
      metrics,
      teamCapacityMetrics,
      usersResult,
      upcomingTasksResult,
      highlightedTasksResult,
      myAssignmentsResult,
    ] = await Promise.all([
      userId ? this.dashboardMetricsService.getUserMetrics(userId) : Promise.resolve(null),
      this.dashboardMetricsService.getOverallMetrics(),
      this.dashboardMetricsService.getTeamCapacity(),
      this.userService.findAll({ page: 1, limit: 100 }),
      this.taskService.findAllTasks({ dueDateFilter: 'week' }, 1, 6),
      this.taskService.findAllTasks({}, 1, 6),
      userId ? this.taskService.findAllTasks({ assigneeId: userId }, 1, 6) : Promise.resolve(null),
    ]);

    const mapTasks = async (result: IPaginatedTasks | null): Promise<ITaskListItemViewModel[]> => {
      if (!result) return [];
      const dtos = await this.taskService.toListDtos(result.items);
      return dtos.map((task) => toTaskListItemViewModel(task, currentUser));
    };

    const isIncompleteTask = (task: ITaskListItemViewModel): boolean =>
      ![TaskStatus.DONE, TaskStatus.CANCELLED].includes(task.status.value);

    const highlightedTasks = (await mapTasks(highlightedTasksResult)).slice(0, 5);

    const upcomingTasks = (await mapTasks(upcomingTasksResult))
      .filter(isIncompleteTask)
      .sort((a, b) => {
        const aTime = a.dueDate.raw ? a.dueDate.raw.getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.dueDate.raw ? b.dueDate.raw.getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
      })
      .slice(0, 5);

    const assignmentPool = await mapTasks(myAssignmentsResult);
    const myAssignments = assignmentPool.filter(isIncompleteTask).slice(0, 5);
    const myAssignmentsSummary = {
      total: assignmentPool.length,
      todo: assignmentPool.filter((task) => task.status.value === TaskStatus.TODO).length,
      inProgress: assignmentPool.filter((task) => task.status.value === TaskStatus.IN_PROGRESS)
        .length,
      done: assignmentPool.filter((task) => task.status.value === TaskStatus.DONE).length,
      overdue: assignmentPool.filter((task) => task.dueDate.isOverdue).length,
    };

    interface IColorDescriptor {
      badge: string;
      text: string;
      bar: string;
    }

    const statusColors: Record<TaskStatus, IColorDescriptor> = {
      [TaskStatus.TODO]: {
        badge: 'badge-info',
        text: 'text-info',
        bar: 'bg-info/20',
      },
      [TaskStatus.IN_PROGRESS]: {
        badge: 'badge-warning',
        text: 'text-warning',
        bar: 'bg-warning/20',
      },
      [TaskStatus.DONE]: {
        badge: 'badge-success',
        text: 'text-success',
        bar: 'bg-success/20',
      },
      [TaskStatus.CANCELLED]: {
        badge: 'badge-ghost',
        text: 'text-base-content/60',
        bar: 'bg-base-300/80',
      },
    };

    const priorityColors: Record<TaskPriority, IColorDescriptor> = {
      [TaskPriority.LOW]: {
        badge: 'badge-ghost',
        text: 'text-base-content/70',
        bar: 'bg-base-300/80',
      },
      [TaskPriority.MEDIUM]: {
        badge: 'badge-info',
        text: 'text-info',
        bar: 'bg-info/20',
      },
      [TaskPriority.HIGH]: {
        badge: 'badge-warning',
        text: 'text-warning',
        bar: 'bg-warning/20',
      },
      [TaskPriority.URGENT]: {
        badge: 'badge-error',
        text: 'text-error',
        bar: 'bg-error/20',
      },
    };

    const statusDistribution = (Object.keys(metrics.tasksByStatus) as TaskStatus[]).map(
      (status) => ({
        status,
        label: getTaskStatusLabel(status, locale),
        count: metrics.tasksByStatus[status] ?? 0,
        ...statusColors[status],
      })
    );

    const priorityDistribution = (Object.keys(metrics.tasksByPriority) as TaskPriority[]).map(
      (priority) => ({
        priority,
        label: getTaskPriorityLabel(priority, locale),
        count: metrics.tasksByPriority[priority] ?? 0,
        ...priorityColors[priority],
      })
    );

    // Type guard: usersResult is IPaginatedUserResult when pagination is used
    const usersArray = Array.isArray(usersResult) ? [] : usersResult.users;
    const usersMap = new Map(usersArray.map((user) => [user.id, user]));
    const teamCapacity = this.buildTeamCapacityView(teamCapacityMetrics, usersMap, userId);

    const insights = {
      overdueTasks: metrics.overdueTasks,
      activeUsers: metrics.activeUsers,
    };

    const openTasks =
      metrics.totalTasks -
      ((metrics.tasksByStatus[TaskStatus.DONE] as number | undefined) ?? 0) -
      ((metrics.tasksByStatus[TaskStatus.CANCELLED] as number | undefined) ?? 0);

    renderOrPartial(req, res, 'pages/dashboard/index', 'partials/dashboard/stats', {
      stats: userStats,
      metrics,
      statusDistribution,
      priorityDistribution,
      highlightedTasks,
      upcomingTasks,
      myAssignments,
      myAssignmentsSummary,
      teamCapacity,
      insights,
      hasTasks: metrics.totalTasks > 0,
      openTasks,
      user: req.user,
      title: 'Tableau de bord - TaskFlow',
    });
  }

  private buildTeamCapacityView(
    metrics: IUserProductivityMetrics[],
    usersMap: Map<string, User>,
    currentUserId?: string
  ): {
    id: string;
    name: string;
    email: string;
    role: string;
    assigned: number;
    completed: number;
    overdue: number;
    completionRate: number;
    isCurrentUser: boolean;
  }[] {
    return metrics.slice(0, 6).map((item) => {
      const user = usersMap.get(item.userId);
      return {
        id: item.userId,
        name: user?.name ?? 'Utilisateur inconnu',
        email: user?.email.value ?? '',
        role: user?.role ?? 'MEMBER',
        assigned: item.assignedTasks,
        completed: item.completedTasks,
        overdue: item.overdueTasks,
        completionRate: item.completionRate,
        isCurrentUser: currentUserId === item.userId,
      };
    });
  }
}
