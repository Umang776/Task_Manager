import ActivityLog from '../models/ActivityLog.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';
import { syncOverdueTasks } from '../services/task.service.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  await syncOverdueTasks();

  const baseTaskFilter =
    req.user.role === ROLES.ADMIN ? {} : { assignedTo: req.user._id };

  const baseProjectFilter =
    req.user.role === ROLES.ADMIN
      ? {}
      : {
          $or: [{ members: req.user._id }, { createdBy: req.user._id }],
        };

  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    tasksByStatus,
    recentActivity,
  ] = await Promise.all([
    Project.countDocuments(baseProjectFilter),
    Task.countDocuments(baseTaskFilter),
    Task.countDocuments({ ...baseTaskFilter, status: 'Completed' }),
    Task.countDocuments({
      ...baseTaskFilter,
      status: { $in: ['Todo', 'In Progress'] },
    }),
    Task.countDocuments({ ...baseTaskFilter, status: 'Overdue' }),
    Task.aggregate([
      { $match: baseTaskFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    ActivityLog.find(
      req.user.role === ROLES.ADMIN ? {} : { user: req.user._id }
    )
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('user', 'name email role'),
  ]);

  const statusMap = Object.fromEntries(tasksByStatus.map((s) => [s._id, s.count]));

  res.json({
    success: true,
    data: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus: statusMap,
      recentActivity,
    },
  });
});
