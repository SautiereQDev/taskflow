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
import type { IPaginatedTasksDto } from '@application/dtos/TaskDto.js';
import { GetAllTasksQuery } from '@application/queries/tasks/GetAllTasksQuery.js';
import { GetTaskByIdQuery } from '@application/queries/tasks/GetTaskByIdQuery.js';
import { GetAllUsersQuery } from '@application/queries/users/GetAllUsersQuery.js';
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
   *
   * @param req - Express request with query parameters
   * @param res - Express response
   */
  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '20',
      status,
      priority,
      assigneeId,
      creatorId,
      search,
    } = req.query as Record<string, string>;

    // Execute query
    const query = new GetAllTasksQuery(
      Number.parseInt(page, 10),
      Number.parseInt(limit, 10),
      status,
      priority,
      assigneeId,
      creatorId,
      search
    );
    const result = await this.queryBus.execute<IPaginatedTasksDto>(GetAllTasksQuery, query);

    // Render full page or partial for filters
    renderOrPartial(req, res, 'pages/tasks/list', 'partials/tasks/task-list', {
      tasks: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      filters: { status, priority, assigneeId, creatorId, search },
      users: [], // TODO: Fetch users for filter dropdown
      user: req.user,
    });
  }

  /**
   * GET /tasks/:id - Get task details
   *
   * @param req - Express request with task ID in params
   * @param res - Express response
   */
  async detail(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Execute query
    const query = new GetTaskByIdQuery(id);
    const task = await this.queryBus.execute(GetTaskByIdQuery, query);

    // Render full page or partial (for modals)
    renderOrPartial(req, res, 'pages/tasks/detail', 'partials/tasks/task-detail', {
      task,
      user: req.user,
    });
  }

  /**
   * GET /tasks/new - Render task creation form
   *
   * @param req - Express request
   * @param res - Express response
   */
  createPage(req: IAuthenticatedRequest, res: Response): void {
    renderOrPartial(req, res, 'pages/tasks/form', 'partials/tasks/task-form', {
      user: req.user,
      task: null, // For create page, task is null
    });
  }

  /**
   * POST /tasks - Create new task
   *
   * @param req - Express request with task data in body
   * @param res - Express response
   */
  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const taskData = req.body as CreateTaskCommandInput;

    // Set creator from authenticated user
    const commandData = {
      ...taskData,
      creatorId: req.user!.id,
    };

    // Execute command
    const command = new CreateTaskCommand(commandData);
    const task = await this.commandBus.execute<CreateTaskCommand, Task>(CreateTaskCommand, command);

    // Set flash message
    req.flash('success', 'Task created successfully!');

    // Redirect or trigger event
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
   * @param req - Express request with task ID in params
   * @param res - Express response
   */
  async updatePage(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Get task data
    const taskQuery = new GetTaskByIdQuery(id);
    const taskResult = await this.queryBus.execute(GetTaskByIdQuery, taskQuery);
    const task = taskResult as Task;

    // Get users for assignee dropdown
    const usersQuery = new GetAllUsersQuery(1, 100);
    const usersResult = await this.queryBus.execute(GetAllUsersQuery, usersQuery);

    // Format dueDate for datetime-local input
    const formattedTask = {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    };

    // Render edit form
    // Note: For now, render full page for both regular and HTMX requests
    // TODO: Create partials/tasks/task-form.ejs for true partial updates
    res.render('pages/tasks/edit', {
      task: formattedTask,
      users: (usersResult as { users: unknown[] }).users,
      user: req.user,
      t: req.t.bind(req),
      __: req.__.bind(req),
      locale: req.locale,
    });
  }

  /**
   * PATCH /tasks/:id - Update task
   *
   * @param req - Express request with task ID and update data
   * @param res - Express response
   */
  async update(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body as Omit<UpdateTaskCommandInput, 'taskId'>;

    // Execute command
    const command = new UpdateTaskCommand({
      taskId: id,
      ...updateData,
    });
    await this.commandBus.execute(UpdateTaskCommand, command);

    // Set flash message
    req.flash('success', 'Task updated successfully!');

    // Trigger refresh or redirect
    if (req.isHtmx) {
      htmxTrigger(res, 'taskUpdated');
      res.status(200).send('<div class="alert alert-success">Task updated!</div>');
    } else {
      res.redirect(`/tasks/${id}`);
    }
  }

  /**
   * DELETE /tasks/:id - Delete task
   *
   * @param req - Express request with task ID in params
   * @param res - Express response
   */
  async delete(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Execute command
    const command = new DeleteTaskCommand({ taskId: id });
    await this.commandBus.execute(DeleteTaskCommand, command);

    // Set flash message
    req.flash('success', 'Task deleted successfully!');

    // Trigger refresh or redirect
    if (req.isHtmx) {
      htmxTrigger(res, 'taskDeleted');
      res.status(200).end();
    } else {
      res.redirect('/tasks');
    }
  }

  /**
   * POST /tasks/:id/complete - Toggle task completion status
   *
   * @param req - Express request with task ID in params
   * @param res - Express response
   */
  async toggleComplete(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Get current task
    const query = new GetTaskByIdQuery(id);
    const taskResult = await this.queryBus.execute(GetTaskByIdQuery, query);
    const task = taskResult as { status: TaskStatus };

    // Toggle status: DONE <-> IN_PROGRESS
    const newStatus: TaskStatus =
      task.status === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.DONE;

    // Execute update command
    const command = new UpdateTaskCommand({
      taskId: id,
      status: newStatus,
    });
    const updatedTask = await this.commandBus.execute<UpdateTaskCommand, Task>(
      UpdateTaskCommand,
      command
    );

    // For HTMX requests, return updated task partial
    if (req.isHtmx) {
      htmxTrigger(res, 'taskStatusUpdated');
      res.render('partials/htmx/task-item', {
        task: updatedTask,
        user: req.user,
      });
    } else {
      req.flash('success', 'Task status updated successfully!');
      res.redirect(`/tasks/${id}`);
    }
  }

  /**
   * PATCH /tasks/:id/status - Update task status (for quick status changes)
   *
   * @param req - Express request with task ID and new status
   * @param res - Express response
   */
  async updateStatus(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    // Validate and convert status
    const statusMap: Record<string, TaskStatus> = {
      TODO: TaskStatus.TODO,
      IN_PROGRESS: TaskStatus.IN_PROGRESS,
      DONE: TaskStatus.DONE,
      CANCELLED: TaskStatus.CANCELLED,
    };

    const taskStatus = statusMap[status];
    if (!taskStatus) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Execute update command
    const command = new UpdateTaskCommand({
      taskId: id,
      status: taskStatus,
    });
    const updatedTask = await this.commandBus.execute<UpdateTaskCommand, Task>(
      UpdateTaskCommand,
      command
    );

    // For HTMX requests, return updated task partial
    if (req.isHtmx) {
      htmxTrigger(res, 'taskStatusUpdated');
      res.render('partials/htmx/task-item', {
        task: updatedTask,
        user: req.user,
      });
    } else {
      req.flash('success', 'Task status updated successfully!');
      res.redirect(`/tasks/${id}`);
    }
  }
}
