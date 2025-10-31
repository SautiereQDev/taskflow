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
  body('assigneeId').optional().isUUID().withMessage('Assignee ID must be a valid UUID'),
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
  body('assigneeId').optional().isUUID().withMessage('Assignee ID must be a valid UUID'),
];

/**
 * Validation rules for task list filters
 * All query parameters optional
 */
export const taskFiltersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
    .withMessage('Invalid status'),
  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),
  query('assigneeId').optional().isUUID().withMessage('Assignee ID must be a valid UUID'),
  query('creatorId').optional().isUUID().withMessage('Creator ID must be a valid UUID'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
];
