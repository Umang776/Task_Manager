import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

const spring = { type: 'spring', stiffness: 450, damping: 28 };

export function Navbar({ onMenu }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          className="inline-flex rounded-xl border border-slate-200 p-2 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          onClick={onMenu}
          aria-label="Open menu"
          whileHover={{ scale: 1.06, boxShadow: '0 8px 20px -8px rgba(99, 102, 241, 0.35)' }}
          whileTap={{ scale: 0.94 }}
          transition={spring}
        >
          ☰
        </motion.button>
        <motion.div initial={false} whileHover={{ x: 2 }} transition={spring}>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Hello, {user?.name}
            </p>
            <p className="text-xs text-slate-500 capitalize dark:text-slate-400">
              {user?.role === 'admin' ? 'Admin' : user?.role === 'member' ? 'Member' : user?.role || '—'}
            </p>
          </div>
        </motion.div>
      </div>
      <ThemeToggle />
    </header>
  );
}
