import { body, param, query } from 'express-validator';
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants.js';

export const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('priority').optional().isIn(TASK_PRIORITIES),
  body('status').optional().isIn(TASK_STATUSES),
  body('dueDate').optional().isISO8601().toDate(),
  body('assignedTo').optional().isMongoId(),
  body('project').isMongoId().withMessage('Valid project id is required'),
];

export const updateTaskRules = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('priority').optional().isIn(TASK_PRIORITIES),
  body('status').optional().isIn(TASK_STATUSES),
  body('dueDate').optional().isISO8601().toDate(),
  body('assignedTo').optional().isMongoId(),
  body('project').optional().isMongoId(),
];

export const taskIdParam = [param('id').isMongoId().withMessage('Invalid task id')];

export const listTasksQueryRules = [
  query('project').optional().isMongoId(),
  query('status').optional().isIn(['Todo', 'In Progress', 'Completed', 'Overdue']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const commentBodyRules = [
  param('taskId').isMongoId().withMessage('Invalid task id'),
  body('body').trim().notEmpty().isLength({ max: 2000 }).withMessage('Comment is required'),
];
