import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { DashboardCharts } from '../components/charts/DashboardCharts.jsx';

const linkSpring = { type: 'spring', stiffness: 420, damping: 28 };
const MotionLink = motion(Link);

const subtleLinkHover = {
  whileHover: { y: -3, scale: 1.04, boxShadow: '0 12px 26px -12px rgba(99, 102, 241, 0.22)' },
  whileTap: { scale: 0.97 },
  transition: linkSpring,
};

const primaryLinkHover = {
  whileHover: {
    y: -3,
    scale: 1.05,
    boxShadow: '0 14px 30px -10px rgba(79, 70, 229, 0.45)',
  },
  whileTap: { scale: 0.97 },
  transition: linkSpring,
};

function StatCard({ label, value, hint }) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: '0 18px 36px -14px rgba(99, 102, 241, 0.15)',
      }}
      transition={linkSpring}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
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
        <p className="text-slate-600 dark:text-slate-300">
          Overview with <span className="font-semibold text-slate-800 dark:text-slate-100">role-based access (Admin / Member)</span> — admins see org-wide stats; members see their assignments.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <MotionLink
            to="/projects"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            {...subtleLinkHover}
          >
            Projects
          </MotionLink>
          <MotionLink
            to="/tasks"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            {...subtleLinkHover}
          >
            Tasks
          </MotionLink>
          <MotionLink
            to="/board"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            {...subtleLinkHover}
          >
            Task Board
          </MotionLink>
          {isAdmin ? (
            <MotionLink
              to="/projects"
              state={{ openCreate: true }}
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              {...primaryLinkHover}
            >
              New project
            </MotionLink>
          ) : null}
        </div>
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
              <motion.li
                key={log._id}
                layout
                whileHover={{ x: 8 }}
                transition={linkSpring}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg py-3 text-sm transition-colors hover:bg-violet-50/80 dark:hover:bg-violet-950/20"
              >
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
              </motion.li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
