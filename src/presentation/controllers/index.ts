/**
 * Presentation Controllers - Centralized exports
 *
 * @module presentation/controllers
 */

export { AuthController } from './auth.controller.js';
export { DashboardController } from './dashboard.controller.js';
export { TaskController } from './task.controller.js';
export { UserController } from './user.controller.js';

// Re-export shared types
export type { IAuthenticatedRequest } from './auth.controller.js';
