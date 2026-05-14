export function FormField({ label, htmlFor, error, children }) {
  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function FormActions({ children, className = '' }) {
  return <div className={`mt-4 flex flex-wrap justify-end gap-2 ${className}`}>{children}</div>;
}
