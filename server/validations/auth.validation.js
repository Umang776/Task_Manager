import { body } from 'express-validator';
import { allowedEmailMessage, isAllowedEmail } from '../utils/allowedEmail.js';

const etharaEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email is required')
  .custom((value) => {
    if (!isAllowedEmail(value)) {
      throw new Error(allowedEmailMessage());
    }
    return true;
  });

export const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  etharaEmail,
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
  etharaEmail,
  body('password').notEmpty().withMessage('Password is required'),
];
