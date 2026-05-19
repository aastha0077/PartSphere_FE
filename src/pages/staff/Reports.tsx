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
import { toastApiError, toastValidationError } from '../../utils/feedback';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    } catch (err: unknown) {
      toastApiError(err, { context: 'load', fallback: 'Could not load reports.' });
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

  const exportToPDF = () => {
    try {
      toast.loading("Generating PDF Customer Reports...");
      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Emerald color matching the staff reports UI
      doc.text("PartSphere Customer Reports", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text("Scope: Regulars, High Spenders, and Outstanding Credits", 14, 35);

      let currentY = 45;

      // 1. High Value Customers Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("1. High Value Customers (Top Spenders)", 14, currentY);
      
      const topSpendersData = data?.topSpenders?.map((c: any) => [
        c.customerName,
        `#${c.customerId}`,
        `${c.orderCount} orders`,
        `Rs. ${c.totalSpent.toLocaleString()}`
      ]) || [];

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Customer Name', 'Customer ID', 'Transactions', 'Lifetime Value']],
        body: topSpendersData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] } // Emerald header
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // 2. Frequent Visitors Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("2. Frequent Visitors (Loyal Customers)", 14, currentY);

      const frequentCustomersData = data?.frequentCustomers?.map((c: any) => [
        c.customerName,
        `#${c.customerId}`,
        `${c.visitCount} visits`,
        new Date(c.lastVisit).toLocaleDateString()
      ]) || [];

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Customer Name', 'Customer ID', 'Visits Count', 'Last Visit']],
        body: frequentCustomersData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] } // Blue header
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // 3. Pending Credits Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("3. Pending Credit Exposures", 14, currentY);

      const pendingCreditsData = data?.pendingCredits?.map((c: any) => [
        `Invoice #${c.salesInvoiceId}`,
        c.customerName,
        `#${c.customerId}`,
        `Rs. ${c.dueAmount.toLocaleString()}`,
        new Date(c.dueDate).toLocaleDateString(),
        c.status
      ]) || [];

      if (pendingCreditsData.length > 0) {
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Invoice ID', 'Customer Name', 'Customer ID', 'Due Amount', 'Due Date', 'Status']],
          body: pendingCreditsData,
          theme: 'striped',
          headStyles: { fillColor: [245, 158, 11] } // Amber header
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("No outstanding customer credits found in the ledger.", 14, currentY + 8);
      }

      doc.save(`PartSphere_Customer_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss();
      toast.success("PDF Customer report exported successfully!");
    } catch (err) {
      toast.dismiss();
      toast.error("Could not export the PDF report.");
      console.error(err);
    }
  };

  const exportToCSV = () => {
    try {
      toast.loading("Generating customer reports...");
      const csvRows = [
        "Customer Reports - PartSphere",
        `Generated Date,${new Date().toLocaleString()}`,
        "",
        "HIGH VALUE CUSTOMERS (TOP SPENDERS)",
        "Customer Name,Customer ID,Transactions,Lifetime Value (Rs.)"
      ];

      data?.topSpenders?.forEach((c: any) => {
        csvRows.push(`"${c.customerName}",#${c.customerId},${c.orderCount},${c.totalSpent}`);
      });

      csvRows.push("");
      csvRows.push("FREQUENT VISITORS (LOYAL CUSTOMERS)");
      csvRows.push("Customer Name,Customer ID,Visits,Last Visit");

      data?.frequentCustomers?.forEach((c: any) => {
        csvRows.push(`"${c.customerName}",#${c.customerId},${c.visitCount},${new Date(c.lastVisit).toLocaleDateString()}`);
      });

      csvRows.push("");
      csvRows.push("PENDING CREDITS AND EXPOSURES");
      csvRows.push("Invoice ID,Customer Name,Customer ID,Due Amount (Rs.),Due Date,Status");

      data?.pendingCredits?.forEach((c: any) => {
        csvRows.push(`${c.salesInvoiceId},"${c.customerName}",#${c.customerId},${c.dueAmount},${new Date(c.dueDate).toLocaleDateString()},${c.status}`);
      });

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Customer_Reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success("Customer report exported successfully!");
    } catch (err) {
      toast.dismiss();
      toast.error("Could not export the report.");
    }
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
            Customer <span className="text-emerald-500">Reports</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Strategic analytics for customer retention and financial health.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/20"
          >
            <Download size={18} /> Export PDF Report
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-bold text-gray-300"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={fetchReports}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-bold"
          >
            <History size={18} /> Refresh Audit
          </button>
        </div>
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
                  <tr className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <th className="py-2 px-3">Identity</th>
                    <th className="py-2 px-3 text-right">Transactions</th>
                    <th className="py-2 px-3 text-right">Lifetime Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.topSpenders.map((customer: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {customer.customerName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                              {customer.customerName}
                            </div>
                            <div className="text-[11px] text-gray-500 leading-none">ID: #{customer.customerId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right text-xs font-medium text-gray-300">{customer.orderCount} orders</td>
                      <td className="py-2 px-3 text-right">
                        <div className="text-sm font-bold text-white">Rs. {customer.totalSpent.toLocaleString()}</div>
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
