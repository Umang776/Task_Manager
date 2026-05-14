import ActivityLog from '../models/ActivityLog.js';

export async function logActivity({ userId, action, entityType, entityId, metadata = {} }) {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      entityType,
      entityId,
      metadata,
    });
  } catch (e) {
    console.error('Activity log failed', e.message);
  }
}
