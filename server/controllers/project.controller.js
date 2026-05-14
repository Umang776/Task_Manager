import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';
import { logActivity } from '../services/activity.service.js';

function memberProjectFilter(userId) {
  return {
    $or: [{ members: userId }, { createdBy: userId }],
  };
}

export const listProjects = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === ROLES.ADMIN
      ? {}
      : memberProjectFilter(req.user._id);

  const projects = await Project.find(filter)
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const { title, description, status, members = [] } = req.body;

  const uniqueMembers = [...new Set(members.map(String))].filter(
    (id) => mongoose.Types.ObjectId.isValid(id)
  );

  const project = await Project.create({
    title,
    description: description ?? '',
    status: status ?? 'Active',
    members: uniqueMembers,
    createdBy: req.user._id,
  });

  await logActivity({
    userId: req.user._id,
    action: 'PROJECT_CREATED',
    entityType: 'Project',
    entityId: project._id,
    metadata: { title: project.title },
  });

  const populated = await Project.findById(project._id)
    .populate('members', 'name email')
    .populate('createdBy', 'name email');

  res.status(201).json({ success: true, data: populated });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email')
    .populate('createdBy', 'name email');

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (req.user.role !== ROLES.ADMIN) {
    const uid = req.user._id.toString();
    const isMember =
      project.members.some((m) => m._id.toString() === uid) ||
      project.createdBy._id.toString() === uid;
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  res.json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const { title, description, status, members } = req.body;
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (members !== undefined) {
    project.members = [...new Set(members.map(String))].filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
  }

  await project.save();

  await logActivity({
    userId: req.user._id,
    action: 'PROJECT_UPDATED',
    entityType: 'Project',
    entityId: project._id,
    metadata: { title: project.title },
  });

  const populated = await Project.findById(project._id)
    .populate('members', 'name email')
    .populate('createdBy', 'name email');

  res.json({ success: true, data: populated });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const tasks = await Task.find({ project: project._id }).select('_id');
  const taskIds = tasks.map((t) => t._id);
  if (taskIds.length) {
    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
  }
  await Project.findByIdAndDelete(project._id);

  await logActivity({
    userId: req.user._id,
    action: 'PROJECT_DELETED',
    entityType: 'Project',
    entityId: project._id,
    metadata: { title: project.title },
  });

  res.json({ success: true, message: 'Project deleted' });
});
