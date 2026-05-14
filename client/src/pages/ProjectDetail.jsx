import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { Modal } from '../components/Modal.jsx';
import { TaskCard } from '../components/TaskCard.jsx';

const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Overdue'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const load = async () => {
    const [pRes, tRes] = await Promise.all([
      api.get(`projects/${id}`),
      api.get('tasks', { params: { project: id, limit: 100 } }),
    ]);
    setProject(pRes.data.data);
    setTasks(tRes.data.data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch {
        if (!cancelled) toast.error('Failed to load project');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  if (loading || !project) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 hover:underline"
            onClick={() => navigate('/projects')}
          >
            ← Back to projects
          </button>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{project.description}</p>
          <p className="mt-2 text-sm text-slate-500">
            Status: <span className="font-semibold text-slate-800 dark:text-slate-100">{project.status}</span>
          </p>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setTaskModal(true);
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              New task
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
            >
              Delete project
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Team</h2>
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {(project.members || []).length === 0 ? (
            <li className="py-3 text-sm text-slate-500">No members assigned.</li>
          ) : (
            project.members.map((m) => (
              <li key={m._id} className="flex justify-between py-3 text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-100">{m.name}</span>
                <span className="text-slate-500">{m.email}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tasks</h2>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks in this project yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((t) => (
              <div key={t._id} className="space-y-2">
                <TaskCard
                  task={t}
                  onClick={() => {
                    setEditingTask(t);
                    setTaskModal(true);
                  }}
                />
                {isAdmin ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                      onClick={() => {
                        setEditingTask(t);
                        setTaskModal(true);
                      }}
                    >
                      Edit task
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal
        open={taskModal}
        onClose={() => setTaskModal(false)}
        projectId={id}
        task={editingTask}
        onSaved={async () => {
          await load();
          setTaskModal(false);
        }}
        isAdmin={isAdmin}
        statuses={TASK_STATUSES}
        priorities={PRIORITIES}
      />
    </div>
  );
}

function TaskModal({ open, onClose, projectId, task, onSaved, isAdmin, statuses, priorities }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Todo',
      dueDate: '',
      assignedTo: '',
    },
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!open || !isAdmin) return;
    (async () => {
      try {
        const res = await api.get('users');
        setUsers(res.data.data);
      } catch {
        setUsers([]);
      }
    })();
  }, [open, isAdmin]);

  useEffect(() => {
    if (!open) return;
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
        assignedTo: task.assignedTo?._id || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Todo',
        dueDate: '',
        assignedTo: '',
      });
    }
  }, [open, task, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate || undefined,
        assignedTo: values.assignedTo || undefined,
        project: projectId,
      };
      if (task) {
        await api.put(`tasks/${task._id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('tasks', payload);
        toast.success('Task created');
      }
      await onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (!task || !isAdmin) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`tasks/${task._id}`);
      toast.success('Task deleted');
      await onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  if (!isAdmin) {
    return (
      <Modal open={open} title="Task" onClose={onClose}>
        {task ? (
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
            <p className="text-slate-600 dark:text-slate-300">{task.description}</p>
            <p className="text-slate-500">Status: {task.status}</p>
            <label className="mt-4 block text-sm font-medium">Update status</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              defaultValue={task.status}
              onChange={async (e) => {
                try {
                  await api.put(`tasks/${task._id}`, { status: e.target.value });
                  toast.success('Status updated');
                  await onSaved();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Update failed');
                }
              }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a task from the list.</p>
        )}
      </Modal>
    );
  }

  return (
    <Modal open={open} title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            {...register('title', { required: true })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            {...register('description')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              {...register('priority')}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              {...register('status')}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Due date</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            {...register('dueDate')}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Assignee</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            {...register('assignedTo')}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap justify-between gap-2 pt-2">
          <div>
            {task ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 dark:border-red-900"
              >
                Delete
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
