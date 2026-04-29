import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Truck,
  CreditCard,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'staff' | 'customer';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { to: '/admin/parts', icon: <Package size={20} />, label: 'Inventory' },
    { to: '/admin/vendors', icon: <Truck size={20} />, label: 'Vendors' },
    { to: '/admin/staff', icon: <Users size={20} />, label: 'Staff Management' },
    { to: '/admin/reports', icon: <BarChart3 size={20} />, label: 'Financial Reports' },
  ];

  const staffLinks = [
    { to: '/staff', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/staff/pos', icon: <ShoppingCart size={20} />, label: 'POS Terminal' },
    { to: '/staff/customers', icon: <Users size={20} />, label: 'Customer CRM' },
    { to: '/staff/appointments', icon: <Calendar size={20} />, label: 'Service Registrar' },
    { to: '/staff/credits', icon: <CreditCard size={20} />, label: 'Credit Payments' },
  ];

  const links = role === 'admin' ? adminLinks : staffLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="glass" style={{
      width: '260px',
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      position: 'fixed',
      left: 0,
      top: '80px',
      borderRight: '1px solid var(--glass-border)',
      zIndex: 90
    }}>
      <nav style={{ flex: 1, marginTop: '1rem' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 1rem',
              marginBottom: '8px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-gradient)' : 'transparent',
              transition: 'var(--transition)',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '0 1rem' }}>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--danger)',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '12px 1rem',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            transition: 'var(--transition)'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
