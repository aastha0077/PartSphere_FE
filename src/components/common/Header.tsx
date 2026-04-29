import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';

  return (
    <header style={{
      height: '80px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10, 10, 12, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div 
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer' 
          }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--accent-gradient)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <ShieldCheck size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
            Part<span className="text-gradient">Sphere</span>
          </h1>
        </div>

        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Home</a>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Features</a>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Pricing</a>
        </nav>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {!isLoginPage && (
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                fontWeight: '500',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogIn size={18} />
              Sign In
            </button>
          )}
          {!isSignupPage && (
            <button 
              onClick={() => navigate('/signup')}
              style={{
                background: 'var(--accent-gradient)',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                transition: 'var(--transition)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <UserPlus size={18} />
              Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
