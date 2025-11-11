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
import { UserService } from '../../application/services/UserService.js';
import { UserRole } from '@domain/entities/User.js';
import { renderOrPartial, htmxRedirect } from '../utils/response.helpers.js';
import { AppError } from '../../utils/AppError.js';
import { logger } from '../../utils/logger.util.js';

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
    @inject(UserService) private readonly userService: UserService
  ) {}

  /**
   * GET /auth/login - Render login page
   *
   * @param req - Express request
   * @param res - Express response
   */
  loginPage(req: Request, res: Response): void {
    renderOrPartial(req, res, 'pages/auth/login', 'pages/auth/login', {
      title: 'Connexion - TaskFlow',
    });
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

    try {
      // Authenticate via service
      const result = await this.authService.login(email, password);

      // Store user ID in session
      req.session.userId = result.user.id;

      // Log session before save
      logger.info('Session before save', {
        userId: req.session.userId,
        sessionID: req.sessionID,
        cookie: req.session.cookie,
      });

      // Explicitly save session before redirect
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            logger.error('Session save error', { error: err });
            reject(new AppError('Failed to save session', 500, { error: err }));
          } else {
            logger.info('Session saved successfully');
            resolve();
          }
        });
      });

      logger.info('Session after save', {
        userId: req.session.userId,
        sessionID: req.sessionID,
      });

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
    } catch (error) {
      // Handle authentication failure - re-render login page with error
      if (error instanceof AppError && error.statusCode === 401) {
        // Set flash error message
        if (typeof req.flash === 'function') {
          req.flash('error', error.message);
        }

        // Re-render login page with error
        renderOrPartial(req, res, 'pages/auth/login', 'pages/auth/login', {
          title: 'Connexion - TaskFlow',
          formData: { email }, // Preserve email input
          errors: { general: error.message }, // Display error
        });
      } else {
        // Re-throw other errors to global error handler
        throw error;
      }
    }
  }

  /**
   * GET /auth/register - Render registration page
   *
   * @param req - Express request
   * @param res - Express response
   */
  registerPage(req: Request, res: Response): void {
    renderOrPartial(req, res, 'pages/auth/register', 'pages/auth/register', {
      title: 'Inscription - TaskFlow',
    });
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
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    // Create user via UserService with default role and locale from request
    const user = await this.userService.register({
      name,
      email,
      password,
      role: UserRole.MEMBER, // Default role for new registrations
      locale: (req.getLocale?.() as 'fr' | 'en') ?? 'fr', // From i18n middleware
    });

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

    // If no session, just redirect to login (graceful handling)
    if (!userId) {
      if (req.isHtmx) {
        htmxRedirect(res, '/auth/login');
      } else {
        res.redirect('/auth/login');
      }
      return;
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
