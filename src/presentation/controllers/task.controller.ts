/**
 * Task Controller
 *
 * Handles HTTP requests for task operations (CRUD).
 * Supports both full page renders and HTMX partial updates.
 *
 * @module presentation/controllers/task.controller
 */

import type { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import type { Task } from '@domain/entities/Task.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { CommandBus } from '@application/commands/CommandBus.js';
import { QueryBus } from '@application/queries/QueryBus.js';
import type { IPaginatedTasksDto, ITaskDto, ITaskListItemDto } from '@application/dtos/TaskDto.js';
import { GetAllTasksQuery } from '@application/queries/tasks/GetAllTasksQuery.js';
import { GetTaskByIdQuery } from '@application/queries/tasks/GetTaskByIdQuery.js';
import { GetAllUsersQuery } from '@application/queries/users/GetAllUsersQuery.js';
import type { IPaginatedUsersDto } from '@application/queries/users/GetAllUsersHandler.js';
import {
  CreateTaskCommand,
  type CreateTaskCommandInput,
} from '@application/commands/tasks/CreateTaskCommand.js';
import {
  UpdateTaskCommand,
  type UpdateTaskCommandInput,
} from '@application/commands/tasks/UpdateTaskCommand.js';
import { DeleteTaskCommand } from '@application/commands/tasks/DeleteTaskCommand.js';
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

/**
 * TaskController
 *
 * Thin HTTP handler for task operations.
 * Delegates to Commands/Queries, handles HTMX responses.
 */
@injectable()
export class TaskController {
  constructor(
    @inject(CommandBus) private readonly commandBus: CommandBus,
    @inject(QueryBus) private readonly queryBus: QueryBus
  ) {}

  /**
   * GET /tasks - List all tasks with filters and pagination
   */
  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const status = this.parseArray(req.query.status as string | string[] | undefined);
    const priority = this.parseArray(req.query.priority as string | string[] | undefined);
    const assigneeId = this.parseString(req.query.assigneeId as string | string[] | undefined);
    const creatorId = this.parseString(req.query.creatorId as string | string[] | undefined);
    const dueDateFilter = this.parseDueDateFilter(
      req.query.dueDateFilter as string | string[] | undefined
    );
    const search = this.parseString(req.query.search as string | string[] | undefined);
    const page = this.parseNumber(req.query.page as string | string[] | undefined, 1);
    const limit = this.parseNumber(req.query.limit as string | string[] | undefined, 20);

    const query = new GetAllTasksQuery({
      page,
      limit,
      status,
      priority,
      assigneeId,
      creatorId,
      dueDateFilter,
      search,
    });

    const tasksResult = await this.queryBus.execute<IPaginatedTasksDto>(GetAllTasksQuery, query);
    const usersResult = await this.queryBus.execute<IPaginatedUsersDto>(
      GetAllUsersQuery,
      new GetAllUsersQuery(1, 100)
    );

    const currentUser = this.getCurrentUserContext(req);
    const taskViewModels = tasksResult.items.map((task) =>
      toTaskListItemViewModel(task, currentUser)
    );

    renderOrPartial(req, res, 'pages/tasks/list', 'partials/htmx/task-list', {
      tasks: taskViewModels,
      pagination: {
        page: tasksResult.page,
        limit: tasksResult.limit,
        total: tasksResult.total,
        totalPages: tasksResult.totalPages,
      },
      filters: {
        status: status ?? [],
        priority: priority ?? [],
        assigneeId: assigneeId ?? '',
        creatorId: creatorId ?? '',
        dueDateFilter: dueDateFilter ?? '',
        search: search ?? '',
      },
      users: usersResult.users,
      user: req.user,
      title: 'Tâches',
    });
  }

  /**
   * GET /tasks/:id - Get task details
   */
  async detail(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const query = new GetTaskByIdQuery(id);
    const taskDto = await this.queryBus.execute<ITaskDto>(GetTaskByIdQuery, query);

    const currentUser = this.getCurrentUserContext(req);
    const task = toTaskDetailViewModel(taskDto, currentUser);

    renderOrPartial(req, res, 'pages/tasks/detail', 'partials/tasks/task-detail-card', {
      task,
      user: req.user,
      title: task.title,
    });
  }

  /**
   * GET /tasks/new - Render task creation form
   */
  async createPage(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const usersResult = await this.queryBus.execute<IPaginatedUsersDto>(
      GetAllUsersQuery,
      new GetAllUsersQuery(1, 100)
    );

    renderOrPartial(req, res, 'pages/tasks/form', 'partials/tasks/task-form', {
      user: req.user,
      task: null,
      users: usersResult.users,
      mode: 'create',
      title: 'Nouvelle tâche',
    });
  }

  /**
   * POST /tasks - Create new task
   */
  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const rawData = this.normalizeTaskRequest(req.body);
    const { title, description, status, priority, dueDate, assigneeId } = rawData;

    const commandData: CreateTaskCommandInput = {
      title: title as string,
      description: description as string | undefined | null,
      status: status as CreateTaskCommandInput['status'],
      priority: priority as CreateTaskCommandInput['priority'],
      dueDate: dueDate as CreateTaskCommandInput['dueDate'],
      assigneeId: assigneeId as CreateTaskCommandInput['assigneeId'],
      creatorId: req.user!.id,
    };

    const command = new CreateTaskCommand(commandData);
    const task = await this.commandBus.execute<CreateTaskCommand, Task>(CreateTaskCommand, command);

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
   */
  async updatePage(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const [taskDto, usersResult] = await Promise.all([
      this.queryBus.execute<ITaskDto>(GetTaskByIdQuery, new GetTaskByIdQuery(id)),
      this.queryBus.execute<IPaginatedUsersDto>(GetAllUsersQuery, new GetAllUsersQuery(1, 100)),
    ]);

    const formTask = {
      id: taskDto.id,
      title: taskDto.title,
      description: taskDto.description,
      status: taskDto.status,
      priority: taskDto.priority,
      assigneeId: taskDto.assignee?.id ?? '',
      dueDate: this.formatDateTimeLocal(taskDto.dueDate),
    };

    renderOrPartial(req, res, 'pages/tasks/form', 'partials/tasks/task-form', {
      task: formTask,
      users: usersResult.users,
      user: req.user,
      mode: 'edit',
      title: 'Modifier une tâche',
    });
  }

  /**
   * PATCH /tasks/:id - Update task
   */
  async update(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const rawData = this.normalizeTaskRequest(req.body);
    const { title, description, status, priority, dueDate, assigneeId } = rawData;

    const command = new UpdateTaskCommand({
      taskId: id,
      title: title as UpdateTaskCommandInput['title'],
      description: description as UpdateTaskCommandInput['description'],
      status: status as UpdateTaskCommandInput['status'],
      priority: priority as UpdateTaskCommandInput['priority'],
      dueDate: dueDate as UpdateTaskCommandInput['dueDate'],
      assigneeId: assigneeId as UpdateTaskCommandInput['assigneeId'],
    });
    await this.commandBus.execute(UpdateTaskCommand, command);

    if (typeof req.flash === 'function') {
      req.flash('success', 'Task updated successfully!');
    }

    if (req.isHtmx) {
      htmxTrigger(res, 'taskUpdated');
      res.status(200).send('<div class="alert alert-success">Task updated!</div>');
    } else {
      res.redirect(`/tasks/${id}`);
    }
  }

  /**
   * DELETE /tasks/:id - Delete task
   */
  async delete(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const command = new DeleteTaskCommand({ taskId: id });
    await this.commandBus.execute(DeleteTaskCommand, command);

    if (typeof req.flash === 'function') {
      req.flash('success', 'Task deleted successfully!');
    }

    if (req.isHtmx) {
      htmxTrigger(res, 'taskDeleted');
      res.status(200).end();
    } else {
      res.redirect('/tasks');
    }
  }

  /**
   * POST /tasks/:id/complete - Toggle task completion status
   */
  async toggleComplete(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const currentTask = await this.queryBus.execute<ITaskDto>(
      GetTaskByIdQuery,
      new GetTaskByIdQuery(id)
    );

    const newStatus =
      currentTask.status === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.DONE;

    const command = new UpdateTaskCommand({
      taskId: id,
      status: newStatus,
    });
    await this.commandBus.execute(UpdateTaskCommand, command);

    if (req.isHtmx) {
      const updatedTask = await this.queryBus.execute<ITaskDto>(
        GetTaskByIdQuery,
        new GetTaskByIdQuery(id)
      );
      const hxTarget = req.get('HX-Target');
      if (hxTarget === 'task-detail-card') {
        const detailView = toTaskDetailViewModel(updatedTask, this.getCurrentUserContext(req));
        htmxTrigger(res, 'taskStatusUpdated');
        res.render('partials/tasks/task-detail-card', {
          task: detailView,
          user: req.user,
          layout: false,
        });
        return;
      }

      const viewModel = toTaskListItemViewModel(
        this.toListItemDto(updatedTask),
        this.getCurrentUserContext(req)
      );
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
   */
  async updateStatus(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const newStatus = this.parseString(req.body?.status as string | string[] | undefined);

    if (!newStatus || !(newStatus in TaskStatus)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const command = new UpdateTaskCommand({
      taskId: id,
      status: TaskStatus[newStatus as keyof typeof TaskStatus],
    });
    await this.commandBus.execute(UpdateTaskCommand, command);

    if (req.isHtmx) {
      const updatedTask = await this.queryBus.execute<ITaskDto>(
        GetTaskByIdQuery,
        new GetTaskByIdQuery(id)
      );
      const hxTarget = req.get('HX-Target');
      if (hxTarget === 'task-detail-card') {
        const detailView = toTaskDetailViewModel(updatedTask, this.getCurrentUserContext(req));
        htmxTrigger(res, 'taskStatusUpdated');
        res.render('partials/tasks/task-detail-card', {
          task: detailView,
          user: req.user,
          layout: false,
        });
        return;
      }

      const viewModel = toTaskListItemViewModel(
        this.toListItemDto(updatedTask),
        this.getCurrentUserContext(req)
      );
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

  private getCurrentUserContext(req: IAuthenticatedRequest): ICurrentUserContext | null {
    if (!req.user) {
      return null;
    }
    return {
      id: req.user.id,
      role: req.user.role,
    };
  }

  private parseNumber(value: string | string[] | undefined, fallback: number): number {
    const str = this.parseString(value);
    if (!str) return fallback;
    const parsed = Number.parseInt(str, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private parseString(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return this.parseString(value[0]);
    }
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

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

  private parseDueDateFilter(
    value: string | string[] | undefined
  ): 'overdue' | 'today' | 'week' | undefined {
    const str = this.parseString(value);
    if (!str) return undefined;
    return ['overdue', 'today', 'week'].includes(str)
      ? (str as 'overdue' | 'today' | 'week')
      : undefined;
  }

  private formatDateTimeLocal(date: Date | null): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  }

  private normalizeTaskRequest(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const normalized = { ...(body as Record<string, unknown>) };

    if (typeof normalized.assigneeId === 'string' && normalized.assigneeId.trim() === '') {
      delete normalized.assigneeId;
    }

    if (typeof normalized.dueDate === 'string' && normalized.dueDate.trim() === '') {
      delete normalized.dueDate;
    }

    return normalized;
  }

  private toListItemDto(task: ITaskDto): ITaskListItemDto {
    return {
      id: task.id,
      title: task.title,
      creatorId: task.creator.id,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
    };
  }
}
