import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export function Navbar({ onMenu }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          ☰
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Hello, {user?.name}
          </p>
          <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {dark ? 'Light mode' : 'Dark mode'}
      </button>
    </header>
  );
}
