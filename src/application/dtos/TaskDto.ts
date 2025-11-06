import type { TaskStatus } from '../../domain/value-objects/TaskStatus.js';
import type { TaskPriority } from '../../domain/value-objects/TaskPriority.js';
import type { IUserSummaryDto } from './UserDto.js';

/**
 * Task DTO (Data Transfer Object)
 *
 * Complete task representation for API responses.
 * Includes assignee and creator summary information.
 */
export interface ITaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  creator: IUserSummaryDto;
  assignee: IUserSummaryDto | null;
}

/**
 * Task List DTO
 *
 * Simplified task data for lists.
 * Optimized for performance in paginated views.
 */
export interface ITaskListItemDto {
  id: string;
  title: string;
  creatorId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
}

/**
 * Paginated Tasks DTO
 *
 * Container for paginated task results.
 */
export interface IPaginatedTasksDto {
  items: ITaskListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
