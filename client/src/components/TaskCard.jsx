import { motion } from 'framer-motion';

const cardSpring = { type: 'spring', stiffness: 380, damping: 30 };

const priorityColors = {
  Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  Medium: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  High: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
};

const statusColors = {
  Todo: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  'In Progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

export function TaskCard({ task, onClick, footer }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -5,
        scale: 1.012,
        boxShadow: '0 18px 36px -14px rgba(99, 102, 241, 0.26)',
        borderColor: 'rgba(129, 140, 248, 0.55)',
      }}
      whileTap={{ scale: 0.99 }}
      transition={cardSpring}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
          {task.project?.title ? (
            <p className="mt-1 text-xs text-slate-500">{task.project.title}</p>
          ) : null}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority] || ''}`}>
          {task.priority}
        </span>
      </div>
      {task.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{task.description}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[task.status] || ''}`}>
          {task.status}
        </span>
        {task.assignedTo?.name ? (
          <span className="text-xs text-slate-500">Assignee: {task.assignedTo.name}</span>
        ) : null}
        {task.dueDate ? (
          <span className="text-xs text-slate-500">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        ) : null}
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </motion.button>
  );
}
