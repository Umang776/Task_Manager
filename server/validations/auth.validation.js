import { body } from 'express-validator';
import { adminWorkspaceEmailMessage, isAllowedEmail } from '../utils/allowedEmail.js';

const ACCOUNT_TYPES = ['admin', 'member'];

function emailForAccountType(accountTypeField = 'accountType') {
  return body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
    .custom((value, { req }) => {
      const kind = req.body[accountTypeField];
      if (kind === 'admin' && !isAllowedEmail(value)) {
        throw new Error(adminWorkspaceEmailMessage());
      }
      return true;
    });
}

export const signupRules = [
  body('accountType').isIn(ACCOUNT_TYPES).withMessage('Choose Admin or Member signup'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  emailForAccountType(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
  body('accountType').isIn(ACCOUNT_TYPES).withMessage('Choose Admin or Member sign-in'),
  emailForAccountType(),
  body('password').notEmpty().withMessage('Password is required'),
];
