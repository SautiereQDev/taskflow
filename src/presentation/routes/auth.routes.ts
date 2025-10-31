/**
 * Authentication Routes
 *
 * Routes for user authentication (login, register, logout).
 *
 * @module presentation/routes/auth.routes
 */

import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '@presentation/controllers/auth.controller.js';
import { loginValidation, registerValidation } from '@presentation/validation/auth.validation.js';
import { handleValidationErrors } from '@presentation/utils/validation.helpers.js';
import { authLimiter } from '@presentation/middleware/rate-limit.middleware.js';

const router = Router();
const authController = container.resolve(AuthController);

/**
 * GET /auth/login - Render login page
 */
router.get('/login', authController.loginPage.bind(authController));

/**
 * POST /auth/login - Authenticate user
 * Rate limited: 5 attempts per 15 minutes
 */
router.post(
  '/login',
  authLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login.bind(authController)
);

/**
 * GET /auth/register - Render registration page
 */
router.get('/register', authController.registerPage.bind(authController));

/**
 * POST /auth/register - Register new user
 * Rate limited: 5 attempts per 15 minutes
 */
router.post(
  '/register',
  authLimiter,
  registerValidation,
  handleValidationErrors,
  authController.register.bind(authController)
);

/**
 * POST /auth/logout - Logout current user
 */
router.post('/logout', authController.logout.bind(authController));

export default router;
