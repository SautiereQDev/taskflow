import type { Task } from '../entities/Task.js';
import type { TaskStatus } from '../value-objects/TaskStatus.js';
import type { TaskPriority } from '../value-objects/TaskPriority.js';

/**
 * Task Query Filters
 */
export interface ITaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  creatorId?: string;
  isOverdue?: boolean;
  search?: string;
}

/**
 * Paginated Task Result
 */
export interface IPaginatedTasks {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Task Repository Interface (Port)
 *
 * Defines contract for task persistence operations
 */
export interface ITaskRepository {
  /**
   * Find task by ID
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Find all tasks with optional filters and pagination
   */
  findAll(filters?: ITaskFilters, page?: number, limit?: number): Promise<IPaginatedTasks>;

  /**
   * Find tasks by assignee
   */
  findByAssignee(assigneeId: string): Promise<Task[]>;

  /**
   * Find tasks by creator
   */
  findByCreator(creatorId: string): Promise<Task[]>;

  /**
   * Find tasks by status
   */
  findByStatus(status: TaskStatus): Promise<Task[]>;

  /**
   * Find overdue tasks
   */
  findOverdue(): Promise<Task[]>;

  /**
   * Find tasks due within a date range
   */
  findDueInRange(startDate: Date, endDate: Date): Promise<Task[]>;

  /**
   * Save a new task
   */
  create(task: Task): Promise<Task>;

  /**
   * Update an existing task
   */
  update(task: Task): Promise<Task>;

  /**
   * Delete a task by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if task exists by ID
   */
  existsById(id: string): Promise<boolean>;

  /**
   * Count tasks with optional filters
   */
  count(filters?: ITaskFilters): Promise<number>;

  /**
   * Count tasks by status
   */
  countByStatus(status: TaskStatus): Promise<number>;

  /**
   * Count tasks by assignee
   */
  countByAssignee(assigneeId: string): Promise<number>;
}
