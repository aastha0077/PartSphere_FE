import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Eye, Calendar, Mail, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { toastApiError } from '../../utils/feedback';
import TablePagination from '../../components/common/TablePagination';
import Modal from '../../components/common/Modal';

interface OrderDetail {
  id: number;
  customerName: string;
  staffName: string;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  date: string;
  items: { partName: string; quantity: number; unitPrice: number; totalPrice: number }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    } catch (err: unknown) {
      toastApiError(err, { context: 'load', fallback: 'Could not load orders. Please refresh the page.' });
    } finally {
      setLoading(false);
    }
  };

  const viewOrder = async (id: number) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const res = await api.get(`/orders/${id}`);
      setSelectedOrder(res.data);
    } catch (err) {
      toastApiError(err, { context: 'load', fallback: 'Could not load order details.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEmailInvoice = async (id: number) => {
    try {
      const toastId = toast.loading('Sending invoice email...');
      await api.post(`/orders/${id}/email`);
      toast.success('Invoice emailed successfully to customer!', { id: toastId });
    } catch (err: unknown) {
      toastApiError(err, { context: 'save', fallback: 'Could not send the invoice email. Check that the customer has a valid email.' });
    }
  };

  const handleCompleteOrder = async (id: number) => {
    try {
      const toastId = toast.loading('Completing order...');
      await api.put(`/orders/${id}/complete`);
      toast.success('Order completed successfully!', { id: toastId });
      fetchOrders();
    } catch (err: unknown) {
      toastApiError(err, { context: 'save', fallback: 'Could not complete this order. It may already be paid or stock may be insufficient.' });
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (s) =>
          s.id.toString().includes(searchQuery) ||
          s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.staffName?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Sales Orders</h1>
          <p className="text-gray-400">View POS transactions and email invoices to customers.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-64"
          />
        </div>
      </div>

      <div className="bg-[#11111a] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2 font-bold">Order ID</th>
                <th className="px-4 py-2 font-bold">Date</th>
                <th className="px-4 py-2 font-bold">Customer</th>
                <th className="px-4 py-2 font-bold">Processed By</th>
                <th className="px-4 py-2 font-bold">Amount</th>
                <th className="px-4 py-2 font-bold">Status</th>
                <th className="px-4 py-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <ShoppingCart size={32} className="mx-auto mb-2 opacity-20" />
                    No orders found.
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-white">#{order.id}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-500" />
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-white text-sm font-medium">{order.customerName || 'Walk-in Customer'}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{order.staffName || 'System'}</td>
                    <td className="px-4 py-2 text-emerald-400 text-sm font-bold">Rs. {order.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                        order.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEmailInvoice(order.id)}
                          className="p-1 hover:bg-emerald-500/10 rounded transition-colors text-gray-400 hover:text-emerald-400"
                          title="Email Invoice to Customer"
                        >
                          <Mail size={14} />
                        </button>
                        {order.paymentStatus === 'Pending' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="p-1 hover:bg-blue-500/10 rounded transition-colors text-gray-400 hover:text-blue-400"
                            title="Complete Order"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => viewOrder(order.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                          title="View Details"
                        >
                          <Eye size={14} />
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

      <Modal
        isOpen={!!selectedOrder || detailLoading}
        onClose={() => { setSelectedOrder(null); setDetailLoading(false); }}
        title={selectedOrder ? `Order #${selectedOrder.id}` : 'Order Details'}
        maxWidth="640px"
      >
        {detailLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500"></div>
            <p className="text-gray-400 mt-3 text-sm">Loading order...</p>
          </div>
        ) : selectedOrder ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Customer</span><p className="text-white font-medium">{selectedOrder.customerName}</p></div>
              <div><span className="text-gray-500">Staff</span><p className="text-white font-medium">{selectedOrder.staffName}</p></div>
              <div><span className="text-gray-500">Date</span><p className="text-white">{new Date(selectedOrder.date).toLocaleString()}</p></div>
              <div><span className="text-gray-500">Payment</span><p className="text-white">{selectedOrder.paymentMethod} · {selectedOrder.paymentStatus}</p></div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Line Items</p>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-white/5">
                  <span className="text-gray-300">{item.quantity}× {item.partName}</span>
                  <span className="text-white">Rs. {item.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span className="text-emerald-400">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
            </div>
            {selectedOrder.discountAmount > 0 && (
              <p className="text-sm text-emerald-500">Loyalty discount: Rs. {selectedOrder.discountAmount.toLocaleString()}</p>
            )}
            <button
              onClick={() => handleEmailInvoice(selectedOrder.id)}
              className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <Mail size={18} /> Email Invoice
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Orders;
