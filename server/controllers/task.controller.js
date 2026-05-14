import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';
import { logActivity } from '../services/activity.service.js';
import { syncOverdueTasks } from '../services/task.service.js';

export const listTasks = asyncHandler(async (req, res) => {
  await syncOverdueTasks();

  const { project: projectId, status, search } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.user.role !== ROLES.ADMIN) {
    filter.assignedTo = req.user._id;
  }

  if (projectId) {
    filter.project = projectId;
  }
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title status')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    priority,
    status,
    dueDate,
    assignedTo,
    project: projectId,
  } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(400).json({ success: false, message: 'Project not found' });
  }

  const task = await Task.create({
    title,
    description: description ?? '',
    priority: priority ?? 'Medium',
    status: status ?? 'Todo',
    dueDate: dueDate || undefined,
    assignedTo: assignedTo || null,
    project: projectId,
    createdBy: req.user._id,
  });

  await logActivity({
    userId: req.user._id,
    action: 'TASK_CREATED',
    entityType: 'Task',
    entityId: task._id,
    metadata: { title: task.title, projectId: String(projectId) },
  });

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title status')
    .populate('createdBy', 'name email');

  res.status(201).json({ success: true, data: populated });
});

export const updateTask = asyncHandler(async (req, res) => {
  await syncOverdueTasks();

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (req.user.role === ROLES.ADMIN) {
    const { title, description, priority, status, dueDate, assignedTo, project } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (project !== undefined) {
      const p = await Project.findById(project);
      if (!p) {
        return res.status(400).json({ success: false, message: 'Project not found' });
      }
      task.project = project;
    }
    await task.save();

    await logActivity({
      userId: req.user._id,
      action: 'TASK_UPDATED',
      entityType: 'Task',
      entityId: task._id,
      metadata: { title: task.title },
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title status')
      .populate('createdBy', 'name email');

    return res.json({ success: true, data: populated });
  }

  const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
  if (!isAssignee) {
    return res.status(403).json({
      success: false,
      message: 'Only the assignee can update this task',
    });
  }

  if (req.body.status === undefined) {
    return res.status(403).json({
      success: false,
      message: 'Members may only update task status',
    });
  }

  const allowedKeys = ['status'];
  const extra = Object.keys(req.body).filter((k) => req.body[k] !== undefined && !allowedKeys.includes(k));
  if (extra.length) {
    return res.status(403).json({
      success: false,
      message: 'Members may only update task status',
    });
  }

  task.status = req.body.status;
  await task.save();

  await logActivity({
    userId: req.user._id,
    action: 'TASK_STATUS_UPDATED',
    entityType: 'Task',
    entityId: task._id,
    metadata: { status: task.status },
  });

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title status')
    .populate('createdBy', 'name email');

  res.json({ success: true, data: populated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  await Comment.deleteMany({ task: task._id });
  await Task.findByIdAndDelete(req.params.id);

  await logActivity({
    userId: req.user._id,
    action: 'TASK_DELETED',
    entityType: 'Task',
    entityId: task._id,
    metadata: { title: task.title },
  });

  res.json({ success: true, message: 'Task deleted' });
});
