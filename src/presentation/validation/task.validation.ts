/**
 * Task Validation Schemas
 *
 * @module presentation/validation/task.validation
 */

import { body, query } from 'express-validator';
import {
  titleValidation,
  descriptionValidation,
  statusValidation,
  priorityValidation,
  dueDateValidation,
} from '../utils/validation.helpers.js';

/**
 * Validation rules for creating a task
 * Title is required, other fields optional
 */
export const createTaskValidation = [
  ...titleValidation,
  ...descriptionValidation,
  ...statusValidation,
  ...priorityValidation,
  ...dueDateValidation,
  body('assigneeId')
    .optional()
    .custom(
      (value: unknown) => !value || (typeof value === 'string' && /^c[a-z0-9]{24}$/i.test(value))
    )
    .withMessage('Assignee ID must be a valid CUID'),
];

/**
 * Validation rules for updating a task
 * All fields optional (partial update)
 */
export const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  ...descriptionValidation,
  ...statusValidation,
  ...priorityValidation,
  ...dueDateValidation,
  body('assigneeId')
    .optional()
    .custom(
      (value: unknown) => !value || (typeof value === 'string' && /^c[a-z0-9]{24}$/i.test(value))
    )
    .withMessage('Assignee ID must be a valid CUID'),
];

/**
 * Validation rules for task list filters
 * All query parameters optional
 * Empty strings are converted to undefined to allow filters without values
 */
export const taskFiltersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .customSanitizer((value: unknown) => (value === '' ? undefined : value))
    .custom((value: unknown) => {
      if (!value) return true; // Empty is valid
      if (Array.isArray(value)) {
        return value.every(
          (v) => typeof v === 'string' && ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(v)
        );
      }
      return (
        typeof value === 'string' && ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(value)
      );
    })
    .withMessage('Invalid status value(s)'),
  query('priority')
    .optional()
    .customSanitizer((value: unknown) => (value === '' ? undefined : value))
    .custom((value: unknown) => {
      if (!value) return true; // Empty is valid
      if (Array.isArray(value)) {
        return value.every(
          (v) => typeof v === 'string' && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(v)
        );
      }
      return typeof value === 'string' && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(value);
    })
    .withMessage('Invalid priority value(s)'),
  query('assigneeId')
    .optional()
    .customSanitizer((value: unknown) => (value === '' ? undefined : value))
    .custom(
      (value: unknown) => !value || (typeof value === 'string' && /^c[a-z0-9]{24}$/i.test(value))
    )
    .withMessage('Assignee ID must be a valid CUID'),
  query('creatorId')
    .optional()
    .customSanitizer((value: unknown) => (value === '' ? undefined : value))
    .custom(
      (value: unknown) => !value || (typeof value === 'string' && /^c[a-z0-9]{24}$/i.test(value))
    )
    .withMessage('Creator ID must be a valid CUID'),
  query('search')
    .optional()
    .customSanitizer((value: unknown) => {
      if (value === '' || !value) return undefined;
      return typeof value === 'string' ? value.trim() : value;
    })
    .custom(
      (value: unknown) =>
        !value || (typeof value === 'string' && value.length >= 1 && value.length <= 200)
    )
    .withMessage('Search query must be between 1 and 200 characters'),
  query('dueDateFilter')
    .optional()
    .customSanitizer((value: unknown) => (value === '' ? undefined : value)),
];
