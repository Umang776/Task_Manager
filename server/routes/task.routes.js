import { Router } from 'express';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { listComments, createComment } from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import {
  createTaskRules,
  updateTaskRules,
  taskIdParam,
  listTasksQueryRules,
  commentBodyRules,
} from '../validations/task.validation.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', listTasksQueryRules, validate, listTasks);
router.post('/', requireAdmin, createTaskRules, validate, createTask);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', requireAdmin, taskIdParam, validate, deleteTask);

const taskIdComments = [
  param('taskId').isMongoId().withMessage('Invalid task id'),
];

router.get('/:taskId/comments', taskIdComments, validate, listComments);
router.post(
  '/:taskId/comments',
  commentBodyRules,
  validate,
  createComment
);

export default router;
