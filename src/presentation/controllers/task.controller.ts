/**
 * Task Controller
 *
 * Handles HTTP requests for task operations (CRUD).
 * Supports both full page renders and HTMX partial updates.
 *
 * Migrated to Service Layer architecture - uses TaskService directly
 * instead of Command/Query Handlers.
 *
 * @module presentation/controllers/task.controller
 * @since 2.0.0
 */

import type { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import type { Task } from '@domain/entities/Task.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority } from '@domain/value-objects/TaskPriority.js';
import {
  TaskService,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@application/services/TaskService.js';
import { UserService } from '@application/services/UserService.js';
import type { ITaskFilters } from '@domain/repositories/ITaskRepository.js';
import {
  renderOrPartial,
  htmxRedirect,
  htmxTrigger,
} from '@presentation/utils/response.helpers.js';
import {
  toTaskDetailViewModel,
  toTaskListItemViewModel,
  type ICurrentUserContext,
} from '@presentation/view-models/index.js';
import type { IAuthenticatedRequest } from './auth.controller.js';
import { logger } from '@utils/logger.util.js';

/**
 * TaskController
 *
 * Thin HTTP handler for task operations.
 * Delegates to TaskService for business logic, handles HTMX responses.
 *
 * @class TaskController
 * @injectable
 *
 * @example
 * ```typescript
 * const controller = container.resolve(TaskController);
 * app.get('/tasks', (req, res) => controller.list(req, res));
 * ```
 */
@injectable()
export class TaskController {
  /**
   * Creates an instance of TaskController
   *
   * @param {TaskService} taskService - Service for task business logic
   * @param {UserService} userService - Service for user operations
   */
  constructor(
    @inject(TaskService) private readonly taskService: TaskService,
    @inject(UserService) private readonly userService: UserService
  ) {}

  /**
   * GET /tasks - List all tasks with filters and pagination
   *
   * Supports filtering by status, priority, assignee, creator, due date, and search.
   * Returns either full page or HTMX partial based on request type.
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with authenticated user
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    logger.debug('TaskController.list', {
      userId: req.user?.id,
      query: req.query,
    });

    // Parse query parameters with proper types
    const filters: ITaskFilters = {
      status: this.parseStatusArray(req.query.status as string | string[] | undefined),
      priority: this.parsePriorityArray(req.query.priority as string | string[] | undefined),
      assigneeId: this.parseString(req.query.assigneeId as string | string[] | undefined),
      creatorId: this.parseString(req.query.creatorId as string | string[] | undefined),
      dueDateFilter: this.parseDueDateFilter(
        req.query.dueDateFilter as string | string[] | undefined
      ),
      search: this.parseString(req.query.search as string | string[] | undefined),
    };

    const page = this.parseNumber(req.query.page as string | string[] | undefined, 1);
    const limit = this.parseNumber(req.query.limit as string | string[] | undefined, 20);

    // Fetch data using TaskService
    const [tasksResult, users] = await Promise.all([
      this.taskService.findAllTasks(filters, page, limit),
      this.userService.findAll({}),
    ]);

    // Transform domain entities to view models
    const currentUser = this.getCurrentUserContext(req);
    const taskViewModels = tasksResult.items.map((task) =>
      this.taskToListItemViewModel(task, currentUser)
    );

    // For HTMX requests, trigger events
    if (req.isHtmx) {
      res.setHeader(
        'HX-Trigger',
        JSON.stringify({
          updateTaskCount: { total: tasksResult.total },
        })
      );
    }

    renderOrPartial(req, res, 'pages/tasks/list', 'partials/htmx/task-list', {
      tasks: taskViewModels,
      pagination: {
        page: tasksResult.page,
        limit: tasksResult.limit,
        total: tasksResult.total,
        totalPages: tasksResult.totalPages,
      },
      filters: {
        status: filters.status ?? [],
        priority: filters.priority ?? [],
        assigneeId: filters.assigneeId ?? '',
        creatorId: filters.creatorId ?? '',
        dueDateFilter: filters.dueDateFilter ?? '',
        search: filters.search ?? '',
      },
      users,
      user: req.user,
      title: 'Tâches',
    });
  }

  /**
   * GET /tasks/:id - Get task details
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with task ID param
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async detail(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    logger.debug('TaskController.detail', { taskId: id, userId: req.user?.id });

    const task = await this.taskService.findTaskById(id);
    if (!task) {
      res.status(404).render('pages/error/404', {
        title: 'Task not found',
        error: { message: 'Task not found' },
        user: req.user,
      });
      return;
    }

    const currentUser = this.getCurrentUserContext(req);
    const taskViewModel = this.taskToDetailViewModel(task, currentUser);

    renderOrPartial(req, res, 'pages/tasks/detail', 'partials/tasks/task-detail-card', {
      task: taskViewModel,
      user: req.user,
      title: task.title,
    });
  }

  /**
   * GET /tasks/new - Render task creation form
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async createPage(req: IAuthenticatedRequest, res: Response): Promise<void> {
    logger.debug('TaskController.createPage', { userId: req.user?.id });

    const users = await this.userService.findAll({});

    renderOrPartial(req, res, 'pages/tasks/form', 'partials/tasks/task-form', {
      user: req.user,
      task: null,
      users,
      mode: 'create',
      title: 'Nouvelle tâche',
    });
  }

  /**
   * POST /tasks - Create new task
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with task data in body
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    logger.debug('TaskController.create', {
      userId: req.user?.id,
      body: req.body,
    });

    const normalized = this.normalizeTaskRequest(req.body);

    // Build service input with proper types
    // Note: Zod schema has .default() so these fields are never undefined after validation
    const input: CreateTaskInput = {
      title: normalized.title as string,
      description: typeof normalized.description === 'string' ? normalized.description : null,
      status: (normalized.status as TaskStatus) || TaskStatus.TODO,
      priority: (normalized.priority as TaskPriority) || TaskPriority.MEDIUM,
      dueDate: normalized.dueDate ? new Date(normalized.dueDate as string) : null,
      assigneeId: typeof normalized.assigneeId === 'string' ? normalized.assigneeId : null,
      creatorId: req.user!.id,
    };

    const task = await this.taskService.createTask(input);

    if (typeof req.flash === 'function') {
      req.flash('success', 'Task created successfully!');
    }

    if (req.isHtmx) {
      htmxTrigger(res, 'taskCreated');
      htmxRedirect(res, `/tasks/${task.id}`);
    } else {
      res.redirect(`/tasks/${task.id}`);
    }
  }

  /**
   * GET /tasks/:id/edit - Render task edit form
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with task ID param
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async updatePage(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    logger.debug('TaskController.updatePage', { taskId: id, userId: req.user?.id });

    const [task, users] = await Promise.all([
      this.taskService.findTaskById(id),
      this.userService.findAll({}),
    ]);

    if (!task) {
      res.status(404).render('pages/error/404', {
        title: 'Task not found',
        error: { message: 'Task not found' },
        user: req.user,
      });
      return;
    }

    const formTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ?? '',
      dueDate: this.formatDateTimeLocal(task.dueDate),
    };

    renderOrPartial(req, res, 'pages/tasks/form', 'partials/tasks/task-form', {
      task: formTask,
      users,
      user: req.user,
      mode: 'edit',
      title: 'Modifier une tâche',
    });
  }

  /**
   * PATCH /tasks/:id - Update task
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with task ID and update data
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async update(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    logger.debug('TaskController.update', {
      taskId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const normalized = this.normalizeTaskRequest(req.body);

    // Build service input
    const input: UpdateTaskInput = {
      title: normalized.title as string | undefined,
      description: normalized.description as string | null | undefined,
      status: normalized.status as TaskStatus | undefined,
      priority: normalized.priority as TaskPriority | undefined,
      dueDate: normalized.dueDate ? new Date(normalized.dueDate as string) : null,
      assigneeId: normalized.assigneeId as string | null | undefined,
    };

    await this.taskService.updateTask(id, input);

    if (typeof req.flash === 'function') {
      req.flash('success', 'Task updated successfully!');
    }

    if (req.isHtmx) {
      res.setHeader('HX-Redirect', `/tasks/${id}`);
      res.status(200).send();
    } else {
      res.redirect(`/tasks/${id}`);
    }
  }

  /**
   * DELETE /tasks/:id - Delete task
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with task ID param
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async delete(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    logger.debug('TaskController.delete', { taskId: id, userId: req.user?.id });

    await this.taskService.deleteTask(id);

    if (typeof req.flash === 'function') {
      req.flash('success', 'Task deleted successfully!');
    }

    if (req.isHtmx) {
      res.setHeader('HX-Redirect', '/tasks');
      res.status(200).send();
    } else {
      res.redirect('/tasks');
    }
  }

  /**
   * POST /tasks/:id/complete - Toggle task completion status
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with task ID param
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async toggleComplete(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    logger.debug('TaskController.toggleComplete', { taskId: id, userId: req.user?.id });

    const currentTask = await this.taskService.findTaskById(id);
    if (!currentTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Toggle status: DONE ↔ IN_PROGRESS
    const newStatus =
      currentTask.status === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.DONE;

    await this.taskService.updateTask(id, { status: newStatus });

    if (req.isHtmx) {
      const updatedTask = await this.taskService.findTaskById(id);
      if (!updatedTask) {
        res.status(404).send();
        return;
      }

      const hxTarget = req.get('HX-Target');
      const currentUser = this.getCurrentUserContext(req);

      if (hxTarget === 'task-detail-card') {
        const detailView = this.taskToDetailViewModel(updatedTask, currentUser);
        htmxTrigger(res, 'taskStatusUpdated');
        res.render('partials/tasks/task-detail-card', {
          task: detailView,
          user: req.user,
          layout: false,
        });
        return;
      }

      const viewModel = this.taskToListItemViewModel(updatedTask, currentUser);
      htmxTrigger(res, 'taskStatusUpdated');
      res.render('partials/htmx/task-item', {
        task: viewModel,
        user: req.user,
        layout: false,
      });
    } else {
      if (typeof req.flash === 'function') {
        req.flash('success', 'Task status updated successfully!');
      }
      res.redirect(`/tasks/${id}`);
    }
  }

  /**
   * PATCH /tasks/:id/status - Update task status (quick action)
   *
   * @async
   * @param {IAuthenticatedRequest} req - Express request with task ID and status
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async updateStatus(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const body = req.body as { status?: string | string[] };
    const newStatus = this.parseString(body.status);

    logger.debug('TaskController.updateStatus', {
      taskId: id,
      newStatus,
      userId: req.user?.id,
    });

    if (!newStatus || !(newStatus in TaskStatus)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    await this.taskService.updateTask(id, {
      status: TaskStatus[newStatus as keyof typeof TaskStatus],
    });

    if (req.isHtmx) {
      const updatedTask = await this.taskService.findTaskById(id);
      if (!updatedTask) {
        res.status(404).send();
        return;
      }

      const hxTarget = req.get('HX-Target');
      const currentUser = this.getCurrentUserContext(req);

      if (hxTarget === 'task-detail-card') {
        const detailView = this.taskToDetailViewModel(updatedTask, currentUser);
        htmxTrigger(res, 'taskStatusUpdated');
        res.render('partials/tasks/task-detail-card', {
          task: detailView,
          user: req.user,
          layout: false,
        });
        return;
      }

      const viewModel = this.taskToListItemViewModel(updatedTask, currentUser);
      htmxTrigger(res, 'taskStatusUpdated');
      res.render('partials/htmx/task-item', {
        task: viewModel,
        user: req.user,
        layout: false,
      });
    } else {
      if (typeof req.flash === 'function') {
        req.flash('success', 'Task status updated successfully!');
      }
      res.redirect(`/tasks/${id}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Helper Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Gets current user context for view model transformations
   *
   * @private
   * @param {IAuthenticatedRequest} req - Express request
   * @returns {ICurrentUserContext | null} User context or null
   */
  private getCurrentUserContext(req: IAuthenticatedRequest): ICurrentUserContext | null {
    if (!req.user) {
      return null;
    }
    return {
      id: req.user.id,
      role: req.user.role,
    };
  }

  /**
   * Transforms Task domain entity to detail view model
   *
   * @private
   * @param {Task} task - Task domain entity
   * @param {ICurrentUserContext | null} currentUser - Current user context
   * @returns {unknown} Task detail view model
   */
  private taskToDetailViewModel(task: Task, currentUser: ICurrentUserContext | null): unknown {
    return toTaskDetailViewModel(
      {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        creator: { id: task.creatorId, name: '', email: '', role: 'MEMBER', locale: null }, // TODO: Load full creator data
        assignee: task.assigneeId
          ? { id: task.assigneeId, name: '', email: '', role: 'MEMBER', locale: null } // TODO: Load full assignee data
          : null,
      },
      currentUser
    );
  }

  /**
   * Transforms Task domain entity to list item view model
   *
   * @private
   * @param {Task} task - Task domain entity
   * @param {ICurrentUserContext | null} currentUser - Current user context
   * @returns {unknown} Task list item view model
   */
  private taskToListItemViewModel(task: Task, currentUser: ICurrentUserContext | null): unknown {
    return toTaskListItemViewModel(
      {
        id: task.id,
        title: task.title,
        creatorId: task.creatorId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignee: task.assigneeId
          ? { id: task.assigneeId, name: '', email: '' } // TODO: Load full assignee data
          : null,
      },
      currentUser
    );
  }

  /**
   * Parses number from query parameter
   *
   * @private
   * @param {string | string[] | undefined} value - Raw value
   * @param {number} fallback - Default value
   * @returns {number} Parsed number or fallback
   */
  private parseNumber(value: string | string[] | undefined, fallback: number): number {
    const str = this.parseString(value);
    if (!str) return fallback;
    const parsed = Number.parseInt(str, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Parses string from query parameter
   *
   * @private
   * @param {string | string[] | undefined} value - Raw value
   * @returns {string | undefined} Trimmed string or undefined
   */
  private parseString(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return this.parseString(value[0]);
    }
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  /**
   * Parses array of strings from query parameter
   *
   * @private
   * @param {string | string[] | undefined} value - Raw value
   * @returns {string[] | undefined} Array of strings or undefined
   */
  private parseArray(value: string | string[] | undefined): string[] | undefined {
    if (Array.isArray(value)) {
      const values = value
        .map((entry) => this.parseString(entry))
        .filter((entry): entry is string => Boolean(entry));
      return values.length > 0 ? values : undefined;
    }

    const single = this.parseString(value);
    return single ? [single] : undefined;
  }

  /**
   * Parses TaskStatus array from query parameter
   *
   * @private
   * @param {string | string[] | undefined} value - Raw value
   * @returns {TaskStatus[] | undefined} Array of TaskStatus or undefined
   */
  private parseStatusArray(value: string | string[] | undefined): TaskStatus[] | undefined {
    const strings = this.parseArray(value);
    if (!strings) return undefined;

    const statuses = strings
      .filter((s) => s in TaskStatus)
      .map((s) => TaskStatus[s as keyof typeof TaskStatus]);

    return statuses.length > 0 ? statuses : undefined;
  }

  /**
   * Parses TaskPriority array from query parameter
   *
   * @private
   * @param {string | string[] | undefined} value - Raw value
   * @returns {TaskPriority[] | undefined} Array of TaskPriority or undefined
   */
  private parsePriorityArray(value: string | string[] | undefined): TaskPriority[] | undefined {
    const strings = this.parseArray(value);
    if (!strings) return undefined;

    const priorities = strings
      .filter((p) => p in TaskPriority)
      .map((p) => TaskPriority[p as keyof typeof TaskPriority]);

    return priorities.length > 0 ? priorities : undefined;
  }

  /**
   * Parses due date filter from query parameter
   *
   * @private
   * @param {string | string[] | undefined} value - Raw value
   * @returns {'overdue' | 'today' | 'week' | undefined} Due date filter or undefined
   */
  private parseDueDateFilter(
    value: string | string[] | undefined
  ): 'overdue' | 'today' | 'week' | undefined {
    const str = this.parseString(value);
    if (!str) return undefined;
    return ['overdue', 'today', 'week'].includes(str)
      ? (str as 'overdue' | 'today' | 'week')
      : undefined;
  }

  /**
   * Formats date for datetime-local input
   *
   * @private
   * @param {Date | null} date - Date to format
   * @returns {string} Formatted date string or empty string
   */
  private formatDateTimeLocal(date: Date | null): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  }

  /**
   * Normalizes task request body data
   *
   * Handles empty strings for optional fields (assigneeId, dueDate).
   *
   * @private
   * @param {unknown} body - Raw request body
   * @returns {Record<string, unknown>} Normalized data
   */
  private normalizeTaskRequest(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const normalized = { ...(body as Record<string, unknown>) };

    // Convert empty strings to undefined for optional fields
    if (typeof normalized.assigneeId === 'string' && normalized.assigneeId.trim() === '') {
      delete normalized.assigneeId;
    }

    if (typeof normalized.dueDate === 'string' && normalized.dueDate.trim() === '') {
      delete normalized.dueDate;
    }

    if (typeof normalized.description === 'string' && normalized.description.trim() === '') {
      normalized.description = null;
    }

    return normalized;
  }
}
