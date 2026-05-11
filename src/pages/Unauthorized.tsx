import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const dashboardPath = 
      user.role === 'Admin' ? '/admin/dashboard' :
      user.role === 'Staff' ? '/staff/dashboard' :
      '/customer/dashboard';
    
    navigate(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20 shadow-2xl shadow-red-500/10">
            <ShieldAlert size={48} />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Access Denied</h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          It seems you don't have the necessary clearance to view this sector. 
          All unauthorized access attempts are logged for security purposes.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <ArrowLeft size={20} />
            Return to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl transition-all border border-white/5"
          >
            <Home size={20} />
            Home Page
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            PartSphere Security Protocol v4.0.2
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
