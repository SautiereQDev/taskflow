/**
 * Authentication Middleware
 *
 * Protects routes by verifying user session and loading user data.
 * Compatible with HTMX requests (HX-Redirect header).
 *
 * @module presentation/middleware/authentication.middleware
 */

import type { Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthenticationService } from '@application/services/AuthenticationService.js';
import type { IAuthenticatedRequest } from '@presentation/controllers/auth.controller.js';
import { AppError } from '@utils/AppError.js';

/**
 * Middleware to require authentication
 *
 * Checks for valid session and loads user data.
 * Redirects to login page if not authenticated.
 *
 * @param req - Express request with session
 * @param res - Express response
 * @param next - Express next function
 *
 * @example
 * ```typescript
 * router.get('/dashboard', requireAuth, dashboardController.index);
 * ```
 */
export async function requireAuth(
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.session.userId;

  // No session
  if (!userId) {
    if (req.isHtmx) {
      // HTMX request: send redirect header
      res.setHeader('HX-Redirect', '/auth/login');
      res.status(401).end();
      return;
    }

    // Normal request: redirect
    res.redirect('/auth/login');
    return;
  }

  // Validate session and load user
  try {
    const authService = container.resolve(AuthenticationService);
    const user = await authService.validateSession(userId);

    if (!user) {
      // Session invalid or user deactivated
      req.session.destroy(() => {
        if (req.isHtmx) {
          res.setHeader('HX-Redirect', '/auth/login');
          res.status(401).end();
        } else {
          res.redirect('/auth/login');
        }
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email.value,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    next(new AppError('Authentication failed', 500, { error }));
  }
}

/**
 * Middleware to attach user if authenticated (optional)
 *
 * Loads user data if session exists, but doesn't require authentication.
 * Useful for pages that show different content based on auth state.
 *
 * @param req - Express request with session
 * @param _res - Express response (unused)
 * @param next - Express next function
 *
 * @example
 * ```typescript
 * router.get('/', attachUser, homeController.index);
 * ```
 */
export async function attachUser(
  req: IAuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.session.userId;

  if (!userId) {
    next();
    return;
  }

  try {
    const authService = container.resolve(AuthenticationService);
    const user = await authService.validateSession(userId);

    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email.value,
        role: user.role,
        isActive: user.isActive,
      };
    }
  } catch (error) {
    // Silent fail - user just won't be attached
    console.error('Failed to attach user:', error);
  }

  next();
}
