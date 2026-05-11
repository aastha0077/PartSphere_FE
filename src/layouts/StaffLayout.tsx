import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  ShoppingCart,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertCircle,
  LogOut,
  Package,
  FileText
} from 'lucide-react';
import UserMenu from '../components/common/UserMenu';

const StaffLayout = () => {
  const navLinks = [
    { to: '/staff/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { to: '/staff/vendors', icon: <Car size={20} />, label: 'Vendors' },
    { to: '/staff/purchases', icon: <Package size={20} />, label: 'Purchases' },
    { to: '/staff/parts', icon: <Package size={20} />, label: 'Inventory' },
    { to: '/staff/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/staff/vehicles', icon: <Car size={20} />, label: 'Vehicles' },
    { to: '/staff/orders', icon: <ShoppingCart size={20} />, label: 'Customer Orders' },
    { to: '/staff/appointments', icon: <Calendar size={20} />, label: 'Service Registrar' },
    { to: '/staff/part-requests', icon: <AlertCircle size={20} />, label: 'Part Inquiries' },
    { to: '/staff/credits', icon: <CreditCard size={20} />, label: 'Credit Payments' },
    { to: '/staff/reports', icon: <FileText size={20} />, label: 'Customer Insights' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0d0d12] flex flex-col fixed inset-y-0 z-50">
        <div className="h-20 flex items-center gap-3 px-8 border-b border-white/5">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Part<span className="text-emerald-500">Sphere</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <p className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Staff Operations</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">{link.icon}</span>
              <span className="font-medium text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 bg-white/[0.02] m-4 rounded-2xl border border-white/5">
          <p className="text-[10px] font-bold text-emerald-500 uppercase mb-2">Internal Use Only</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ensure all customer data is handled according to privacy guidelines.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 bg-[#0d0d12]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h2 className="text-sm font-medium text-gray-400">Operations Console</h2>
            <p className="text-xs text-emerald-400 font-medium">Standard Staff Privileges</p>
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

export default StaffLayout; 