import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
  rectIntersection,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Select } from './ui/Select.jsx';

const STATUSES = ['Todo', 'In Progress', 'Completed', 'Overdue'];

const COLUMN_META = {
  Todo: { accent: 'from-slate-500 to-slate-600', label: 'Backlog' },
  'In Progress': { accent: 'from-violet-500 to-indigo-600', label: 'In progress' },
  Completed: { accent: 'from-emerald-500 to-teal-600', label: 'Completed' },
  Overdue: { accent: 'from-amber-500 to-orange-600', label: 'Overdue' },
};

function colId(status) {
  return `col-${status}`;
}

function nextStatus(status) {
  const i = STATUSES.indexOf(status);
  if (i < 0 || i >= STATUSES.length - 1) return status;
  return STATUSES[i + 1];
}

function DroppableColumn({ status, tasks, user, isAdmin, onAdvance }) {
  const { setNodeRef, isOver } = useDroppable({ id: colId(status) });
  const meta = COLUMN_META[status] || { accent: 'from-slate-500 to-slate-600', label: status };

  return (
    <motion.div
      layout
      ref={setNodeRef}
      className={`flex min-h-[320px] w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border p-3 transition-shadow ${
        isOver
          ? 'border-violet-400 bg-violet-50/50 shadow-lg shadow-violet-500/10 dark:border-violet-600 dark:bg-violet-950/30'
          : 'border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/50'
      }`}
    >
      <motion.div layout className={`mb-3 rounded-xl bg-gradient-to-r ${meta.accent} px-3 py-2`}>
        <motion.div layout className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{meta.label}</h3>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
            {tasks.length}
          </span>
        </motion.div>
      </motion.div>
      <motion.div layout className="flex flex-1 flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => {
            const disabled = !isAdmin && String(task.assignedTo?._id) !== String(user?.id);
            return (
              <DraggableTask
                key={task._id}
                task={task}
                disabled={disabled}
                onAdvance={() => onAdvance(task)}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function DraggableTask({ task, disabled, onAdvance }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    disabled,
    data: { task },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined;

  const overdue =
    task.dueDate && task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border bg-white p-3 text-left text-sm shadow-sm dark:bg-slate-950 ${
        overdue ? 'border-amber-400/60 ring-1 ring-amber-400/30' : 'border-slate-200 dark:border-slate-700'
      } ${isDragging ? 'opacity-50' : ''} ${disabled ? 'opacity-70' : ''}`}
    >
      <div className="flex gap-2">
        <div
          className={`min-w-0 flex-1 ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}`}
          {...listeners}
          {...attributes}
        >
          <Link
            to={`/tasks/${task._id}`}
            onPointerDown={(e) => e.stopPropagation()}
            className="block font-semibold text-violet-700 hover:underline dark:text-violet-300"
          >
            {task.title}
          </Link>
          <p className="mt-1 truncate text-xs text-slate-500">{task.project?.title}</p>
          <motion.div layout className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {task.priority}
            </span>
            {task.dueDate ? (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                  overdue ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                }`}
              >
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            ) : null}
          </motion.div>
        </div>
        {!disabled ? (
          <button
            type="button"
            title="Advance status"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance();
            }}
            className="h-8 w-8 shrink-0 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 opacity-0 transition group-hover:opacity-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300"
          >
            →
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

export function TaskBoard({ tasks, projects, projectFilter, onProjectFilter, onUpdated, user, isAdmin }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );
  const [active, setActive] = useState(null);

  const filtered = useMemo(() => {
    if (!projectFilter) return tasks;
    return tasks.filter((t) => String(t.project?._id || t.project) === String(projectFilter));
  }, [tasks, projectFilter]);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STATUSES.map((s) => [s, []]));
    for (const t of filtered) {
      if (map[t.status]) map[t.status].push(t);
      else map.Todo.push(t);
    }
    return map;
  }, [filtered]);

  const updateStatus = async (taskId, newStatus, task) => {
    if (!isAdmin && String(task.assignedTo?._id) !== String(user?.id)) {
      toast.error('You can only move tasks assigned to you');
      return;
    }
    try {
      await api.put(`tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      await onUpdated();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const handleAdvance = (task) => {
    const next = nextStatus(task.status);
    if (next === task.status) {
      toast('Already at final stage', { icon: 'ℹ️' });
      return;
    }
    updateStatus(task._id, next, task);
  };

  const handleDragEnd = async (event) => {
    const { active: a, over } = event;
    setActive(null);
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith('col-')) return;
    const newStatus = overId.replace('col-', '');
    const taskId = String(a.id);
    const task = filtered.find((x) => String(x._id) === taskId);
    if (!task || task.status === newStatus) return;
    await updateStatus(taskId, newStatus, task);
  };

  const projectOptions = [
    { value: '', label: 'All projects' },
    ...projects.map((p) => ({ value: p._id, label: p.title })),
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select
          label="Project"
          value={projectFilter}
          onChange={onProjectFilter}
          options={projectOptions}
        />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={({ active: act }) => {
          const t = filtered.find((x) => String(x._id) === String(act.id));
          setActive(t || null);
        }}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActive(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              tasks={grouped[status] || []}
              user={user}
              isAdmin={isAdmin}
              onAdvance={handleAdvance}
            />
          ))}
        </div>
        <DragOverlay>
          {active ? (
            <div className="rounded-xl border border-violet-300 bg-white p-3 text-sm shadow-2xl dark:border-violet-700 dark:bg-slate-950">
              <p className="font-semibold">{active.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
