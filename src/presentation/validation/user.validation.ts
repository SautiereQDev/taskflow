/**
 * User Validation Schemas
 *
 * @module presentation/validation/user.validation
 */

import { body } from 'express-validator';

/**
 * Validation rules for updating user profile
 * All fields optional (partial update)
 */
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

/**
 * Validation rules for updating user settings
 * Theme and locale with predefined values
 */
export const updateSettingsValidation = [
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be either light or dark'),
  body('locale').optional().isIn(['fr', 'en']).withMessage('Locale must be either fr or en'),
];
