import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Package, 
  BarChart3, 
  ShieldCheck,
  Settings,
  ShoppingCart
} from 'lucide-react';
import UserMenu from '../components/common/UserMenu';

const AdminLayout = () => {
  const navLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/staff', icon: <Users size={20} />, label: 'Manage Staff' },
    { to: '/admin/vendors', icon: <Truck size={20} />, label: 'Vendors' },
    { to: '/admin/purchases', icon: <Package size={20} />, label: 'Purchases' },
    { to: '/admin/parts', icon: <Package size={20} />, label: 'Parts Inventory' },
    { to: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Customer Orders' },
    { to: '/admin/reports', icon: <BarChart3 size={20} />, label: 'Financial Reports' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0d0d12] flex flex-col fixed inset-y-0 z-50">
        <div className="h-20 flex items-center gap-3 px-8 border-b border-white/5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Part<span className="text-indigo-500">Sphere</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <p className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Administration</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">{link.icon}</span>
              <span className="font-medium text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all">
            <Settings size={20} />
            <span className="font-medium text-sm">System Config</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 bg-[#0d0d12]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h2 className="text-sm font-medium text-gray-400">Welcome Back, Admin</h2>
            <p className="text-xs text-indigo-400 font-medium">Control Center Restricted Access</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-white/5"></div>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;