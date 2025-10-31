/**
 * ViewModels - Data Transfer Objects for Presentation Layer
 *
 * ViewModels transform raw domain entities into display-friendly formats.
 * They encapsulate formatting logic, localization, and presentation concerns.
 *
 * Architecture:
 * - Domain Entity (Prisma) → ViewModel → EJS Template
 * - ViewModels are stateless transformation utilities
 * - No business logic, only formatting and data shaping
 *
 * Usage:
 * ```typescript
 * // In controller
 * const task = await taskService.getTaskById(id);
 * const taskVM = TaskViewModel.fromEntity(task);
 * res.render('pages/tasks/detail', { task: taskVM });
 * ```
 */

export { TaskViewModel, type ITaskViewModel } from './task.view-model.js';
export { UserViewModel, type IUserViewModel } from './user.view-model.js';
export { DashboardViewModel, type IDashboardViewModel } from './dashboard.view-model.js';
