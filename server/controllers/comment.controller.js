import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';
import { userCanAccessTask } from '../services/taskAccess.service.js';
import { logActivity } from '../services/activity.service.js';

export const listComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  if (!(await userCanAccessTask(req.user, task))) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const comments = await Comment.find({ task: task._id })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  if (!(await userCanAccessTask(req.user, task))) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const comment = await Comment.create({
    task: task._id,
    user: req.user._id,
    body: req.body.body,
  });

  await logActivity({
    userId: req.user._id,
    action: 'COMMENT_ADDED',
    entityType: 'Task',
    entityId: task._id,
    metadata: { commentId: String(comment._id) },
  });

  const populated = await Comment.findById(comment._id).populate('user', 'name email role');

  res.status(201).json({ success: true, data: populated });
});

export const updateComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  if (!(await userCanAccessTask(req.user, task))) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const comment = await Comment.findOne({
    _id: req.params.commentId,
    task: task._id,
  });
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  const isAuthor = comment.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'You cannot edit this comment' });
  }

  comment.body = req.body.body;
  await comment.save();

  await logActivity({
    userId: req.user._id,
    action: 'COMMENT_UPDATED',
    entityType: 'Task',
    entityId: task._id,
    metadata: { commentId: String(comment._id) },
  });

  const populated = await Comment.findById(comment._id).populate('user', 'name email role');
  res.json({ success: true, data: populated });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  if (!(await userCanAccessTask(req.user, task))) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const comment = await Comment.findOne({
    _id: req.params.commentId,
    task: task._id,
  });
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  const isAuthor = comment.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'You cannot delete this comment' });
  }

  await Comment.deleteOne({ _id: comment._id });

  await logActivity({
    userId: req.user._id,
    action: 'COMMENT_DELETED',
    entityType: 'Task',
    entityId: task._id,
    metadata: { commentId: String(comment._id) },
  });

  res.json({ success: true, message: 'Comment deleted' });
});
