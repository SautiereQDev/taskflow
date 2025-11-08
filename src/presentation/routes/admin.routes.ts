import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminController } from '@presentation/controllers/admin.controller.js';
import { requireAuth } from '@presentation/middleware/authentication.middleware.js';
import { requireRole } from '@presentation/middleware/authorization.middleware.js';
import { updateProfileValidation } from '@presentation/validation/user.validation.js';
import { handleValidationErrors } from '@presentation/utils/validation.helpers.js';
import { apiLimiter } from '@presentation/middleware/rate-limit.middleware.js';
import { UserRole } from '@domain/entities/User.js';

const router = Router();
const adminController = container.resolve(AdminController);

// All admin routes require authentication and ADMIN or MANAGER role
router.use(requireAuth, requireRole([UserRole.ADMIN, UserRole.MANAGER]));

/**
 * GET /users - List all users
 */
router.get('/', adminController.listUsers.bind(adminController));

/**
 * GET /users/:id/edit - Render user edit form
 * IMPORTANT: Must be before /:id to prevent Express from matching /:id with id="123/edit"
 */
router.get('/:id/edit', adminController.editUserPage.bind(adminController));

/**
 * PATCH /users/:id - Update user
 * Rate limited: 50 requests per 15 minutes
 */
router.patch(
  '/:id',
  apiLimiter,
  updateProfileValidation,
  handleValidationErrors,
  adminController.updateUser.bind(adminController)
);

/**
 * GET /users/:id - View user detail
 */
router.get('/:id', adminController.viewUser.bind(adminController));

export default router;
