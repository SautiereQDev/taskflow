/**
 * Shared Types Package
 *
 * Central export point for all shared types used across the application.
 * These types can be used in:
 * - Backend controllers (res.render typing)
 * - Frontend TypeScript code (Phase 5)
 * - Testing (mock data generation)
 * - API contracts (if needed)
 *
 * @module shared-types
 */

// ========================================
// View Models - Presentation Layer Types
// ========================================

/**
 * Re-export all task-related view models
 * @see {@link src/presentation/view-models/task.view-model.ts}
 */
export type { ITaskViewModel } from '../presentation/view-models/task.view-model.js';
export { TaskViewModel } from '../presentation/view-models/task.view-model.js';

/**
 * Re-export task list and detail view models
 * @see {@link src/presentation/view-models/task.presenter.ts}
 */
export type {
  ITaskListItemViewModel,
  ITaskDetailViewModel,
  ICurrentUserContext,
} from '../presentation/view-models/task.presenter.js';
export {
  toTaskListItemViewModel,
  toTaskDetailViewModel,
} from '../presentation/view-models/task.presenter.js';

/**
 * Re-export user-related view models
 * @see {@link src/presentation/view-models/user.view-model.ts}
 */
export type { IUserViewModel } from '../presentation/view-models/user.view-model.js';
export { UserViewModel } from '../presentation/view-models/user.view-model.js';

/**
 * Re-export dashboard view models
 * @see {@link src/presentation/view-models/dashboard.view-model.ts}
 */
export type { IDashboardViewModel } from '../presentation/view-models/dashboard.view-model.js';
export { DashboardViewModel } from '../presentation/view-models/dashboard.view-model.js';

// ========================================
// Common Types - Shared Across Application
// ========================================

// Import types for use in interface definitions below
import type { IUserViewModel } from '../presentation/view-models/user.view-model.js';
import type { ITaskListItemViewModel } from '../presentation/view-models/task.presenter.js';
import type { IDashboardViewModel } from '../presentation/view-models/dashboard.view-model.js';

/**
 * Common pagination result type
 * Used in list views (tasks, users, etc.)
 */
export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Common filter options for list queries
 */
export interface IFilterOptions {
  search?: string;
  status?: string | string[];
  priority?: string | string[];
  assigneeId?: string;
  creatorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base view data passed to all EJS templates
 * Available via res.locals middleware
 */
export interface IBaseViewData {
  /** Current user (if authenticated) */
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    locale: string | null;
  };
  /** Page title */
  title?: string;
  /** Current locale (fr, en) */
  locale?: string;
  /** Current theme (light, dark) */
  theme?: string;
  /** CSRF token */
  csrfToken?: string;
  /** CSP nonce for inline scripts */
  cspNonce?: string;
  /** Flash messages */
  messages?: {
    success?: string[];
    error?: string[];
    info?: string[];
  };
  /** Translation function */
  __?: (key: string, ...args: unknown[]) => string;
}

/**
 * Settings page view model
 */
export interface ISettingsViewModel extends IBaseViewData {
  title: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    locale: string | null;
  };
  theme: string;
  locale: string;
  errors?: Record<string, string>;
}

/**
 * Auth pages (login, register) view model
 */
export interface IAuthViewModel extends IBaseViewData {
  title: string;
  errors?: {
    general?: string;
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  };
  values?: {
    email?: string;
    name?: string;
    rememberMe?: boolean;
  };
}

/**
 * Profile page view model
 */
export interface IProfileViewModel extends IBaseViewData {
  title: string;
  profile: IUserViewModel;
  tasks: ITaskListItemViewModel[];
  canEdit: boolean;
}

/**
 * Error page view model (404, 403, 500)
 */
export interface IErrorViewModel extends IBaseViewData {
  title: string;
  statusCode: number;
  message: string;
  error?: Error;
  stack?: string;
}

/**
 * Task detail page view model
 */
export interface ITaskDetailPageViewModel extends IBaseViewData {
  title: string;
  task: ITaskListItemViewModel;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Task list page view model
 */
export interface ITaskListPageViewModel extends IBaseViewData {
  title: string;
  tasks: ITaskListItemViewModel[];
  pagination: IPaginatedResult<ITaskListItemViewModel>;
  filters: IFilterOptions;
}

/**
 * Dashboard page view model
 */
export interface IDashboardPageViewModel extends IBaseViewData {
  title: string;
  dashboard: IDashboardViewModel;
}

/**
 * Diagnostic page view model
 */
export interface IDiagnosticViewModel extends IBaseViewData {
  title: string;
  environment: string;
  timestamp?: string;
  checks?: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    details?: Record<string, unknown>;
  }[];
  database: {
    status: 'connected' | 'disconnected';
    message?: string;
  };
  server: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    version: string;
  };
}

/**
 * Static pages view model (About, FAQ, Contact, etc.)
 */
export interface IStaticPageViewModel extends IBaseViewData {
  title: string;
  content?: string;
}
