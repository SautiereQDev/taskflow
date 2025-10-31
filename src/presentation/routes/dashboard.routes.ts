/**
 * Dashboard Routes
 *
 * Routes for dashboard views and statistics.
 *
 * @module presentation/routes/dashboard.routes
 */

import { Router } from 'express';
import { container } from 'tsyringe';
import { DashboardController } from '@presentation/controllers/dashboard.controller.js';
import { requireAuth } from '@presentation/middleware/authentication.middleware.js';

const router = Router();
const dashboardController = container.resolve(DashboardController);

// All dashboard routes require authentication
router.use(requireAuth);

/**
 * GET /dashboard - Main dashboard with statistics
 */
router.get('/', dashboardController.index.bind(dashboardController));

export default router;
