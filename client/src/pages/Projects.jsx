import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { Modal } from '../components/Modal.jsx';
import { Loader } from '../components/Loader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

const STATUSES = ['Active', 'Completed', 'On Hold'];

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const location = useLocation();

  const load = async () => {
    const res = await api.get('projects');
    setProjects(res.data.data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch {
        if (!cancelled) toast.error('Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreateFromNav = Boolean(location.state?.openCreate);

  useEffect(() => {
    if (openCreateFromNav) {
      setEditing(null);
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [openCreateFromNav, location.pathname, navigate]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-600 dark:text-slate-300">
            {isAdmin ? 'Create and manage team projects.' : 'Projects you belong to.'}
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            New project
          </button>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={isAdmin ? 'Create your first project to get started.' : 'Ask an admin to add you to a project.'}
          action={
            isAdmin ? (
              <button
                type="button"
                onClick={openCreate}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Create project
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <div key={p._id} className="relative space-y-2">
              <ProjectCard project={p} onClick={() => navigate(`/projects/${p._id}`)} />
              {isAdmin ? (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(p);
                    }}
                  >
                    Edit
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        project={editing}
        onSaved={async ({ createdId } = {}) => {
          await load();
          setModalOpen(false);
          if (createdId) navigate(`/projects/${createdId}`);
        }}
      />
    </div>
  );
}

function ProjectModal({ open, onClose, project, onSaved }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: '', description: '', status: 'Active' },
  });
  const [users, setUsers] = useState([]);
  const [memberIds, setMemberIds] = useState([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await api.get('users');
        setUsers(res.data.data);
      } catch {
        setUsers([]);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        status: project.status,
      });
      setMemberIds((project.members || []).map((m) => m._id));
    } else {
      reset({ title: '', description: '', status: 'Active' });
      setMemberIds([]);
    }
  }, [open, project, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, members: memberIds };
      if (project) {
        await api.put(`projects/${project._id}`, payload);
        toast.success('Project updated');
        await onSaved({});
      } else {
        const res = await api.post('projects', payload);
        toast.success('Project created');
        const created = res.data.data;
        const createdId = created?._id != null ? String(created._id) : undefined;
        await onSaved({ createdId });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  const toggleMember = (id) => {
    const sid = String(id);
    setMemberIds((prev) => {
      const set = new Set(prev.map(String));
      if (set.has(sid)) set.delete(sid);
      else set.add(sid);
      return Array.from(set);
    });
  };

  return (
    <Modal open={open} title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form id="project-modal-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            {...register('status')}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm font-medium">Team members</p>
          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            {users.map((u) => {
              const id = String(u._id);
              return (
                <label key={id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={memberIds.map(String).includes(id)}
                    onChange={() => toggleMember(id)}
                  />
                  <span>
                    {u.name} <span className="text-slate-500">({u.email})</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
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
      </form>
    </Modal>
  );
}
