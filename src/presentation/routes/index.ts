/**
 * Routes Index
 *
 * Central router that mounts all route modules.
 *
 * @module presentation/routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import authRoutes from './auth.routes.js';
import taskRoutes from './task.routes.js';
import userRoutes from './user.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

/**
 * Home page (public)
 */
router.get('/', (req: Request, res: Response) => {
  res.render('pages/home', {
    title: 'TaskFlow - Modern Task Management',
    user: (req as { user?: unknown }).user,
    locale: req.session.locale ?? 'fr',
  });
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', userRoutes); // Profile and settings at root level

/**
 * Health check endpoint (public)
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
