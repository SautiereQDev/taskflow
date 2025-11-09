/**
 * User Controller
 *
 * Handles HTTP requests for user profile and settings operations.
 *
 * @module presentation/controllers/user.controller
 */

import type { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CommandBus } from '@application/commands/CommandBus.js';
import { QueryBus } from '@application/queries/QueryBus.js';
import { GetUserByIdQuery } from '@application/queries/users/GetUserByIdQuery.js';
import {
  UpdateUserCommand,
  type UpdateUserCommandInput,
} from '@application/commands/users/UpdateUserCommand.js';
import { GetAllTasksQuery } from '@application/queries/tasks/GetAllTasksQuery.js';
import type { IPaginatedTasksDto } from '@application/dtos/TaskDto.js';
import type { IUserDto } from '@application/dtos/UserDto.js';
import { renderOrPartial, htmxTrigger, htmxRefresh } from '@presentation/utils/response.helpers.js';
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

/**
 * UserController
 *
 * Thin HTTP handler for user profile operations.
 */
@injectable()
export class UserController {
  constructor(
    @inject(CommandBus) private readonly commandBus: CommandBus,
    @inject(QueryBus) private readonly queryBus: QueryBus
  ) {}

  /**
   * GET /profile - View user profile
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   */
  async profile(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    const currentUserContext = this.getCurrentUserContext(req);

    // Load profile data and task statistics concurrently
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
      title: 'Mon profil - TaskFlow',
    });
  }

  /**
   * GET /profile/edit - Render profile edit form
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   */
  async updateProfilePage(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    // Get user data
    const user = await this.queryBus.execute<IUserDto>(
      GetUserByIdQuery,
      new GetUserByIdQuery(userId)
    );

    const formModel = this.buildProfileFormModel(user);

    // Render edit form
    renderOrPartial(req, res, 'pages/users/profile-edit', 'pages/users/profile-edit', {
      user: formModel,
      title: 'Modifier mon profil - TaskFlow',
      isAdminContext: false, // User editing own profile
    });
  }

  /**
   * PATCH /profile - Update user profile
   *
   * @param req - Express request with profile data in body
   * @param res - Express response
   */
  async updateProfile(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const updateData = req.body as Omit<UpdateUserCommandInput, 'userId'>;

    // Execute command
    const command = new UpdateUserCommand({
      userId,
      ...updateData,
    });
    await this.commandBus.execute(UpdateUserCommand, command);

    // Update session locale if changed
    if (updateData.locale) {
      req.session.locale = updateData.locale;
    }

    // Set flash message
    req.flash('success', 'Profile updated successfully!');

    // Trigger refresh or redirect
    if (req.isHtmx) {
      htmxTrigger(res, 'profileUpdated');
      res.status(200).send('<div class="alert alert-success">Profile updated!</div>');
    } else {
      res.redirect('/profile');
    }
  }

  /**
   * GET /settings - View user settings
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   */
  settings(req: IAuthenticatedRequest, res: Response): void {
    const currentTheme = req.session.theme ?? 'light';
    const currentLocale = req.session.locale ?? 'fr';

    // Render settings
    renderOrPartial(req, res, 'pages/user/settings', 'pages/user/settings', {
      user: req.user,
      theme: currentTheme,
      locale: currentLocale,
      title: 'Paramètres - TaskFlow',
    });
  }

  /**
   * PATCH /settings - Update user settings (theme, locale)
   *
   * @param req - Express request with settings in body
   * @param res - Express response
   */
  updateSettings(req: IAuthenticatedRequest, res: Response): void {
    const { theme, locale } = req.body as { theme?: string; locale?: string };

    // Update session settings
    if (theme && ['light', 'dark'].includes(theme)) {
      req.session.theme = theme as 'light' | 'dark';
    }

    if (locale && ['fr', 'en'].includes(locale)) {
      req.session.locale = locale as 'fr' | 'en';
    }

    // Set flash message
    req.flash('success', 'Settings updated successfully!');

    // Trigger full page refresh to apply theme
    if (req.isHtmx) {
      htmxRefresh(res);
    } else {
      res.redirect('/settings');
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

  private buildProfileViewModel(
    user: IUserDto,
    taskTotals: { assigned: number; created: number },
    currentUser: ICurrentUserContext | null
  ): Record<string, unknown> {
    const roleDisplay = ROLE_DISPLAY[user.role] ?? ROLE_DISPLAY.MEMBER;
    const isCurrentUser = currentUser?.id === user.id;

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
      canEdit: isCurrentUser,
      isCurrentUser,
    };
  }

  private buildProfileFormModel(user: IUserDto): Record<string, unknown> {
    return {
      id: user.id,
      name: user.name,
      locale: user.locale ?? 'fr',
    };
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
