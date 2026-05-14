import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { KanbanBoard } from '../components/KanbanBoard.jsx';

export default function Kanban() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('tasks', { params: { limit: 200 } });
      setTasks(res.data.data);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kanban</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Drag cards between columns to update status. Members can move only their assigned tasks.
        </p>
      </div>
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader />
        </div>
      ) : (
        <KanbanBoard tasks={tasks} onUpdated={load} user={user} isAdmin={isAdmin} />
      )}
    </div>
  );
}
