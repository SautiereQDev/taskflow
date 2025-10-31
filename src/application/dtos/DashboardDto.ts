/**
 * Dashboard Statistics DTO
 *
 * Aggregated metrics for overview dashboards.
 */
export interface IDashboardStatsDto {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
  completionRate: number;
}

/**
 * Activity Feed Item DTO
 *
 * Recent activity entries for dashboard.
 */
export interface IActivityDto {
  id: string;
  type: string;
  message: string;
  userId: string;
  userName: string;
  timestamp: Date;
}
