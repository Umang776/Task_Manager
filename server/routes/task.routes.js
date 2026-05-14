import { Router } from 'express';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import {
  listComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import {
  createTaskRules,
  updateTaskRules,
  taskIdParam,
  listTasksQueryRules,
  commentBodyRules,
  updateCommentRules,
  commentTaskAndCommentIdParams,
} from '../validations/task.validation.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

const taskIdComments = [param('taskId').isMongoId().withMessage('Invalid task id')];

router.get('/', listTasksQueryRules, validate, listTasks);
router.post('/', requireAdmin, createTaskRules, validate, createTask);

router.get('/:taskId/comments', taskIdComments, validate, listComments);
router.post('/:taskId/comments', commentBodyRules, validate, createComment);
router.patch('/:taskId/comments/:commentId', updateCommentRules, validate, updateComment);
router.delete(
  '/:taskId/comments/:commentId',
  commentTaskAndCommentIdParams,
  validate,
  deleteComment
);

router.get('/:id', taskIdParam, validate, getTask);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', requireAdmin, taskIdParam, validate, deleteTask);

export default router;
