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
import { renderOrPartial, htmxTrigger, htmxRefresh } from '@presentation/utils/response.helpers.js';
import type { IAuthenticatedRequest } from './auth.controller.js';

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

    // Get user data
    const query = new GetUserByIdQuery(userId);
    const user = await this.queryBus.execute(GetUserByIdQuery, query);

    // Render profile
    renderOrPartial(req, res, 'pages/users/profile', 'partials/user/profile-view', {
      user,
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
    const query = new GetUserByIdQuery(userId);
    const user = await this.queryBus.execute(GetUserByIdQuery, query);

    // Render edit form
    renderOrPartial(req, res, 'pages/user/edit', 'partials/user/profile-form', {
      user,
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
    renderOrPartial(req, res, 'pages/user/settings', 'partials/user/settings-form', {
      user: req.user,
      theme: currentTheme,
      locale: currentLocale,
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
}
