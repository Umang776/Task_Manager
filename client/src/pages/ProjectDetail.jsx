import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { Modal } from '../components/Modal.jsx';
import { TaskCard } from '../components/TaskCard.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { DatePicker } from '../components/ui/DatePicker.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';

const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Overdue'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
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
    const ok = await confirm({
      title: 'Delete project',
      message: 'Delete this project and all its tasks? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
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
    <PageTransition className="space-y-8">
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
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={`/tasks?project=${id}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Tasks in table view
            </Link>
            <Link
              to="/board"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Task Board
            </Link>
          </div>
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
    </PageTransition>
  );
}

function TaskModal({ open, onClose, projectId, task, onSaved, isAdmin, statuses, priorities }) {
  const confirm = useConfirm();
  const { register, handleSubmit, reset, control, watch, setValue } = useForm({
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
            <Select
              label="Update status"
              value={task.status}
              onChange={async (status) => {
                try {
                  await api.put(`tasks/${task._id}`, { status });
                  toast.success('Status updated');
                  await onSaved();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Update failed');
                }
              }}
              options={statuses.map((s) => ({ value: s, label: s }))}
            />
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
        <Input label="Title" {...register('title', { required: true })} />
        <Textarea label="Description" rows={3} {...register('description')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                label="Priority"
                value={field.value}
                onChange={field.onChange}
                options={priorities.map((p) => ({ value: p, label: p }))}
              />
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                value={field.value}
                onChange={field.onChange}
                options={statuses.map((s) => ({ value: s, label: s }))}
              />
            )}
          />
        </div>
        <DatePicker
          label="Due date"
          value={watch('dueDate')}
          onChange={(v) => setValue('dueDate', v)}
        />
        <Controller
          name="assignedTo"
          control={control}
          render={({ field }) => (
            <Select
              label="Assignee"
              value={field.value}
              onChange={field.onChange}
              placeholder="Unassigned"
              options={[
                { value: '', label: 'Unassigned' },
                ...users.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })),
              ]}
            />
          )}
        />
        <div className="flex flex-wrap justify-between gap-2 pt-2">
          <div>
            {task ? (
              <Button type="button" variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
