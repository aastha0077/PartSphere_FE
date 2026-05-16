import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Filter,
  Package,
  Activity,
  History,
  User,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

const StatMiniCard = ({ label, value, trend, isPositive, icon }: any) => (
  <div className="glass-card" style={{ flex: 1, minWidth: '220px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, color: 'white' }}>
      {React.cloneElement(icon, { size: 80 })}
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>{label}</p>
    <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', fontWeight: '800', letterSpacing: '-0.02em' }}>{value}</h2>
    <div style={{
      color: isPositive ? '#10b981' : '#ef4444',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontWeight: '700',
      background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      padding: '4px 8px',
      borderRadius: '20px',
      width: 'fit-content'
    }}>
      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {trend}
    </div>
  </div>
);

const Reports = () => {
  const [data, setData] = useState<any>(null);
  const [periodicData, setPeriodicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const fetchBaseData = async () => {
    try {
      const [topCust, freqBuy, pending, dashRes, trendRes] = await Promise.all([
        api.get('/admin/reports/top-customers'),
        api.get('/admin/reports/frequent-buyers'),
        api.get('/admin/reports/pending-payments'),
        api.get('/admin/reports/financial-summary'),
        api.get('/admin/reports/revenue-trend')
      ]);
      setData({
        topSpenders: topCust.data,
        frequentCustomers: freqBuy.data,
        pendingCredits: pending.data,
        ...dashRes.data
      });
      setRevenueTrend(trendRes.data);
    } catch (err: unknown) {
      toastApiError(err, { context: 'load', fallback: 'Could not load dashboard data.' });
    }
  };

  const fetchPeriodicReport = async (period: string) => {
    setPeriodLoading(true);
    try {
      const res = await api.get(`/admin/reports/${period}`);
      setPeriodicData(res.data);
    } catch (err) {
      toastApiError(err, { context: 'load', fallback: `Could not load the ${period} report.` });
    } finally {
      setPeriodLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBaseData(), fetchPeriodicReport('monthly')]);
      setLoading(false);
    };
    init();
  }, []);

  const handlePeriodChange = (period: 'daily' | 'monthly' | 'yearly') => {
    setSelectedPeriod(period);
    fetchPeriodicReport(period);
  };

  const handleExportPDF = async () => {
    try {
      toast.loading("Generating PDF report...");
      const res = await api.get(`/admin/reports/sales-trends?range=${selectedPeriod}`);
      const sales = res.data;

      const doc = new jsPDF();

      // Add Title
      doc.setFontSize(20);
      doc.setTextColor(99, 102, 241); // Indigo color
      doc.text("PartSphere Financial Report", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Reporting Period: ${selectedPeriod.toUpperCase()}`, 14, 35);

      // Summary Metrics
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Performance Summary", 14, 45);

      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', `Rs. ${periodicData?.totalRevenue?.toLocaleString() || '0'}`],
          ['Transaction Volume', `${periodicData?.totalSales || '0'} Sales`],
          ['Avg. Invoice Value', `Rs. ${periodicData?.averageOrderValue?.toFixed(2) || '0.00'}`],
          ['Items Sold', `${periodicData?.totalItemsSold || '0'} Units`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }
      });

      // Detailed Sales Table
      doc.text("Detailed Sales Activity", 14, (doc as any).lastAutoTable.finalY + 15);

      const tableData = sales.map((s: any) => [
        `#${s.invoiceId}`,
        s.customerName,
        s.staffName,
        new Date(s.date).toLocaleDateString(),
        s.paymentMethod,
        `Rs. ${s.totalAmount.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['ID', 'Customer', 'Staff', 'Date', 'Payment', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] }
      });

      doc.save(`PartSphere_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss();
      toast.success("PDF report downloaded!");
    } catch (e) {
      toast.dismiss();
      toastApiError(e, { context: 'generic', fallback: 'Could not generate the PDF report.' });
      console.error(e);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.loading("Preparing detailed report...");
      const res = await api.get(`/admin/reports/sales-trends?range=${selectedPeriod}`);
      const sales = res.data;

      const csvRows = [
        "Invoice ID,Customer,Staff,Date,Payment,Total (Rs.),Items"
      ];

      sales.forEach((s: any) => {
        csvRows.push(`${s.invoiceId},"${s.customerName}","${s.staffName}",${new Date(s.date).toLocaleDateString()},${s.paymentMethod},${s.totalAmount},${s.itemCount}`);
      });

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `detailed_sales_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success("Detailed report exported!");
    } catch (e) {
      toast.dismiss();
      toastApiError(e, { context: 'generic', fallback: 'Could not export the detailed report.' });
    }
  };

  const chartData = {
    labels: revenueTrend.length > 0 ? revenueTrend.map(t => t.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (Rs.)',
        data: revenueTrend.length > 0 ? revenueTrend.map(t => t.total) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '48px', height: '48px', border: '4px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}
      />
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Analyzing Financial Infrastructure</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fetching strategic revenue metrics...</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
            Executive <span className="text-gradient">Intelligence</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500' }}>
            Advanced financial reporting and customer acquisition analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['daily', 'monthly', 'yearly'] as const).map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: selectedPeriod === p ? 'var(--accent-gradient)' : 'transparent',
                color: selectedPeriod === p ? 'white' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {periodLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 15, 0.5)', zIndex: 10, backdropFilter: 'blur(2px)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Activity className="animate-pulse" color="var(--accent-primary)" />
          </motion.div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatMiniCard
            label={`${selectedPeriod} Revenue`}
            value={`Rs. ${periodicData?.totalRevenue?.toLocaleString() || '0'}`}
            trend="+12.5%"
            isPositive={true}
            icon={<DollarSign />}
          />
          <StatMiniCard
            label="Volume"
            value={periodicData?.totalSales || '0'}
            trend="+4.2%"
            isPositive={true}
            icon={<History />}
          />
          <StatMiniCard
            label="Avg. Invoice"
            value={`Rs. ${periodicData?.averageOrderValue?.toFixed(2) || '0.00'}`}
            trend="+2.1%"
            isPositive={true}
            icon={<TrendingUp />}
          />
          <StatMiniCard
            label="Parts Sold"
            value={periodicData?.totalItemsSold || '0'}
            trend="+8%"
            isPositive={true}
            icon={<Package />}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Revenue Velocity</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Trend analysis for the current fiscal year.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleExportCSV}
                className="glass"
                style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Download size={14} /> CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="glass"
                style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'var(--accent-primary)', color: 'white', border: 'none' }}
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>
          <div style={{ height: '340px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Top Value Customers</h3>
            <Users size={20} color="var(--accent-primary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.topSpenders?.map((spender: any, idx: number) => (
              <div key={idx} className="table-row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    <User size={18} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white' }}>{spender.customerName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>{spender.orderCount} Transactions</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', color: 'white', fontSize: '1rem' }}>Rs. {spender.totalSpent.toLocaleString()}</p>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>VIP TIER</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Retention Analytics</h3>
            <TrendingUp size={20} color="var(--info)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.frequentCustomers?.map((customer: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '10px', height: '100%', minHeight: '30px', background: idx === 0 ? 'var(--success)' : 'var(--info)', borderRadius: '5px', opacity: 0.6 }} />
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{customer.customerName}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Visit: {new Date(customer.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>{customer.visitCount}</span>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Visits</p>
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