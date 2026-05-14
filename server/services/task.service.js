import Task from '../models/Task.js';

export async function syncOverdueTasks() {
  const now = new Date();
  await Task.updateMany(
    {
      dueDate: { $lt: now },
      status: { $nin: ['Completed', 'Overdue'] },
    },
    { $set: { status: 'Overdue' } }
  );
}
