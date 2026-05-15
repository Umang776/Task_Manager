import { forwardRef } from 'react';
import { motion } from 'framer-motion';

function FieldWrap({ label, error, hint, htmlFor, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-1.5"
    >
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </motion.div>
  );
}

export const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <FieldWrap label={label} error={error} hint={hint} htmlFor={inputId}>
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-950/90 dark:text-white dark:placeholder:text-slate-500 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
    </FieldWrap>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className = '', id, rows = 3, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <FieldWrap label={label} error={error} hint={hint} htmlFor={inputId}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={`w-full resize-y rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-950/90 dark:text-white ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
    </FieldWrap>
  );
});
