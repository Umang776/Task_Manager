import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const navSpring = { type: 'spring', stiffness: 420, damping: 30 };

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
      : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-950/40 dark:hover:text-violet-200',
  ].join(' ');

function NavItem({ to, end, onClose, children }) {
  return (
    <motion.div whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }} transition={navSpring}>
      <NavLink to={to} end={end} className={linkClass} onClick={onClose}>
        {children}
      </NavLink>
    </motion.div>
  );
}

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      <NavItem to="/" end onClose={onClose}>
        <span>Dashboard</span>
      </NavItem>
      <NavItem to="/projects" onClose={onClose}>
        <span>Projects</span>
      </NavItem>
      <NavItem to="/tasks" onClose={onClose}>
        <span>Tasks</span>
      </NavItem>
      <NavItem to="/board" onClose={onClose}>
        <span>Task Board</span>
      </NavItem>
      <NavItem to="/profile" onClose={onClose}>
        <span>Profile</span>
      </NavItem>
      {isAdmin ? (
        <NavItem to="/users" onClose={onClose}>
          <span>Users</span>
        </NavItem>
      ) : null}
      <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {isAdmin ? 'Admin' : 'Member'}
      </p>
      <div className="mt-auto border-t border-slate-200/80 pt-4 dark:border-slate-800">
        <motion.button
          type="button"
          onClick={handleLogout}
          whileHover={{ x: 6 }}
          whileTap={{ scale: 0.98 }}
          transition={navSpring}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Logout
        </motion.button>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 lg:flex lg:flex-col">
        <div className="border-b border-slate-200/80 px-4 py-5 dark:border-slate-800">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={navSpring}>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-violet-500/25">
                E
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Ethara Tasks</span>
            </Link>
          </motion.div>
          <p className="mt-2 truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        {nav}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
        onClick={onClose}
        role="presentation"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-out`}
      >
        <motion.div layout className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={navSpring}>
            <Link to="/" className="text-lg font-bold text-violet-600" onClick={onClose}>
              Ethara Tasks
            </Link>
          </motion.div>
          <motion.button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            transition={navSpring}
            aria-label="Close menu"
          >
            ✕
          </motion.button>
        </motion.div>
        {nav}
      </aside>
    </>
  );
}
