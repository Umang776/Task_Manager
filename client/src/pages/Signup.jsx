import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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

export default function Signup() {
  const { signup, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', password: '', accountType: '' },
  });

  const accountType = watch('accountType');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    if (!values.accountType) {
      toast.error('Choose whether you are signing up as Admin or Member.');
      return;
    }
    if (values.accountType === 'admin' && !values.email.toLowerCase().trim().endsWith('@ethara.ai')) {
      toast.error('Admin accounts must use an email ending with @ethara.ai.');
      return;
    }
    try {
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        accountType: values.accountType,
      });
      await logout();
      toast.success('Account created. Please sign in.');
      navigate('/login', { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Signup failed');
    }
  };

  const emailHint =
    accountType === 'admin'
      ? 'Must end with @ethara.ai'
      : accountType === 'member'
        ? 'Any valid email (Gmail, work, etc.)'
        : 'Choose Admin or Member first';

  return (
    <AuthShell
      title="Create account"
      subtitle="Choose admin or member, then complete your profile."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <AuthRoleToggle label="Sign up as" value={accountType} onChange={(v) => setValue('accountType', v)} />
        <input type="hidden" {...register('accountType')} />
        <Input label="Full name" autoComplete="name" {...register('name', { required: true })} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder={accountType === 'admin' ? 'you@ethara.ai' : 'you@gmail.com'}
          hint={emailHint}
          {...register('email', { required: true })}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 6 characters"
          {...register('password', { required: true, minLength: 6 })}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <MotionLink
          className="inline-block font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          to="/login"
          {...authFooterLinkMotion}
        >
          Sign in
        </MotionLink>
      </p>
    </AuthShell>
  );
}
