/**
 * Task Validation Schemas
 *
 * Zod schemas for task-related operations (create, update, query).
 * These schemas provide both runtime validation and TypeScript type inference.
 *
 * @module shared-types/validation/task
 */

import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

/**
 * Schema for task creation input validation
 *
 * Validates:
 * - Title: 3-200 characters
 * - Description: Optional, max 2000 characters
 * - Status: Enum, defaults to TODO
 * - Priority: Enum, defaults to MEDIUM
 * - CreatorId: CUID format
 * - AssigneeId: Optional CUID format
 * - DueDate: Optional ISO date
 *
 * @example
 * ```typescript
 * const input = CreateTaskSchema.parse({
 *   title: 'Implement feature X',
 *   creatorId: 'cljn8z4zw0000',
 *   priority: TaskPriority.HIGH
 * });
 * ```
 */
export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable()
    .default(null),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  creatorId: z.string().cuid('Invalid creator ID').trim(),
  assigneeId: z.string().cuid('Invalid assignee ID').trim().optional().nullable().default(null),
  dueDate: z.coerce.date().optional().nullable().default(null),
});

/**
 * TypeScript type inferred from CreateTaskSchema
 *
 * Use this type for function parameters and return values.
 */
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

/**
 * Schema for task update input validation
 *
 * All fields are optional (partial update support).
 * Same validation rules as CreateTaskSchema for provided fields.
 *
 * @example
 * ```typescript
 * const update = UpdateTaskSchema.parse({
 *   status: TaskStatus.DONE,
 *   assigneeId: 'cljn8z4zw0001'
 * });
 * ```
 */
export const UpdateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().cuid('Invalid assignee ID').trim().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

/**
 * TypeScript type inferred from UpdateTaskSchema
 */
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

/**
 * Schema for task query/filter parameters
 *
 * Used for list/search operations with pagination and filtering.
 *
 * @example
 * ```typescript
 * const query = TaskQuerySchema.parse({
 *   status: ['TODO', 'IN_PROGRESS'],
 *   priority: 'HIGH',
 *   assigneeId: 'cljn8z4zw0001',
 *   page: 1,
 *   limit: 10
 * });
 * ```
 */
export const TaskQuerySchema = z.object({
  status: z.union([z.nativeEnum(TaskStatus), z.array(z.nativeEnum(TaskStatus))]).optional(),
  priority: z.union([z.nativeEnum(TaskPriority), z.array(z.nativeEnum(TaskPriority))]).optional(),
  assigneeId: z.string().cuid().optional(),
  creatorId: z.string().cuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * TypeScript type inferred from TaskQuerySchema
 */
export type TaskQueryInput = z.infer<typeof TaskQuerySchema>;
