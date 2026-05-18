import { motion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 480, damping: 32 };

export function AuthRoleToggle({ label, value, onChange }) {
  const options = [
    { id: 'admin', label: 'Admin' },
    { id: 'member', label: 'Member' },
  ];

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {label ? (
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      ) : null}
      <motion.div
        className="auth-role-toggle grid grid-cols-2 gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-slate-950/60"
        role="group"
        aria-label={label}
      >
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className={[
                'relative rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
              ].join(' ')}
              aria-pressed={active}
            >
              {active ? (
                <motion.span
                  layoutId="auth-role-pill"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600"
                  transition={spring}
                />
              ) : null}
              <span className="relative z-10">{opt.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
