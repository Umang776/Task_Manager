import Project from '../models/Project.js';
import { ROLES } from '../utils/constants.js';

export async function userCanAccessTask(user, task) {
  if (user.role === ROLES.ADMIN) return true;
  const assigned = task.assignedTo?.toString() === user._id.toString();
  if (assigned) return true;
  const project = await Project.findById(task.project);
  if (!project) return false;
  const uid = user._id.toString();
  return (
    project.members.some((m) => m.toString() === uid) ||
    project.createdBy.toString() === uid
  );
}
