/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication operations (login, register, logout).
 * Thin layer that delegates to Application Layer services/commands.
 *
 * @module presentation/controllers/auth.controller
 */

import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthenticationService } from '../../application/services/AuthenticationService.js';
import { CommandBus } from '../../application/commands/CommandBus.js';
import {
  CreateUserCommand,
  type CreateUserCommandInput,
} from '../../application/commands/users/CreateUserCommand.js';
import { renderOrPartial, htmxRedirect } from '../utils/response.helpers.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Interface for authenticated Express request
 * Adds session and user properties
 */
export interface IAuthenticatedRequest extends Request {
  session: Request['session'] & {
    userId?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

/**
 * AuthController
 *
 * Thin HTTP handler for authentication operations.
 * No business logic - only input validation and response formatting.
 */
@injectable()
export class AuthController {
  constructor(
    @inject(AuthenticationService)
    private readonly authService: AuthenticationService,
    @inject(CommandBus) private readonly commandBus: CommandBus
  ) {}

  /**
   * GET /auth/login - Render login page
   *
   * @param req - Express request
   * @param res - Express response
   */
  loginPage(req: Request, res: Response): void {
    renderOrPartial(req, res, 'pages/auth/login', 'partials/auth/login-form');
  }

  /**
   * POST /auth/login - Authenticate user
   *
   * @param req - Express request with email and password in body
   * @param res - Express response
   * @throws {AppError} 401 if credentials invalid
   * @throws {AppError} 403 if account deactivated
   */
  async login(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    // Authenticate via service
    const result = await this.authService.login(email, password);

    // Store user ID in session
    req.session.userId = result.user.id;

    // Set flash message (if available)
    if (typeof req.flash === 'function') {
      req.flash('success', 'Welcome back!');
    }

    // Redirect to dashboard (HTMX-aware)
    if (req.isHtmx) {
      htmxRedirect(res, '/dashboard');
    } else {
      res.redirect('/dashboard');
    }
  }

  /**
   * GET /auth/register - Render registration page
   *
   * @param req - Express request
   * @param res - Express response
   */
  registerPage(req: Request, res: Response): void {
    renderOrPartial(req, res, 'pages/auth/register', 'partials/auth/register-form');
  }

  /**
   * POST /auth/register - Register new user
   *
   * @param req - Express request with name, email, password in body
   * @param res - Express response
   * @throws {AppError} 400 if validation fails
   * @throws {AppError} 409 if email already exists
   */
  async register(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const { name, email, password } = req.body as CreateUserCommandInput;

    // Create user via command
    const command = new CreateUserCommand({ name, email, password });
    const user = await this.commandBus.execute<
      CreateUserCommand,
      { id: string; name: string; email: string }
    >(CreateUserCommand, command);

    if (!user?.id) {
      throw new AppError('Failed to create user', 500);
    }

    // Auto-login after registration
    req.session.userId = user.id;

    // Set flash message (if available)
    if (typeof req.flash === 'function') {
      req.flash('success', 'Account created successfully! Welcome aboard!');
    }

    // Redirect to dashboard (HTMX-aware)
    if (req.isHtmx) {
      htmxRedirect(res, '/dashboard');
    } else {
      res.redirect('/dashboard');
    }
  }

  /**
   * POST /auth/logout - Logout current user
   *
   * @param req - Express request with user session
   * @param res - Express response
   */
  logout(req: IAuthenticatedRequest, res: Response): void {
    const userId = req.session.userId;

    if (!userId) {
      throw new AppError('No active session', 401);
    }

    // Cleanup (optional - can be extended)
    this.authService.logout(userId);

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        throw new AppError('Failed to logout', 500, { error: err });
      }

      // Clear session cookie
      res.clearCookie('connect.sid');

      // Set flash message (stored in cookie for next request, if available)
      if (typeof req.flash === 'function') {
        req.flash('success', 'You have been logged out');
      }

      // Redirect to login (HTMX-aware)
      if (req.isHtmx) {
        htmxRedirect(res, '/auth/login');
      } else {
        res.redirect('/auth/login');
      }
    });
  }
}
