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
import adminRoutes from './admin.routes.js';
import pagesRoutes from './pages.routes.js';
import { DiagnosticController } from '../controllers/DiagnosticController.js';
import { attachUser } from '../middleware/authentication.middleware.js';

const router = Router();
const diagnosticController = new DiagnosticController();

/**
 * Home page - redirects authenticated users to dashboard, shows landing page for guests
 */
router.get('/', attachUser, (req: Request, res: Response) => {
  // If user is authenticated, redirect to dashboard
  if ((req as { user?: unknown }).user) {
    res.redirect('/dashboard');
    return;
  }

  // Show landing page for unauthenticated users
  res.render('pages/home', {
    title: 'TaskFlow - Modern Task Management',
    user: undefined,
    locale: req.session.locale ?? 'fr',
  });
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', adminRoutes);
router.use('/', userRoutes); // Profile and settings at root level
router.use('/', pagesRoutes); // Static pages

/**
 * Health check endpoint (public)
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Diagnostic endpoint (development only)
 */
if (process.env.NODE_ENV === 'development') {
  router.get('/diagnostic', (req: Request, res: Response) => {
    void diagnosticController.getDiagnosticPage(req, res);
  });

  router.get('/diagnostic/json', (req: Request, res: Response) => {
    void diagnosticController.getDiagnosticJson(req, res);
  });
}

export default router;
