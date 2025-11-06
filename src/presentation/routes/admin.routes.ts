import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminController } from '@presentation/controllers/admin.controller.js';
import { requireAuth } from '@presentation/middleware/authentication.middleware.js';
import { requireRole } from '@presentation/middleware/authorization.middleware.js';
import { UserRole } from '@domain/entities/User.js';

const router = Router();
const adminController = container.resolve(AdminController);

// All admin routes require authentication and ADMIN or MANAGER role
router.use(requireAuth, requireRole([UserRole.ADMIN, UserRole.MANAGER]));

/**
 * GET /users - List all users
 */
router.get('/', adminController.listUsers.bind(adminController));

export default router;
