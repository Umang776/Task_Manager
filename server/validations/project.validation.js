import { body, param } from 'express-validator';
import { PROJECT_STATUSES } from '../utils/constants.js';

export const createProjectRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('status').optional().isIn(PROJECT_STATUSES),
  body('members').optional().isArray(),
];

export const updateProjectRules = [
  param('id').isMongoId().withMessage('Invalid project id'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('status').optional().isIn(PROJECT_STATUSES),
  body('members').optional().isArray(),
];

export const projectIdParam = [param('id').isMongoId().withMessage('Invalid project id')];
