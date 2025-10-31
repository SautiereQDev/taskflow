/**
 * Validation Helpers - Express-validator middleware and common chains
 *
 * @module presentation/utils/validation.helpers
 */

import type { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { AppError } from '../../utils/AppError.js';

/**
 * Middleware to handle validation errors
 * Throws AppError with 400 status and validation errors as context
 *
 * @param req - Express request with validation results
 * @param _res - Express response (unused)
 * @param next - Express next function
 * @throws {AppError} 400 if validation errors exist
 *
 * @example
 * ```typescript
 * router.post('/login',
 *   loginValidation,
 *   handleValidationErrors,
 *   authController.login
 * );
 * ```
 */
export function handleValidationErrors(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((error) => ({
      field: 'field' in error ? error.field : 'unknown',
      message: String(error.msg),
    }));

    throw new AppError('Validation failed', 400, {
      errors: errorDetails,
    });
  }

  next();
}

/**
 * Common validation chains for email
 * Checks for valid format and normalizes to lowercase
 */
export const emailValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

/**
 * Common validation chains for password
 * Requires minimum 8 characters with at least one letter and one number
 */
export const passwordValidation = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

/**
 * Common validation chains for task title
 * Requires 3-200 characters
 */
export const titleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
];

/**
 * Common validation chains for task description
 * Optional, max 2000 characters
 */
export const descriptionValidation = [
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
];

/**
 * Common validation chains for task status
 * Must be one of: TO DO, IN_PROGRESS, DONE, CANCELLED
 */
export const statusValidation = [
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
    .withMessage('Status must be TODO, IN_PROGRESS, DONE, or CANCELLED'),
];

/**
 * Common validation chains for task priority
 * Must be one of: LOW, MEDIUM, HIGH, URGENT
 */
export const priorityValidation = [
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or URGENT'),
];

/**
 * Common validation chains for due date
 * Must be a valid ISO8601 date
 */
export const dueDateValidation = [
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO8601 date'),
];

/**
 * Common validation chains for user name
 * Requires 2-50 characters
 */
export const nameValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
];
