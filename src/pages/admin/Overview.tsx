import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Users, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  PlusCircle,
  FileText,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';

const DashboardCard = ({ title, value, icon, change, isPositive, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card"
    style={{ 
      flex: 1, 
      minWidth: '240px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ 
      position: 'absolute', 
      top: '-20px', 
      right: '-20px', 
      width: '100px', 
      height: '100px', 
      background: 'var(--accent-gradient)', 
      opacity: 0.05, 
      borderRadius: '50%',
      filter: 'blur(20px)'
    }} />
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        background: 'rgba(99, 102, 241, 0.1)', 
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-primary)',
        boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.2)'
      }}>
        {icon}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        fontSize: '0.75rem',
        fontWeight: '600',
        color: isPositive ? '#10b981' : '#ef4444',
        background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        padding: '6px 10px',
        borderRadius: '20px',
        border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
      }}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{title}</h3>
    <p style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{value}</p>
  </motion.div>
);

const QuickAction = ({ icon, label, onClick, color }: any) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1.25rem',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: 'var(--text-secondary)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = 'var(--accent-primary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--glass-border)';
    }}
  >
    <div style={{ color: color || 'var(--accent-primary)' }}>{icon}</div>
    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</span>
  </button>
);

const Overview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/reports/financial-summary');
        setStats(res.data);
      } catch (err: unknown) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}
      />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginBottom: '2.5rem' 
      }}>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}
          >
            Dashboard <span className="text-gradient">Overview</span>
          </motion.h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            System health and performance metrics for PartSphere.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={async () => {
              try {
                toast.loading("Generating system report...");
                const res = await api.get('/admin/reports/sales-trends?range=monthly');
                const sales = res.data;
                
                const csvRows = [
                  "System Report - PartSphere",
                  `Export Date,${new Date().toLocaleString()}`,
                  "",
                  "SUMMARY METRICS",
                  `Monthly Revenue,Rs. ${stats?.monthRevenue || 0}`,
                  `Total Inventory,${stats?.totalParts || 0}`,
                  `Low Stock Items,${stats?.lowStockCount || 0}`,
                  `Total Staff,${stats?.totalStaff || 0}`,
                  "",
                  "RECENT SALES TRANSACTIONS",
                  "Invoice ID,Customer,Staff,Date,Method,Amount (Rs.),Items"
                ];

                sales.forEach((s: any) => {
                  csvRows.push(`${s.invoiceId},"${s.customerName}","${s.staffName}",${new Date(s.date).toLocaleDateString()},${s.paymentMethod},${s.totalAmount},${s.itemCount}`);
                });

                const csvString = csvRows.join("\n");
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `PartsSphere_System_Report_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.dismiss();
                toast.success("System report exported!");
              } catch (err) {
                toast.dismiss();
                toastApiError(err, { context: 'generic', fallback: 'Could not generate the report.' });
              }
            }}
            style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <FileText size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <DashboardCard 
          title="Monthly Revenue" 
          value={`Rs. ${stats?.monthRevenue?.toLocaleString() || '0'}`}
          icon={<DollarSign size={28} />}
          change="+14.2%"
          isPositive={true}
          delay={0.1}
        />
        <DashboardCard 
          title="Inventory Items" 
          value={stats?.totalParts || '0'}
          icon={<Package size={28} />}
          change="+12"
          isPositive={true}
          delay={0.2}
        />
        <DashboardCard 
          title="Low Stock" 
          value={stats?.lowStockCount || '0'}
          icon={<AlertCircle size={28} />}
          change={stats?.lowStockCount > 5 ? "+3" : "-2"}
          isPositive={stats?.lowStockCount < 5}
          delay={0.3}
        />
        <DashboardCard 
          title="Total Staff" 
          value={stats?.totalStaff || '0'}
          icon={<Users size={28} />}
          change="Stable"
          isPositive={true}
          delay={0.4}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Sales Activity</h3>
            <button 
              onClick={() => navigate('/admin/reports')}
              style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '600' }}
            >
              View All Transactions
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Transaction ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentSales?.map((sale: any) => (
                  <tr key={sale.id} className="table-row-hover" style={{ background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', borderRadius: '12px 0 0 12px', fontWeight: '500' }}>#{sale.id}</td>
                    <td style={{ padding: '1rem' }}>{sale.customerName}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        color: '#10b981', 
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>Success</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: 'white' }}>Rs. {sale.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: '1rem', borderRadius: '0 12px 12px 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(sale.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {(!stats?.recentSales || stats.recentSales.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No recent sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card"
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <QuickAction icon={<PlusCircle size={24} />} label="Add Part" onClick={() => navigate('/admin/parts')} />
              <QuickAction icon={<Users size={24} />} label="Add Staff" onClick={() => navigate('/admin/staff')} />
              <QuickAction icon={<TrendingUp size={24} />} label="Sales" onClick={() => navigate('/admin/reports')} color="#10b981" />
              <QuickAction icon={<Settings size={24} />} label="Config" onClick={() => {}} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card"
            style={{ flex: 1, background: 'var(--accent-gradient)', border: 'none' }}
          >
            <div style={{ color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Activity size={20} />
                <h3 style={{ fontWeight: '700' }}>System Health</h3>
              </div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '1.5rem' }}>All systems are operational. Last sync 2 mins ago.</p>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  style={{ height: '100%', background: 'white' }} 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;