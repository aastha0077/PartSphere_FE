import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Home, 
  Car, 
  Calendar, 
  History,
  Search,
  Bell
} from 'lucide-react';
import UserMenu from '../components/common/UserMenu';

const CustomerLayout = () => {
  const navigate = useNavigate();
  
  const navLinks = [
    { to: '/customer/dashboard', icon: <Home size={18} />, label: 'Home' },
    { to: '/customer/vehicles', icon: <Car size={18} />, label: 'My Vehicles' },
    { to: '/customer/booking', icon: <Calendar size={18} />, label: 'Book Service' },
    { to: '/customer/history', icon: <History size={18} />, label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-white/5 bg-[#0d0d12]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Part<span className="text-indigo-500">Sphere</span>
            </h1>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'text-indigo-400 bg-indigo-400/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0d0d12]"></span>
            </button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Banner Section (Optional) */}
        <div className="bg-gradient-to-b from-indigo-600/10 to-transparent h-48 -mb-48 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0d0d12] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 italic">"Premium Parts. Expert Care. Driven by PartSphere AI."</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;