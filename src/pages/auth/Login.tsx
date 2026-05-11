import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, sessionMessage } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || 
        (user.role === 'Admin' ? '/admin/dashboard' : 
         user.role === 'Staff' ? '/staff/dashboard' : 
         '/customer/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { role } = await login(email, password);
      toast.success('Welcome back to PartSphere!');
      
      // Determine redirection path
      const path = role === 'Admin' ? '/admin/dashboard' : 
                   role === 'Staff' ? '/staff/dashboard' : 
                   '/customer/dashboard';
      
      navigate(path);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      flex: 1,
      minHeight: 'calc(100vh - 160px)',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, #1a1a2e, #0a0a0c)',
      padding: '2rem 0'
    }}>
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
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--accent-gradient)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>Welcome <span className="text-gradient">Back</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to access your PartSphere dashboard</p>
        </div>

        {sessionMessage && (
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="text-indigo-400 mt-0.5" />
            <p className="text-sm text-indigo-300">{sessionMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="text-red-400 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', cursor: 'pointer' }}>Forgot?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
            <input type="checkbox" id="remember" style={{ accentColor: 'var(--accent-primary)' }} />
            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Remember me</label>
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
              boxShadow: loading ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Don't have an account? {' '}
            <span
              onClick={() => navigate('/signup')}
              style={{ color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: '500' }}
            >
              Register Now
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
