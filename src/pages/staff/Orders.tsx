import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Eye, Calendar, Filter, Mail, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import TablePagination from '../../components/common/TablePagination';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const list = Array.isArray(res.data) ? res.data : [];
      list.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() || (b.id ?? 0) - (a.id ?? 0)
      );
      setOrders(list);
    } catch (err) {
      toast.error('Failed to load orders data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailInvoice = async (id: number) => {
    try {
      const toastId = toast.loading('Sending invoice email...');
      await api.post(`/orders/${id}/email`);
      toast.success('Invoice emailed successfully to customer!', { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send email invoice');
    }
  };

  const handleCompleteOrder = async (id: number) => {
    try {
      const toastId = toast.loading('Completing order...');
      await api.put(`/orders/${id}/complete`);
      toast.success('Order completed successfully!', { id: toastId });
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete order');
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders
        .filter(
          (s) =>
            s.id.toString().includes(searchQuery) ||
            s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.staffName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime() || (b.id ?? 0) - (a.id ?? 0)
        ),
    [orders, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safePage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Customer Orders</h1>
          <p className="text-gray-400">View and manage customer online orders and POS transactions.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-[#11111a] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-4 text-sm font-semibold text-gray-400">Order ID</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Customer</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Processed By</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                    No orders found.
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-sm text-white">#{order.id}</td>
                    <td className="p-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500" />
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">{order.customerName || 'Walk-in Customer'}</td>
                    <td className="p-4 text-gray-400">{order.staffName || 'System'}</td>
                    <td className="p-4 text-emerald-400 font-bold">Rs. {order.totalAmount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                        order.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEmailInvoice(order.id)}
                          className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-gray-400 hover:text-emerald-400"
                          title="Email Invoice to Customer"
                        >
                          <Mail size={18} />
                        </button>
                        {order.paymentStatus === 'Pending' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
                            title="Complete Order"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white" title="View Details">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && filteredOrders.length > 0 && (
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={filteredOrders.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="orders"
            />
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;