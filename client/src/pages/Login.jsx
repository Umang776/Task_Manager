import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from '../components/layout/AuthShell.jsx';
import { Input } from '../components/ui/Input.jsx';
import { AuthRoleToggle } from '../components/auth/AuthRoleToggle.jsx';
import { Button } from '../components/ui/Button.jsx';

const MotionLink = motion(Link);

const authFooterLinkMotion = {
  whileHover: { scale: 1.06 },
  whileTap: { scale: 0.96 },
  transition: { type: 'spring', stiffness: 480, damping: 26 },
};

const DEFAULT_ADMIN = { email: 'admin@ethara.ai', password: 'Admin123!' };
const DEFAULT_MEMBER = { email: 'demo.member@gmail.com', password: 'Member123!' };

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '', accountType: '' },
  });

  const accountType = watch('accountType');

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleAccountTypeChange = (value) => {
    setValue('accountType', value);
    if (value === 'admin') {
      setValue('email', DEFAULT_ADMIN.email);
      setValue('password', DEFAULT_ADMIN.password);
    } else if (value === 'member') {
      setValue('email', DEFAULT_MEMBER.email);
      setValue('password', DEFAULT_MEMBER.password);
    }
  };

  const onSubmit = async (values) => {
    const kind = (values.accountType || accountType || '').trim();
    if (!kind) {
      toast.error('Choose whether you are signing in as Admin or Member.');
      return;
    }
    try {
      await login(values.email, values.password, kind);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  const demoHint =
    accountType === 'admin'
      ? 'After seed: admin uses @ethara.ai (see quick fill above).'
      : accountType === 'member'
        ? 'After seed: demo member uses any email (e.g. Gmail) from quick fill.'
        : 'Pick Admin or Member, then enter your credentials.';

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your workspace credentials. Pick admin or member to match your account."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <AuthRoleToggle label="Sign in as" value={accountType} onChange={handleAccountTypeChange} />
        <input type="hidden" {...register('accountType')} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder={accountType === 'admin' ? 'you@ethara.ai' : accountType === 'member' ? 'you@gmail.com' : 'Your email'}
          {...register('email', { required: true })}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password', { required: true })}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">{demoHint}</p>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        No account?{' '}
        <MotionLink
          className="inline-block font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          to="/signup"
          {...authFooterLinkMotion}
        >
          Create account
        </MotionLink>
      </p>
    </AuthShell>
  );
}
