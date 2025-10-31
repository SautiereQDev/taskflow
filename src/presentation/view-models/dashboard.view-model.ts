import { TaskStatus, TaskPriority, Task } from '@prisma/client';
import { ITaskViewModel, TaskViewModel } from './task.view-model.js';

/**
 * ViewModel for Dashboard page with aggregated statistics
 * Provides summary data for task management overview
 */
export interface IDashboardViewModel {
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    cancelled: number;
    completionRate: number; // Percentage (0-100)
  };
  priorityBreakdown: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  dueDates: {
    overdue: number;
    today: number;
    tomorrow: number;
    thisWeek: number;
  };
  recentTasks: ITaskViewModel[];
  userTasks: {
    assigned: number;
    created: number;
  };
}

/**
 * Calculates completion rate as percentage
 */
function calculateCompletionRate(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

/**
 * Checks if a date is within the next 7 days
 */
function isThisWeek(date: Date | null): boolean {
  if (!date) return false;
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 7);
  return date >= now && date <= weekFromNow;
}

/**
 * Transforms raw task data into a Dashboard ViewModel with statistics
 *
 * @param allTasks - All tasks in the system
 * @param userId - Current user ID for user-specific stats
 * @returns Aggregated dashboard data ready for EJS template
 *
 * @example
 * ```typescript
 * const tasks = await taskRepo.findAll();
 * const dashboardData = DashboardViewModel.fromTasks(tasks, req.user.id);
 * res.render('pages/dashboard', { dashboard: dashboardData });
 * ```
 */
export class DashboardViewModel {
  static fromTasks(
    allTasks: (Task & {
      assignee?: { id: string; name: string; email: string } | null;
      creator?: { id: string; name: string; email: string } | null;
    })[],
    userId: string
  ): IDashboardViewModel {
    // Status breakdown
    const todo = allTasks.filter((t) => t.status === TaskStatus.TODO).length;
    const inProgress = allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const done = allTasks.filter((t) => t.status === TaskStatus.DONE).length;
    const cancelled = allTasks.filter((t) => t.status === TaskStatus.CANCELLED).length;
    const total = allTasks.length;

    // Priority breakdown
    const priorityBreakdown = {
      low: allTasks.filter((t) => t.priority === TaskPriority.LOW).length,
      medium: allTasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,
      high: allTasks.filter((t) => t.priority === TaskPriority.HIGH).length,
      urgent: allTasks.filter((t) => t.priority === TaskPriority.URGENT).length,
    };

    // Due dates analysis
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueDates = {
      overdue: allTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== TaskStatus.DONE
      ).length,
      today: allTasks.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === now.getTime() && t.status !== TaskStatus.DONE;
      }).length,
      tomorrow: allTasks.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === tomorrow.getTime() && t.status !== TaskStatus.DONE;
      }).length,
      thisWeek: allTasks.filter((t) => isThisWeek(t.dueDate) && t.status !== TaskStatus.DONE)
        .length,
    };

    // Recent tasks (last 5 updated, not done/cancelled)
    const recentTasksRaw = allTasks
      .filter((t) => t.status !== TaskStatus.DONE && t.status !== TaskStatus.CANCELLED)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    // User-specific stats
    const userTasks = {
      assigned: allTasks.filter((t) => t.assigneeId === userId).length,
      created: allTasks.filter((t) => t.creatorId === userId).length,
    };

    return {
      stats: {
        total,
        todo,
        inProgress,
        done,
        cancelled,
        completionRate: calculateCompletionRate(done, total),
      },
      priorityBreakdown,
      dueDates,
      recentTasks: TaskViewModel.fromEntityArray(recentTasksRaw),
      userTasks,
    };
  }
}
