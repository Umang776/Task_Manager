import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

const DEFAULT_ADMIN = { email: 'admin@example.com', password: 'Admin123!' };
const DEFAULT_MEMBER = { email: 'member@example.com', password: 'Member123!' };

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [signInAs, setSignInAs] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const emailVal = watch('email');
  const passwordVal = watch('password');

  useEffect(() => {
    if (signInAs === 'admin' && (emailVal !== DEFAULT_ADMIN.email || passwordVal !== DEFAULT_ADMIN.password)) {
      setSignInAs('');
    }
    if (signInAs === 'member' && (emailVal !== DEFAULT_MEMBER.email || passwordVal !== DEFAULT_MEMBER.password)) {
      setSignInAs('');
    }
  }, [emailVal, passwordVal, signInAs]);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSignInAsChange = (value) => {
    setSignInAs(value);
    if (value === 'admin') {
      setValue('email', DEFAULT_ADMIN.email);
      setValue('password', DEFAULT_ADMIN.password);
    } else if (value === 'member') {
      setValue('email', DEFAULT_MEMBER.email);
      setValue('password', DEFAULT_MEMBER.password);
    }
  };

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Team Task Manager — projects, tasks, and progress with <span className="font-semibold text-slate-800 dark:text-slate-100">role-based access (Admin / Member)</span>.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="signInAs">
              Sign in as
            </label>
            <select
              id="signInAs"
              value={signInAs}
              onChange={(e) => handleSignInAsChange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Choose Admin or Member</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Prefills email and password. Your role is assigned by the server after login.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
              {...register('email', { required: true })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
              {...register('password', { required: true })}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          No account?{' '}
          <Link className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" to="/signup">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
