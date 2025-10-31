/**
 * Authorization Middleware
 *
 * Checks user permissions and resource ownership.
 * Must be used after requireAuth middleware.
 *
 * @module presentation/middleware/authorization.middleware
 */

import type { Response, NextFunction } from 'express';
import type { IAuthenticatedRequest } from '@presentation/controllers/auth.controller.js';
import { AppError } from '@utils/AppError.js';
import { UserRole } from '@domain/value-objects/UserRole.js';

/**
 * Middleware to require admin role
 *
 * Throws 403 if user is not an admin.
 * Must be used after requireAuth.
 *
 * @param req - Express request with authenticated user
 * @param _res - Express response (unused)
 * @param next - Express next function
 * @throws {AppError} 403 if user is not admin
 *
 * @example
 * ```typescript
 * router.delete('/users/:id', requireAuth, requireAdmin, userController.delete);
 * ```
 */
export function requireAdmin(req: IAuthenticatedRequest, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Admin access required', 403, {
      userId: req.user.id,
      requiredRole: UserRole.ADMIN,
      actualRole: req.user.role,
    });
  }

  next();
}

/**
 * Middleware factory to require resource ownership
 *
 * Checks if authenticated user owns the resource.
 * Resource ID is extracted from req.params[paramName].
 *
 * @param paramName - Name of the route parameter containing resource owner ID
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * // Route: PATCH /tasks/:id
 * // Checks if task.creatorId === req.user.id
 * router.patch('/tasks/:id',
 *   requireAuth,
 *   requireOwnership('creatorId'),
 *   taskController.update
 * );
 * ```
 */
export function requireOwnership(paramName = 'userId') {
  return (req: IAuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const resourceOwnerId = req.params[paramName] || req.body[paramName];

    if (!resourceOwnerId) {
      throw new AppError(`Resource owner ID not found in ${paramName}`, 400);
    }

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Check ownership
    if (req.user.id !== resourceOwnerId) {
      throw new AppError('Access denied: you do not own this resource', 403, {
        userId: req.user.id,
        resourceOwnerId,
      });
    }

    next();
  };
}

/**
 * Middleware to require either admin role or resource ownership
 *
 * Allows access if user is admin OR owns the resource.
 *
 * @param paramName - Name of the route parameter containing resource owner ID
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * router.patch('/users/:id',
 *   requireAuth,
 *   requireAdminOrOwner('id'),
 *   userController.update
 * );
 * ```
 */
export function requireAdminOrOwner(paramName = 'userId') {
  return (req: IAuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Admin has full access
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Check ownership
    const resourceOwnerId = req.params[paramName] || req.body[paramName];

    if (!resourceOwnerId) {
      throw new AppError(`Resource owner ID not found in ${paramName}`, 400);
    }

    if (req.user.id !== resourceOwnerId) {
      throw new AppError('Access denied: admin role or resource ownership required', 403, {
        userId: req.user.id,
        resourceOwnerId,
      });
    }

    next();
  };
}
