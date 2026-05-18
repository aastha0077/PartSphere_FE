import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserMenu from './UserMenu';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';

  const handleLogoClick = () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const dashboardPath =
      user?.role === 'Admin' ? '/admin/dashboard' :
        user?.role === 'Staff' ? '/staff/dashboard' :
          '/customer/dashboard';

    navigate(dashboardPath);
  };

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
          onClick={handleLogoClick}
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
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'white' }}>
            Part<span className="text-gradient">Sphere</span>
          </h1>
        </div>

        <nav style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500', transition: 'var(--transition)' }} className="hover:text-white">Home</Link>
          <Link to="/about" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500', transition: 'var(--transition)' }} className="hover:text-white">About Us</Link>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Features</a>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Pricing</a>
        </nav>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              {user?.name && (
                <div className="flex flex-col items-end mr-2">
                  <span className="text-xs text-gray-400">Welcome,</span>
                  <span className="text-sm font-semibold text-white">{user.name}</span>
                </div>
              )}
              <button
                onClick={() => {
                  const path = user?.role === 'Admin' ? '/admin/dashboard' : user?.role === 'Staff' ? '/staff/dashboard' : '/customer/dashboard';
                  navigate(path);
                }}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <div className="h-8 w-px bg-white/10"></div>
              <UserMenu />
            </div>
          ) : (
            <>
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
                >
                  <UserPlus size={18} />
                  Sign Up
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
