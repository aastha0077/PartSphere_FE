import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import FormAlert, { FieldError } from '../../components/common/FormAlert';
import {
  getApiErrorMessage,
  hasFieldErrors,
  inputErrorStyle,
  validateSignupForm,
  type FieldErrors,
} from '../../utils/feedback';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const clearField = (field: 'name' | 'email' | 'password') => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateSignupForm(name, email, password);
    setFieldErrors(validation);
    if (hasFieldErrors(validation)) {
      setFormError('Please fix the highlighted fields before creating your account.');
      toast.error('Please fix the highlighted fields before creating your account.');
      return;
    }

    setLoading(true);

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      setSuccess(true);
      toast.success('Account created! Sign in to continue.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, { context: 'signup' });
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="signup-container"
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
            Join Part<span className="text-gradient">Sphere</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create your account to get started</p>
        </motion.div>

        {success && (
          <FormAlert variant="success" title="Account created">
            Your account is ready. Redirecting you to sign in…
          </FormAlert>
        )}

        {formError && !success && (
          <FormAlert variant="error" title="Could not create account">
            {formError}
          </FormAlert>
        )}

        <form onSubmit={handleSignup} noValidate>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="signup-name"
              style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            >
              Full name
            </label>
            <div style={{ position: 'relative' }}>
              <User
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
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearField('name');
                }}
                placeholder="Your full name"
                disabled={loading || success}
                aria-invalid={!!fieldErrors.name}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  ...(fieldErrors.name ? inputErrorStyle : {}),
                }}
              />
            </div>
            <FieldError message={fieldErrors.name} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="signup-email"
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
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearField('email');
                }}
                placeholder="name@example.com"
                disabled={loading || success}
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

          <div style={{ marginBottom: '2rem' }}>
            <label
              htmlFor="signup-password"
              style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            >
              Password
            </label>
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
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearField('password');
                }}
                placeholder="At least 6 characters"
                disabled={loading || success}
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
            {!fieldErrors.password && (
              <p className="mt-1.5 text-xs text-gray-500">Use at least 6 characters.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            style={{
              width: '100%',
              padding: '14px',
              background: loading || success ? 'rgba(255,255,255,0.05)' : 'var(--accent-gradient)',
              color: loading || success ? 'var(--text-muted)' : 'white',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'var(--transition)',
              boxShadow: loading || success ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)',
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={20} />
                Create account
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: '500' }}
            >
              Sign in
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
