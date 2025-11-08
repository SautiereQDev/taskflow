import { injectable, inject } from 'tsyringe';
import type { Request, Response } from 'express';
import { CommandBus } from '@application/commands/CommandBus.js';
import { QueryBus } from '@application/queries/QueryBus.js';
import { GetAllUsersQuery } from '@application/queries/users/GetAllUsersQuery.js';
import { GetUserByIdQuery } from '@application/queries/users/GetUserByIdQuery.js';
import { GetAllTasksQuery } from '@application/queries/tasks/GetAllTasksQuery.js';
import {
  UpdateUserCommand,
  type UpdateUserCommandInput,
} from '@application/commands/users/UpdateUserCommand.js';
import type { IPaginatedUsersDto } from '@application/queries/users/GetAllUsersHandler.js';
import type { IUserDto } from '@application/dtos/UserDto.js';
import type { IPaginatedTasksDto } from '@application/dtos/TaskDto.js';
import { renderOrPartial, htmxTrigger } from '@presentation/utils/response.helpers.js';
import {
  toTaskListItemViewModel,
  type ICurrentUserContext,
} from '@presentation/view-models/index.js';
import type { IAuthenticatedRequest } from './auth.controller.js';

const ROLE_DISPLAY: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Administrateur', color: 'badge-error' },
  MANAGER: { label: 'Manager', color: 'badge-warning' },
  MEMBER: { label: 'Membre', color: 'badge-info' },
};

@injectable()
export class AdminController {
  constructor(
    @inject(CommandBus) private readonly commandBus: CommandBus,
    @inject(QueryBus) private readonly queryBus: QueryBus
  ) {}

  async listUsers(req: Request, res: Response): Promise<void> {
    const page = Number.parseInt(req.query.page as string, 10) || 1;
    const limit = Number.parseInt(req.query.limit as string, 10) || 10;

    const result = await this.queryBus.execute<IPaginatedUsersDto>(
      GetAllUsersQuery,
      new GetAllUsersQuery(page, limit)
    );

    renderOrPartial(req, res, 'pages/admin/users', 'partials/admin/user-list', {
      users: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      title: 'User Management',
    });
  }

  /**
   * GET /users/:id - View user detail
   *
   * @param req - Express request with user ID in params
   * @param res - Express response
   */
  async viewUser(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.params.id;
    const currentUser = req.user!;

    const currentUserContext: ICurrentUserContext = {
      id: currentUser.id,
      role: currentUser.role,
    };

    // Load user data and task statistics concurrently
    const [user, assignedTasks, createdTasks] = await Promise.all([
      this.queryBus.execute<IUserDto>(GetUserByIdQuery, new GetUserByIdQuery(userId)),
      this.queryBus.execute<IPaginatedTasksDto>(
        GetAllTasksQuery,
        new GetAllTasksQuery({ assigneeId: userId, limit: 5 })
      ),
      this.queryBus.execute<IPaginatedTasksDto>(
        GetAllTasksQuery,
        new GetAllTasksQuery({ creatorId: userId, limit: 1 })
      ),
    ]);

    const profileView = this.buildProfileViewModel(
      user,
      {
        assigned: assignedTasks.total,
        created: createdTasks.total,
      },
      currentUserContext
    );

    const recentTasks = assignedTasks.items.map((task) =>
      toTaskListItemViewModel(task, currentUserContext)
    );

    // Render profile
    renderOrPartial(req, res, 'pages/users/profile', 'pages/users/profile', {
      user: profileView,
      recentTasks,
      title: `${user.name} - TaskFlow`,
    });
  }

  /**
   * GET /users/:id/edit - Render user edit form
   *
   * @param req - Express request with user ID in params
   * @param res - Express response
   */
  async editUserPage(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.params.id;

    // Get user data
    const user = await this.queryBus.execute<IUserDto>(
      GetUserByIdQuery,
      new GetUserByIdQuery(userId)
    );

    const formModel = this.buildProfileFormModel(user);

    // Render edit form
    renderOrPartial(req, res, 'pages/users/profile-edit', 'pages/users/profile-edit', {
      user: formModel,
      title: `Modifier ${user.name} - TaskFlow`,
      isAdminContext: true, // Admin editing user
    });
  }

  /**
   * PATCH /users/:id - Update user
   *
   * @param req - Express request with user data in body
   * @param res - Express response
   */
  async updateUser(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.params.id;
    const updateData = req.body as Omit<UpdateUserCommandInput, 'userId'>;

    // Execute command
    const command = new UpdateUserCommand({
      userId,
      ...updateData,
    });
    await this.commandBus.execute(UpdateUserCommand, command);

    // Set flash message
    if (typeof req.flash === 'function') {
      req.flash('success', 'User updated successfully!');
    }

    // Trigger or redirect
    if (req.isHtmx) {
      htmxTrigger(res, 'userUpdated');
      res.status(200).send('<div class="alert alert-success">User updated!</div>');
    } else {
      res.redirect(`/users/${userId}`);
    }
  }

  /**
   * Build profile form model for editing
   */
  private buildProfileFormModel(user: IUserDto): Record<string, unknown> {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar ?? '',
      locale: user.locale ?? 'fr',
    };
  }

  /**
   * Build profile view model for display
   */
  private buildProfileViewModel(
    user: IUserDto,
    taskTotals: { assigned: number; created: number },
    currentUser: ICurrentUserContext
  ): Record<string, unknown> {
    const roleDisplay = ROLE_DISPLAY[user.role] ?? ROLE_DISPLAY.MEMBER;
    const isCurrentUser = currentUser.id === user.id;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: {
        value: user.role,
        label: roleDisplay.label,
        color: roleDisplay.color,
      },
      createdAt: {
        raw: user.createdAt,
        formatted: this.formatDate(user.createdAt),
      },
      updatedAt: {
        raw: user.updatedAt,
        formatted: this.formatDate(user.updatedAt),
      },
      taskCount: {
        created: taskTotals.created,
        assigned: taskTotals.assigned,
      },
      canEdit: isCurrentUser || currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER',
      isCurrentUser,
    };
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
