import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYmd(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function DatePicker({
  label,
  value,
  onChange,
  min,
  hint,
  placeholder = 'Pick a date',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => parseYmd(value) || new Date());
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const portalId = useId();

  const minDate = parseYmd(min);
  const selected = parseYmd(value);

  const display = selected
    ? selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: Math.max(r.width, 280) });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      const el = document.getElementById(`dp-${portalId}`);
      if (el?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, portalId]);

  const cells = useMemo(() => {
    const y = view.getFullYear();
    const m = view.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const rows = [];
    for (let i = 0; i < startPad; i++) rows.push(null);
    for (let d = 1; d <= daysInMonth; d++) rows.push(new Date(y, m, d));
    return rows;
  }, [view]);

  const calendar = (
    <AnimatePresence>
      {open ? (
        <motion.div
          id={`dp-${portalId}`}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 9999,
          }}
          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <motion.div layout className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            >
              ›
            </button>
          </motion.div>
          <motion.div layout className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-slate-400">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </motion.div>
          <motion.div layout className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <span key={`e-${i}`} />;
              const ymd = toYmd(day);
              const isSelected = value === ymd;
              const isDisabled = minDate && day < minDate;
              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(ymd);
                    setOpen(false);
                  }}
                  className={`rounded-lg py-2 text-sm transition ${
                    isSelected
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-600 font-semibold text-white shadow'
                      : isDisabled
                        ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                        : 'text-slate-700 hover:bg-violet-50 dark:text-slate-200 dark:hover:bg-violet-950/40'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </motion.div>
          {value ? (
            <button
              type="button"
              className="mt-3 w-full text-center text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              Clear date
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-left text-sm shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-950/90 ${
          open ? 'border-violet-500 ring-2 ring-violet-500/20' : ''
        }`}
      >
        <span className={display ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
          {display || placeholder}
        </span>
        <span className="text-violet-500">📅</span>
      </button>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {typeof document !== 'undefined' ? createPortal(calendar, document.body) : null}
    </div>
  );
}
