import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, ShieldCheck, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ name, email, password });
      setSuccess(true);
      toast.success('Account created! Welcome to PartSphere.');
      // Wait 2 seconds then redirect to login
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container" style={{
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>Join Part<span className="text-gradient">Sphere</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create your account to get started</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
            <CheckCircle size={24} className="text-emerald-400" />
            <p className="text-sm text-emerald-300 font-medium">Account created! Redirecting to login...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aastha Aryal"
                required
                disabled={loading || success}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={loading || success}
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

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || success}
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

          <button
            type="submit"
            disabled={loading || success}
            style={{
              width: '100%',
              padding: '14px',
              background: (loading || success) ? 'rgba(255,255,255,0.05)' : 'var(--accent-gradient)',
              color: (loading || success) ? 'var(--text-muted)' : 'white',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'var(--transition)',
              boxShadow: (loading || success) ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Already have an account? {' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: '500' }}
            >
              Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
