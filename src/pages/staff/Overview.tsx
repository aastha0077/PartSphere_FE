import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'sonner';

const StatCard = ({ title, value, icon, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card"
    style={{ flex: 1, minWidth: '240px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{value}</h3>
      </div>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        background: `${color}15`, 
        color: color, 
        borderRadius: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const StaffOverview = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [dashRes, reportRes, aptRes, reviewsRes] = await Promise.all([
        api.get('/staff/reports/dashboard-summary'),
        api.get('/staff/reports/customer-reports'),
        api.get('/staff/appointments'),
        api.get('/public/reviews').catch(() => ({ data: [] }))
      ]);
      setData({ ...dashRes.data, ...reportRes.data });
      setAppointments(aptRes.data);
      setReviews(reviewsRes.data.slice(0, 4));
    } catch (err) {
      console.error('Failed to fetch staff dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await api.put(`/staff/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      const res = await api.get('/staff/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Could not update appointment status.');
    }
  };

  const pendingAppointments = appointments.filter((a: any) => a.status === 'Pending');

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Staff <span className="text-emerald-500">Overview</span></h1>
        <p className="text-gray-400">Daily operations and customer management summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Today's Sales" value={data?.todaySalesCount || '0'} icon={<ShoppingBag size={24} />} color="#10b981" delay={0.1} />
        <StatCard title="Total Customers" value={data?.totalCustomers || '0'} icon={<Users size={24} />} color="#6366f1" delay={0.2} />
        <StatCard title="Pending Credits" value={`Rs. ${data?.pendingCredits?.reduce((acc: any, c: any) => acc + c.dueAmount, 0).toLocaleString() || '0'}`} icon={<CreditCard size={24} />} color="#f59e0b" delay={0.3} />
        <StatCard title="Low Stock Alerts" value={data?.lowStockCount || '0'} icon={<AlertTriangle size={24} />} color="#ef4444" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Operational Queue): spans 2 columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Pending Customer Appointments */}
          <div className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar size={20} className="text-blue-500" /> Pending Service Bookings
              </h3>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full animate-pulse">
                {pendingAppointments.length} awaiting response
              </span>
            </div>
            <div className="space-y-3">
              {pendingAppointments.length > 0 ? (
                pendingAppointments.map((app: any) => {
                  const appDate = new Date(app.appointmentDate || app.date);
                  return (
                    <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl gap-4 hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[70px] p-2 bg-blue-500/10 rounded-lg text-blue-500">
                          <p className="text-sm font-extrabold">
                            {appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </p>
                          <p className="text-[0.65rem] uppercase font-bold tracking-wider opacity-85">
                            {appDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">{app.customerName}</h4>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
                              {app.serviceType}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{app.vehicleInfo}</p>
                          {app.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              &ldquo;{app.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button 
                          onClick={() => updateAppointmentStatus(app.id, 'Completed')} 
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} /> Complete
                        </button>
                        <button 
                          onClick={() => updateAppointmentStatus(app.id, 'Cancelled')} 
                          className="px-3 py-1.5 bg-red-500/15 text-red-500 border border-red-500/20 hover:bg-red-500/25 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 opacity-60">
                  <CheckCircle2 size={40} className="mb-2 text-emerald-500" />
                  <p className="text-sm">No pending appointments to approve</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" /> Inventory Alerts
            </h3>
            <div className="space-y-4">
              {data?.lowStockItems?.length > 0 ? data.lowStockItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-500 font-bold">{item.stockQuantity} Left</div>
                    <div className="text-xs text-gray-500">Refill Suggested</div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                  <CheckCircle2 size={48} className="mb-2 text-emerald-500" />
                  <p>All stock levels healthy</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Control Panel): spans 1 column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => navigate('/staff/pos')} className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-bold hover:bg-emerald-500/20 transition-all text-left flex items-center justify-between">
                Open POS Terminal <Package size={18} />
              </button>
              <button onClick={() => navigate('/staff/appointments')} className="w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 font-bold hover:bg-blue-500/20 transition-all text-left flex items-center justify-between">
                Schedule Appointment <Calendar size={18} />
              </button>
              <button onClick={() => navigate('/staff/credits')} className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 font-bold hover:bg-amber-500/20 transition-all text-left flex items-center justify-between">
                Review Credit Payments <CreditCard size={18} />
              </button>
            </div>
          </div>

          {/* Pending Credits List */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-amber-500" /> Urgent Credit Collections
            </h3>
            <div className="flex flex-col gap-3">
              {data?.pendingCredits?.slice(0, 3).map((credit: any) => (
                <div key={credit.id} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-tighter">Due {new Date(credit.dueDate).toLocaleDateString()}</span>
                    <span className="text-lg font-black">Rs. {credit.dueAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">{credit.customerName[0]}</div>
                    <span className="text-sm font-medium">{credit.customerName}</span>
                  </div>
                </div>
              ))}
              {(!data?.pendingCredits || data.pendingCredits.length === 0) && <p className="text-gray-500 text-center py-4">No pending credits.</p>}
            </div>
          </div>

          {/* Recent Reviews List */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star size={20} className="text-amber-500" /> Recent Service Reviews
            </h3>
            <div className="flex flex-col gap-3">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No reviews yet.</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold">{r.customerName}</span>
                      <div className="flex text-amber-500">
                        {[...Array(r.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 italic line-clamp-2">"{r.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffOverview;
