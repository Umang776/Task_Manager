import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

const spring = { type: 'spring', stiffness: 480, damping: 28 };

export function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme();
  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{
        scale: 1.06,
        boxShadow: '0 10px 22px -10px rgba(139, 92, 246, 0.35)',
      }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
      className={`rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? 'Light mode' : 'Dark mode'}
    </motion.button>
  );
}
