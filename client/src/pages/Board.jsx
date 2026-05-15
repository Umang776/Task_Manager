import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { TaskBoard } from '../components/TaskBoard.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';

export default function Board() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.get('tasks', { params: { limit: 200 } }),
        api.get('projects'),
      ]);
      setTasks(tRes.data.data);
      setProjects(pRes.data.data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <motion.div>
            <h1 className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent dark:from-violet-400 dark:to-indigo-400">
              Task Board
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Drag cards between columns or use the arrow to advance. Members move only their assigned work.
            </p>
          </motion.div>
          <motion.div layout className="flex flex-wrap gap-2">
            <Link
              to="/tasks"
              className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-900/80"
            >
              Table view
            </Link>
            <Link
              to="/projects"
              className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-900/80"
            >
              Projects
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader />
          </div>
        ) : (
          <TaskBoard
            tasks={tasks}
            projects={projects}
            projectFilter={projectFilter}
            onProjectFilter={setProjectFilter}
            onUpdated={load}
            user={user}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </PageTransition>
  );
}
