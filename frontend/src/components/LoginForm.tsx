import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { LoginFormValues } from '../features/auth/validation';
import { loginSchema } from '../features/auth/validation';
import { useLoginMutation } from '../hooks/useApiMutations';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const loading = loginMutation.isPending;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@example.com',
      password: 'password',
    },
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');
  const emailField = register('email');
  const passwordField = register('password');
  const emailErrorId = errors.email ? 'login-email-error' : undefined;
  const passwordErrorId = errors.password ? 'login-password-error' : undefined;

  useEffect(() => {
    if (generalError) {
      setGeneralError(null);
    }
  }, [generalError, watchedEmail, watchedPassword]);

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      setGeneralError(null);
      await loginMutation.mutateAsync(values);
      onLoginSuccess();
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  });

  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Login</h2>

      {generalError && (
        <div className={styles.noticeError} role="alert">
          {generalError}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className={styles.formInput}
            placeholder="Enter your email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={emailErrorId}
            disabled={loading}
            {...emailField}
          />
          {errors.email && (
            <div className={styles.error} id={emailErrorId}>
              {errors.email.message}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            Password
          </label>
          <input
            type="password"
            id="password"
            className={styles.formInput}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={passwordErrorId}
            disabled={loading}
            {...passwordField}
          />
          {errors.password && (
            <div className={styles.error} id={passwordErrorId}>
              {errors.password.message}
            </div>
          )}
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className={styles.noticeNeutral}>
        <strong>Demo Credentials:</strong>
        <br />
        Email: test@example.com
        <br />
        Password: password
      </div>
    </div>
  );
};

export default LoginForm;