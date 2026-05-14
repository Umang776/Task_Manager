import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

const STATUSES = ['Todo', 'In Progress', 'Completed', 'Overdue'];

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const searchDebounce = useRef(null);

  const projectFilter = searchParams.get('project') || '';
  const statusFilter = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || '1');
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await api.get('projects');
      setProjects(res.data.data);
    } catch {
      setProjects([]);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('tasks', {
        params: {
          project: projectFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
          page,
          limit: 15,
        },
      });
      setTasks(res.data.data);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectFilter, statusFilter, search, page]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-600 dark:text-slate-300">
            {isAdmin ? 'Search, filter, and manage all tasks.' : 'Tasks assigned to you.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/projects"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            All projects
          </Link>
          <Link
            to="/kanban"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Kanban
          </Link>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Search</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Search by title"
            value={searchInput}
            onChange={(e) => {
              const v = e.target.value;
              setSearchInput(v);
              clearTimeout(searchDebounce.current);
              searchDebounce.current = setTimeout(() => {
                const next = new URLSearchParams(searchParams);
                if (v) next.set('search', v);
                else next.delete('search');
                next.set('page', '1');
                setSearchParams(next);
              }, 350);
            }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">Project</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={projectFilter}
            onChange={(e) => updateParam('project', e.target.value)}
          >
            <option value="">All</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={statusFilter}
            onChange={(e) => updateParam('status', e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks"
          description="Try clearing filters or open a project to add or manage tasks."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Clear filters
              </button>
              <Link
                to="/projects"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Go to projects
              </Link>
            </div>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <Link
                        to={`/tasks/${t._id}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {t.project?._id ? (
                        <Link
                          to={`/projects/${t.project._id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.project.title}
                        </Link>
                      ) : (
                        t.project?.title || '—'
                      )}
                    </td>
                    <td className="px-4 py-3">{t.priority}</td>
                    <td className="px-4 py-3">
                      {isAdmin || String(t.assignedTo?._id) === String(user?.id) ? (
                        <select
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                          value={t.status}
                          onChange={async (e) => {
                            try {
                              await api.put(`tasks/${t._id}`, { status: e.target.value });
                              toast.success('Status updated');
                              loadTasks();
                            } catch (err) {
                              toast.error(err.response?.data?.message || 'Update failed');
                            }
                          }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        t.status
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {t.assignedTo?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/tasks/${t._id}`}
                        className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} tasks)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(Math.max(1, pagination.page - 1)));
                  setSearchParams(next);
                }}
              >
                Prev
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(pagination.page + 1));
                  setSearchParams(next);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
