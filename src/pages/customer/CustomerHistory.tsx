import React, { useState, useEffect } from 'react';
import { History, ShoppingBag, DollarSign, Package } from 'lucide-react';
import api from '../../services/api';

const CustomerHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/customer/history');
        setHistory(res.data.purchases || res.data); // DTO map depending on what the API returns exactly
      } catch (err) {
        console.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <History className="text-indigo-500" />
          Order <span className="text-indigo-500">History</span>
        </h1>
        <p className="text-gray-400 mt-1">Review your past purchases, invoices, and service parts.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading your history...</p>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-[#0d0d12] border border-white/5 rounded-2xl">
            <ShoppingBag size={48} className="mx-auto mb-4 text-white/10" />
            <p>You haven't made any purchases yet.</p>
          </div>
        ) : (
          history.map((order: any) => (
            <div key={order.id} className="bg-[#0d0d12] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-colors">
              <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/[0.01]">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Invoice #{order.id}</p>
                  <p className="text-white font-medium">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <DollarSign size={18} />
                    {order.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                  <Package size={16} /> Purchased Items
                </h4>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                      <div>
                        <p className="text-white font-medium text-sm">{item.partName || 'Service Item'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × ${item.unitPrice?.toFixed(2)}</p>
                      </div>
                      <p className="font-mono text-gray-300">${item.totalPrice?.toFixed(2) || (item.quantity * item.unitPrice)?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerHistory;