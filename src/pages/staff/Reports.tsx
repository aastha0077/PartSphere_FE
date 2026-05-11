import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Calendar,
  Download,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  User,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'sonner';

const StaffReports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/reports/customer-reports');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to synchronize market intelligence');
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
            Customer <span className="text-emerald-500">Insights</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Strategic analytics for customer retention and financial health.
          </p>
        </div>
        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-bold"
        >
          <History size={18} /> Refresh Audit
        </button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Top Spenders */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="glass-card h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">High Value Customers</h3>
                  <p className="text-sm text-gray-500">Top 10 contributors by lifetime revenue</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <th className="pb-4 px-4">Identity</th>
                    <th className="pb-4 px-4 text-right">Transactions</th>
                    <th className="pb-4 px-4 text-right">Lifetime Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.topSpenders.map((customer: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {customer.customerName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {customer.customerName}
                            </div>
                            <div className="text-xs text-gray-500">ID: #{customer.customerId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">{customer.orderCount} orders</td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-white">Rs. {customer.totalSpent.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Regulars */}
        <motion.div variants={item}>
          <div className="glass-card h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Frequent Visitors</h3>
                  <p className="text-sm text-gray-500">Customer loyalty index</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {data?.frequentCustomers.map((customer: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:border-blue-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{customer.customerName}</div>
                      <div className="text-xs text-gray-500">Last visited {new Date(customer.lastVisit).toLocaleDateString()}</div>
                    </div>
                    <div className="px-2 py-1 bg-blue-500/10 rounded text-[10px] font-black text-blue-500 uppercase">
                      {customer.visitCount} VISITS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pending Credits */}
        <motion.div variants={item} className="lg:col-span-3">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pending Credit Exposures</h3>
                  <p className="text-sm text-gray-500">Audit of outstanding customer balances</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.pendingCredits.map((credit: any, idx: number) => (
                <div key={idx} className="p-5 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CreditCard size={48} className="text-amber-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Due {new Date(credit.dueDate).toLocaleDateString()}</div>
                    <div className="text-lg font-black text-white mb-3">Rs. {credit.dueAmount.toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-bold text-xs">
                        {credit.customerName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-300">{credit.customerName}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Invoice #{credit.salesInvoiceId}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {data?.pendingCredits.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <div className="text-emerald-500 font-bold text-xl mb-1">Excellent Liquidity!</div>
                  <p className="text-gray-500">No outstanding customer credits found in the ledger.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StaffReports;
