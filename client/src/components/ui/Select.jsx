import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  hint,
  className = '',
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const listId = useId();

  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: r.bottom + window.scrollY + 6,
        left: r.left + window.scrollX,
        width: r.width,
      });
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
      const portal = document.getElementById(`select-portal-${listId}`);
      if (portal?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, listId]);

  const dropdown = (
    <AnimatePresence>
      {open ? (
        <motion.ul
          id={`select-portal-${listId}`}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 9999,
          }}
          className="max-h-60 overflow-auto rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
          role="listbox"
        >
          {options.map((opt) => (
            <li key={String(opt.value)}>
              <button
                type="button"
                role="option"
                aria-selected={String(opt.value) === String(value)}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${
                  String(opt.value) === String(value)
                    ? 'bg-violet-50 font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </motion.ul>
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
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-left text-sm shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/90 dark:text-white ${
          open ? 'border-violet-500 ring-2 ring-violet-500/20' : ''
        }`}
      >
        <span className={selected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
          {selected?.label ?? placeholder}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400">
          ▾
        </motion.span>
      </button>
      {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      {typeof document !== 'undefined' ? createPortal(dropdown, document.body) : null}
    </div>
  );
}
