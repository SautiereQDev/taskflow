/**
 * User Validation Schemas
 *
 * Zod schemas for user-related operations (registration, login, profile updates).
 * Includes password strength validation and email normalization.
 *
 * @module shared-types/validation/user
 */

import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Password regex for strength validation
 * Requires: 1 uppercase, 1 lowercase, 1 number
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

/**
 * Password validation error message
 */
const PASSWORD_ERROR =
  'Password must contain at least one uppercase letter, one lowercase letter, and one number';

/**
 * Schema for user registration input validation
 *
 * Validates:
 * - Email: Valid format, normalized to lowercase
 * - Password: 8+ characters with strength requirements
 * - Name: 2-100 characters
 * - Role: Enum, defaults to MEMBER
 * - Locale: 'en' or 'fr', defaults to 'fr'
 *
 * @example
 * ```typescript
 * const input = RegisterUserSchema.parse({
 *   email: 'john.doe@example.com',
 *   password: 'SecurePass123',
 *   name: 'John Doe'
 * });
 * ```
 */
export const RegisterUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(PASSWORD_REGEX, PASSWORD_ERROR),
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.MEMBER),
  locale: z.enum(['en', 'fr']).optional().default('fr'),
});

/**
 * TypeScript type inferred from RegisterUserSchema
 */
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

/**
 * Schema for user login input validation
 *
 * Validates:
 * - Email: Valid format, normalized to lowercase
 * - Password: Non-empty string (no strength check on login)
 *
 * @example
 * ```typescript
 * const credentials = LoginUserSchema.parse({
 *   email: 'john.doe@example.com',
 *   password: 'userProvidedPassword'
 * });
 * ```
 */
export const LoginUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

/**
 * TypeScript type inferred from LoginUserSchema
 */
export type LoginUserInput = z.infer<typeof LoginUserSchema>;

/**
 * Schema for profile update input validation
 *
 * All fields are optional (partial update support).
 * Includes password change with current password verification.
 *
 * @example
 * ```typescript
 * const update = UpdateProfileSchema.parse({
 *   name: 'Jane Doe',
 *   locale: 'en',
 *   currentPassword: 'OldPass123',
 *   newPassword: 'NewSecurePass456'
 * });
 * ```
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  locale: z.enum(['en', 'fr']).optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(PASSWORD_REGEX, PASSWORD_ERROR)
    .optional(),
});

/**
 * TypeScript type inferred from UpdateProfileSchema
 */
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * Schema for admin user update input validation
 *
 * Allows admins to update any user field (name, email, role, locale).
 * All fields are optional.
 *
 * @example
 * ```typescript
 * const adminUpdate = AdminUpdateUserSchema.parse({
 *   role: UserRole.MANAGER,
 *   email: 'new.email@example.com'
 * });
 * ```
 */
export const AdminUpdateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  locale: z.enum(['en', 'fr']).optional(),
});

/**
 * TypeScript type inferred from AdminUpdateUserSchema
 */
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserSchema>;

/**
 * Schema for user query/filter parameters
 *
 * Used for list/search operations with pagination.
 *
 * @example
 * ```typescript
 * const query = UserQuerySchema.parse({
 *   role: UserRole.ADMIN,
 *   search: 'john',
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export const UserQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['name', 'email', 'createdAt', 'role']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * TypeScript type inferred from UserQuerySchema
 */
export type UserQueryInput = z.infer<typeof UserQuerySchema>;
