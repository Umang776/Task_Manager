import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loader } from '../components/Loader.jsx';
import { DashboardCharts } from '../components/charts/DashboardCharts.jsx';

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('dashboard/stats');
        if (!cancelled) setData(res.data.data);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return <p className="text-slate-600 dark:text-slate-300">Unable to load dashboard.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300">Overview of projects and tasks.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Projects" value={data.totalProjects} />
        <StatCard label="Tasks" value={data.totalTasks} />
        <StatCard label="Completed" value={data.completedTasks} />
        <StatCard label="Pending" value={data.pendingTasks} />
        <StatCard label="Overdue" value={data.overdueTasks} hint="Auto-synced from due dates" />
      </div>

      <DashboardCharts tasksByStatus={data.tasksByStatus} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h2>
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {(data.recentActivity || []).length === 0 ? (
            <li className="py-6 text-sm text-slate-500">No activity yet.</li>
          ) : (
            data.recentActivity.map((log) => (
              <li key={log._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {log.user?.name || 'User'}
                  </span>
                  <span className="text-slate-500"> · {log.action.replace(/_/g, ' ').toLowerCase()}</span>
                  {log.entityType ? (
                    <span className="text-slate-400"> ({log.entityType})</span>
                  ) : null}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
