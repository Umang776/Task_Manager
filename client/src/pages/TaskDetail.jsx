import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { TaskCommentsPanel } from '../components/TaskCommentsPanel.jsx';
import { Select } from '../components/ui/Select.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { Button } from '../components/ui/Button.jsx';

const STATUSES = ['Todo', 'In Progress', 'Completed', 'Overdue'];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const isAdmin = user?.role === 'admin';
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`tasks/${id}`);
      setTask(res.data.data);
    } catch (e) {
      setTask(null);
      toast.error(e.response?.data?.message || 'Task not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const canChangeStatus =
    task && (isAdmin || String(task.assignedTo?._id) === String(user?.id));

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Back to tasks
        </Link>
        <p className="text-slate-600 dark:text-slate-300">This task could not be loaded.</p>
      </div>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link to="/tasks" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          All tasks
        </Link>
        {task.project?._id ? (
          <>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <Link
              to={`/projects/${task.project._id}`}
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {task.project.title}
            </Link>
          </>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{task.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
          {task.description || 'No description'}
        </p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Priority</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">{task.priority}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Due</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Assignee</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">{task.assignedTo?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">Status</dt>
            <dd className="mt-1">
              {canChangeStatus ? (
                <Select
                  value={task.status}
                  onChange={async (status) => {
                    try {
                      await api.put(`tasks/${task._id}`, { status });
                      toast.success('Status updated');
                      load();
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Update failed');
                    }
                  }}
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                />
              ) : (
                <span className="text-slate-900 dark:text-white">{task.status}</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/board"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Open Task Board
          </Link>
          {isAdmin ? (
            <Button
              type="button"
              variant="danger"
              className="!px-3 !py-1.5 !text-xs"
              onClick={async () => {
                const ok = await confirm({
                  title: 'Delete task',
                  message: 'Delete this task permanently?',
                  confirmLabel: 'Delete',
                  variant: 'danger',
                });
                if (!ok) return;
                try {
                  await api.delete(`tasks/${task._id}`);
                  toast.success('Task deleted');
                  navigate('/tasks');
                } catch (e) {
                  toast.error(e.response?.data?.message || 'Delete failed');
                }
              }}
            >
              Delete task
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <TaskCommentsPanel
          taskId={task._id}
          userId={user?.id}
          isAdmin={isAdmin}
          onChanged={load}
        />
      </div>
    </PageTransition>
  );
}
