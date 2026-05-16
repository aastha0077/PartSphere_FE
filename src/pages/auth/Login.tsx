import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import FormAlert, { FieldError } from '../../components/common/FormAlert';
import {
  getApiErrorMessage,
  hasFieldErrors,
  inputErrorStyle,
  validateLoginForm,
  type FieldErrors,
} from '../../utils/feedback';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, sessionMessage } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const from =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        (user.role === 'Admin'
          ? '/admin/dashboard'
          : user.role === 'Staff'
            ? '/staff/dashboard'
            : '/customer/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const clearField = (field: 'email' | 'password') => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateLoginForm(email, password);
    setFieldErrors(validation);
    if (hasFieldErrors(validation)) {
      setFormError('Please fix the highlighted fields before signing in.');
      toast.error('Please fix the highlighted fields before signing in.');
      return;
    }

    setLoading(true);

    try {
      const { role } = await login(email.trim(), password);
      toast.success('Welcome back to PartSphere!');
      const path =
        role === 'Admin'
          ? '/admin/dashboard'
          : role === 'Staff'
            ? '/staff/dashboard'
            : '/customer/dashboard';
      navigate(path);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, { context: 'login' });
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-container"
      style={{
        flex: 1,
        minHeight: 'calc(100vh - 160px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #1a1a2e, #0a0a0c)',
        padding: '2rem 0',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
        }}
      >
        <motion.div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'var(--accent-gradient)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
            }}
          >
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>
            Welcome <span className="text-gradient">Back</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to access your PartSphere dashboard</p>
        </motion.div>

        {sessionMessage && (
          <FormAlert variant="info" title="Session ended">
            {sessionMessage}
          </FormAlert>
        )}

        {formError && (
          <FormAlert variant="error" title="Could not sign in">
            {formError}
          </FormAlert>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="login-email"
              style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            >
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearField('email');
                }}
                placeholder="name@example.com"
                disabled={loading}
                aria-invalid={!!fieldErrors.email}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  ...(fieldErrors.email ? inputErrorStyle : {}),
                }}
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label htmlFor="login-password" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Password
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', cursor: 'pointer' }}>
                Forgot?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearField('password');
                }}
                placeholder="••••••••"
                disabled={loading}
                aria-invalid={!!fieldErrors.password}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  ...(fieldErrors.password ? inputErrorStyle : {}),
                }}
              />
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
            <input type="checkbox" id="remember" style={{ accentColor: 'var(--accent-primary)' }} />
            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(255,255,255,0.05)' : 'var(--accent-gradient)',
              color: loading ? 'var(--text-muted)' : 'white',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'var(--transition)',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)',
            }}
          >
            {loading ? (
              <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                Sign in
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <span
              onClick={() => navigate('/signup')}
              style={{ color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: '500' }}
            >
              Register now
            </span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
