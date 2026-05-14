import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-center text-slate-600 dark:text-slate-300">
        The page you are looking for does not exist or was moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 dark:hover:bg-indigo-500"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
