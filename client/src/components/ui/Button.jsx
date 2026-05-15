import { motion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 420, damping: 26 };

const variants = {
  primary:
    'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
  secondary:
    'border border-slate-200/80 bg-white/80 text-slate-800 backdrop-blur hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
};

const hoverByVariant = {
  primary: { scale: 1.03, y: -2, boxShadow: '0 14px 32px -10px rgba(99, 102, 241, 0.45)' },
  secondary: { scale: 1.02, y: -1, boxShadow: '0 10px 24px -12px rgba(15, 23, 42, 0.18)' },
  danger: { scale: 1.02, y: -1, boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.35)' },
  ghost: { scale: 1.03, x: 3 },
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : hoverByVariant[variant]}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={spring}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
