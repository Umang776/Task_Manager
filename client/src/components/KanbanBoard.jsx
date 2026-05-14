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
import toast from 'react-hot-toast';
import { api } from '../api/client.js';

const STATUSES = ['Todo', 'In Progress', 'Completed', 'Overdue'];

function colId(status) {
  return `col-${status}`;
}

function DroppableColumn({ status, tasks, user, isAdmin }) {
  const { setNodeRef, isOver } = useDroppable({ id: colId(status) });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[280px] flex-1 flex-col rounded-2xl border bg-slate-50/80 p-3 dark:bg-slate-900/60 ${
        isOver ? 'border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{status}</h3>
        <span className="text-xs text-slate-500">{tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => {
          const disabled = !isAdmin && String(task.assignedTo?._id) !== String(user?.id);
          return <DraggableTask key={task._id} task={task} disabled={disabled} />;
        })}
      </div>
    </div>
  );
}

function DraggableTask({ task, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    disabled,
    data: { task },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-slate-200 bg-white p-3 text-left text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950 ${
        isDragging ? 'opacity-60' : ''
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
      {...listeners}
      {...attributes}
    >
      <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
      <p className="mt-1 text-xs text-slate-500">{task.project?.title}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
        <span>{task.priority}</span>
        {task.dueDate ? <span>Due {new Date(task.dueDate).toLocaleDateString()}</span> : null}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onUpdated, user, isAdmin }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );
  const [active, setActive] = useState(null);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STATUSES.map((s) => [s, []]));
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
      else map.Todo.push(t);
    }
    return map;
  }, [tasks]);

  const handleDragEnd = async (event) => {
    const { active: a, over } = event;
    setActive(null);
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith('col-')) return;
    const newStatus = overId.replace('col-', '');
    const taskId = String(a.id);
    const task = tasks.find((x) => String(x._id) === taskId);
    if (!task || task.status === newStatus) return;
    if (!isAdmin && String(task.assignedTo?._id) !== String(user?.id)) {
      toast.error('You can only move tasks assigned to you');
      return;
    }
    try {
      await api.put(`tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated');
      await onUpdated();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={({ active: act }) => {
        const t = tasks.find((x) => String(x._id) === String(act.id));
        setActive(t || null);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            tasks={grouped[status] || []}
            user={user}
            isAdmin={isAdmin}
          />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <div className="rounded-xl border border-indigo-200 bg-white p-3 text-sm shadow-xl dark:border-indigo-900 dark:bg-slate-950">
            <p className="font-semibold">{active.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
