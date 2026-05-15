import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from '../components/layout/AuthShell.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    if (!values.email.toLowerCase().endsWith('@ethara.ai')) {
      toast.error('Only @ethara.ai email addresses can register.');
      return;
    }
    try {
      await signup(values);
      toast.success('Account created');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="New accounts join as Members. Admins are promoted in the workspace by an existing administrator."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full name" autoComplete="name" {...register('name', { required: true })} />
        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@ethara.ai"
          hint="Must end with @ethara.ai"
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
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link className="font-semibold text-violet-400 hover:text-violet-300" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
