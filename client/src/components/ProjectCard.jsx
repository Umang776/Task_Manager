const statusColors = {
  Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  Completed: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  'On Hold': 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
};

export function ProjectCard({ project, onClick }) {
  const memberCount = project.members?.length ?? 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{project.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {project.description || 'No description'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[project.status] || ''}`}>
          {project.status}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{memberCount} member{memberCount === 1 ? '' : 's'}</span>
        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
      </div>
    </button>
  );
}
