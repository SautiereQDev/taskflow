/**
 * Task Routes
 *
 * Routes for task operations (CRUD, filters, pagination).
 *
 * @module presentation/routes/task.routes
 */

import { Router } from 'express';
import { container } from 'tsyringe';
import { TaskController } from '@presentation/controllers/task.controller.js';
import { requireAuth } from '@presentation/middleware/authentication.middleware.js';
import {
  createTaskValidation,
  updateTaskValidation,
  taskFiltersValidation,
} from '@presentation/validation/task.validation.js';
import { handleValidationErrors } from '@presentation/utils/validation.helpers.js';
import { apiLimiter } from '@presentation/middleware/rate-limit.middleware.js';

const router = Router();
const taskController = container.resolve(TaskController);

// All task routes require authentication
router.use(requireAuth);

/**
 * GET /tasks - List all tasks with filters and pagination
 */
router.get(
  '/',
  taskFiltersValidation,
  handleValidationErrors,
  taskController.list.bind(taskController)
);

/**
 * GET /tasks/new - Render task creation form
 */
router.get('/new', taskController.createPage.bind(taskController));

/**
 * POST /tasks - Create new task
 * Rate limited: 50 requests per 15 minutes
 */
router.post(
  '/',
  apiLimiter,
  createTaskValidation,
  handleValidationErrors,
  taskController.create.bind(taskController)
);

/**
 * GET /tasks/:id/edit - Render task edit form
 * IMPORTANT: Must be before /:id to prevent Express from matching /:id with id="123/edit"
 */
router.get('/:id/edit', taskController.updatePage.bind(taskController));

/**
 * GET /tasks/:id - Get task details
 */
router.get('/:id', taskController.detail.bind(taskController));

/**
 * PATCH /tasks/:id - Update task
 * Rate limited: 50 requests per 15 minutes
 */
router.patch(
  '/:id',
  apiLimiter,
  updateTaskValidation,
  handleValidationErrors,
  taskController.update.bind(taskController)
);

/**
 * DELETE /tasks/:id - Delete task
 * Rate limited: 50 requests per 15 minutes
 */
router.delete('/:id', apiLimiter, taskController.delete.bind(taskController));

/**
 * POST /tasks/:id/complete - Toggle task completion status
 * HTMX endpoint for quick status toggle (DONE <-> IN_PROGRESS)
 */
router.post('/:id/complete', taskController.toggleComplete.bind(taskController));

/**
 * PATCH /tasks/:id/status - Update task status
 * HTMX endpoint for status dropdown changes
 */
router.patch('/:id/status', taskController.updateStatus.bind(taskController));

export default router;
