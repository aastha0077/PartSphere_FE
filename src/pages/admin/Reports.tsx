import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import api from '../../services/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

const StatMiniCard = ({ label, value, trend, isPositive }: any) => (
  <div className="glass-card" style={{ flex: 1, minWidth: '200px' }}>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', fontWeight: '800' }}>{value}</h2>
    <p style={{ 
      color: isPositive ? '#10b981' : '#ef4444', 
      fontSize: '0.8rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '4px',
      fontWeight: '600'
    }}>
      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {trend} vs last period
    </p>
  </div>
);

const Reports = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [custRes, dashRes] = await Promise.all([
          api.get('/admin/reports/customers'),
          api.get('/admin/reports/dashboard')
        ]);
        setData({ ...custRes.data, ...dashRes.data });
      } catch (err) {
        console.error('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue 2026 ($)',
        data: [42000, 49000, 45000, 52000, 58000, 62000, 65000, 72000, 78000, 85000, 92000, 105000],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a21',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, 
        ticks: { color: '#64748b', font: { size: 11 } } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748b', font: { size: 11 } } 
      }
    }
  };

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}
      />
      <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Compiling Financial Intelligence...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Financial <span className="text-gradient">Performance</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Strategic insights into revenue streams and customer acquisition.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="glass" style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Filter
          </button>
          <button style={{ padding: '12px 24px', background: 'var(--accent-gradient)', color: 'white', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Download size={20} /> Export Dataset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <StatMiniCard label="Gross Revenue" value={`$${data?.monthRevenue?.toLocaleString()}`} trend="+12.5%" isPositive={true} />
        <StatMiniCard label="Avg. Order Value" value="$482.50" trend="+4.2%" isPositive={true} />
        <StatMiniCard label="New Customers" value={data?.totalCustomers} trend="+18%" isPositive={true} />
        <StatMiniCard label="Active Credits" value={data?.pendingCredits} trend="-5.4%" isPositive={false} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Revenue Growth</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Projected vs Actual Revenue (USD)</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px' }}>
              <button style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--accent-primary)', borderRadius: '6px', color: 'white' }}>Monthly</button>
              <button style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'transparent', borderRadius: '6px', color: 'var(--text-muted)' }}>Quarterly</button>
            </div>
          </div>
          <div style={{ height: '320px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ background: 'var(--accent-gradient)', border: 'none' }}>
          <div style={{ color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
              <PieChart size={32} style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Market Insight</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>You've reached 85% of your sales target for this quarter. Keep pushing!</p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span>Quarter Progress</span>
                <span>85%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5 }} style={{ height: '100%', background: 'white' }} />
              </div>
              <button style={{ width: '100%', marginTop: '2rem', padding: '12px', background: 'white', color: 'var(--accent-primary)', borderRadius: '8px', fontWeight: '700', border: 'none' }}>
                View Strategy Plan
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700' }}>Top Revenue Contributors</h3>
            <Users size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.topSpenders?.map((spender: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid transparent', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'var(--accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>
                    {idx + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{spender.customerName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{spender.orderCount} total orders</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '700', color: 'white' }}>${spender.totalSpent.toLocaleString()}</p>
                  <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600' }}>VIP Customer</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700' }}>Loyal Customer Engagement</h3>
            <TrendingUp size={18} color="var(--info)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.frequentCustomers?.map((customer: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', background: idx === 0 ? 'var(--success)' : 'var(--info)', borderRadius: '50%' }} />
                  <span style={{ fontWeight: '500' }}>{customer.customerName}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{customer.visitCount} visits</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last: {new Date(customer.lastVisit).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
