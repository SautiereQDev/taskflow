/**
 * Authentication Validation Schemas
 *
 * @module presentation/validation/auth.validation
 */

import { body } from 'express-validator';
import {
  emailValidation,
  passwordValidation,
  nameValidation,
} from '../utils/validation.helpers.js';

/**
 * Validation rules for user login
 * Validates email format and password presence
 */
export const loginValidation = [...emailValidation, ...passwordValidation];

/**
 * Validation rules for user registration
 * Validates name, email, password, and password confirmation
 */
export const registerValidation = [
  ...nameValidation,
  ...emailValidation,
  ...passwordValidation,
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];
