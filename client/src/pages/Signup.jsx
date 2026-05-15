import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from '../components/layout/AuthShell.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
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
      toast.success('Account created');
      navigate('/', { replace: true });
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
      subtitle="Sign up as an admin (Ethara email) or a member (any email)."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Select
          label="Sign up as"
          value={accountType}
          onChange={(v) => setValue('accountType', v)}
          placeholder="Choose Admin or Member"
          options={[
            { value: '', label: 'Choose Admin or Member' },
            { value: 'admin', label: 'Admin' },
            { value: 'member', label: 'Member' },
          ]}
          hint="Admins are limited to @ethara.ai. Members can use any email."
        />
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
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link className="font-semibold text-violet-400 hover:text-violet-300" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
