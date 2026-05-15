import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from '../components/layout/AuthShell.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';

const DEFAULT_ADMIN = { email: 'admin@ethara.ai', password: 'Admin123!' };
const DEFAULT_MEMBER = { email: 'member@ethara.ai', password: 'Member123!' };

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
    if (!values.email.toLowerCase().endsWith('@ethara.ai')) {
      toast.error('Only @ethara.ai email addresses can sign in.');
      return;
    }
    try {
      await login(values.email, values.password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your Ethara workspace email. Admin and Member roles are assigned after authentication."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Select
          label="Quick sign-in"
          value={signInAs}
          onChange={handleSignInAsChange}
          placeholder="Choose Admin or Member"
          options={[
            { value: '', label: 'Choose Admin or Member' },
            { value: 'admin', label: 'Admin' },
            { value: 'member', label: 'Member' },
          ]}
          hint="Prefills credentials for demo accounts (after seed)."
        />
        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@ethara.ai"
          {...register('email', { required: true })}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password', { required: true })}
        />
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </motion.div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{' '}
        <Link className="font-semibold text-violet-400 hover:text-violet-300" to="/signup">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
