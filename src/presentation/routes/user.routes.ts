/**
 * User Routes
 *
 * Routes for user profile and settings operations.
 *
 * @module presentation/routes/user.routes
 */

import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '@presentation/controllers/user.controller.js';
import { requireAuth } from '@presentation/middleware/authentication.middleware.js';
import {
  updateProfileValidation,
  updateSettingsValidation,
} from '@presentation/validation/user.validation.js';
import { handleValidationErrors } from '@presentation/utils/validation.helpers.js';
import { apiLimiter } from '@presentation/middleware/rate-limit.middleware.js';

const router = Router();
const userController = container.resolve(UserController);

// All user routes require authentication
router.use(requireAuth);

/**
 * GET /profile - View user profile
 */
router.get('/profile', userController.profile.bind(userController));

/**
 * GET /profile/edit - Render profile edit form
 */
router.get('/profile/edit', userController.updateProfilePage.bind(userController));

/**
 * PATCH /profile - Update user profile
 * Rate limited: 50 requests per 15 minutes
 */
router.patch(
  '/profile',
  apiLimiter,
  updateProfileValidation,
  handleValidationErrors,
  userController.updateProfile.bind(userController)
);

/**
 * GET /settings - View user settings
 */
router.get('/settings', userController.settings.bind(userController));

/**
 * PATCH /settings - Update user settings (theme, locale)
 * Rate limited: 50 requests per 15 minutes
 */
router.patch(
  '/settings',
  apiLimiter,
  updateSettingsValidation,
  handleValidationErrors,
  userController.updateSettings.bind(userController)
);

export default router;
