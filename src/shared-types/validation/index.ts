/**
 * Validation Schemas Index
 *
 * Central export point for all Zod validation schemas.
 * These schemas provide runtime validation and TypeScript type inference.
 *
 * Usage:
 * ```typescript
 * // Import schemas
 * import { CreateTaskSchema, type CreateTaskInput } from '@shared-types/validation';
 *
 * // Runtime validation
 * const validated = CreateTaskSchema.parse(untrustedData);
 *
 * // Type inference
 * function createTask(input: CreateTaskInput) { ... }
 * ```
 *
 * @module shared-types/validation
 */

// ==========================================
// Task Schemas
// ==========================================
export {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskQuerySchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskQueryInput,
} from './task.schemas.js';

// ==========================================
// User Schemas
// ==========================================
export {
  RegisterUserSchema,
  LoginUserSchema,
  UpdateProfileSchema,
  AdminUpdateUserSchema,
  UserQuerySchema,
  type RegisterUserInput,
  type LoginUserInput,
  type UpdateProfileInput,
  type AdminUpdateUserInput,
  type UserQueryInput,
} from './user.schemas.js';
