import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Search,
  RefreshCw,
  Calendar,
  FileText,
  DollarSign,
  Trash2
} from 'lucide-react';
import type { PurchaseInvoice } from '../../services/purchaseService';
import { purchaseService } from '../../services/purchaseService';
import type { Vendor } from '../../services/vendorService';
import { vendorService } from '../../services/vendorService';
import type { VehiclePart } from '../../types';
import { toast } from 'sonner';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

const Purchases = () => {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<VehiclePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [vendorId, setVendorId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<{ partId: number | '', quantity: number, unitCost: number }[]>([
    { partId: '', quantity: 1, unitCost: 0 }
  ]);

  const fetchData = async () => {
    try {
      const [purchasesData, vendorsData, partsData] = await Promise.all([
        purchaseService.getAll(),
        vendorService.getAll(),
        api.get('/parts')
      ]);
      setPurchases(purchasesData);
      setVendors(vendorsData);
      setParts(partsData.data.items || partsData.data);
    } catch (err) {
      toast.error('Failed to load purchase data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setVendorId('');
    setNotes('');
    setPurchaseItems([{ partId: '', quantity: 1, unitCost: 0 }]);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setPurchaseItems([...purchaseItems, { partId: '', quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (purchaseItems.length === 1) return;
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...purchaseItems];
    (newItems[index] as any)[field] = value;

    if (field === 'partId' && value !== '') {
      const selectedPart = parts.find(p => p.id === Number(value));
      if (selectedPart && newItems[index].unitCost === 0) {
        newItems[index].unitCost = selectedPart.price;
      }
    }

    setPurchaseItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return toast.error('Please select a vendor');

    const validItems = purchaseItems.filter(item => item.partId !== '' && item.quantity > 0 && item.unitCost > 0);
    if (validItems.length === 0) return toast.error('Please add at least one valid item');

    const formattedItems = validItems.map(item => ({
      vehiclePartId: Number(item.partId),
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost)
    }));

    try {
      await purchaseService.create({
        vendorId: Number(vendorId),
        notes,
        items: formattedItems
      });
      toast.success('Purchase invoice created & stock updated successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating purchase invoice');
    }
  };

  const filteredPurchases = purchases.filter(p =>
    p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ShoppingCart className="text-emerald-500" />
            Purchase <span className="text-emerald-500">Invoices</span>
          </h1>
          <p className="text-gray-400 mt-1">Record incoming stock and manage vendor purchases.</p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={20} />
          New Purchase
        </button>
      </div>

      <div className="bg-[#0d0d12] border border-white/5 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by vendor name or invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-[#0d0d12] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">Invoice ID</th>
                <th className="p-4 font-bold">Vendor</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Items</th>
                <th className="p-4 font-bold text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-4" size={24} />
                    Loading purchases...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 italic">
                    No purchase invoices found.
                  </td>
                </tr>
              ) : filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                      <FileText size={16} /> #{purchase.id}
                    </div>
                  </td>
                  <td className="p-4 text-white font-medium">{purchase.vendorName}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {purchase.category || 'Inventory'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(purchase.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">
                    {purchase.items.length} item(s)
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1 font-bold text-white bg-white/5 px-3 py-1 rounded-lg">
                      <span className="text-emerald-500 text-xs mr-1">Rs.</span>
                      {purchase.totalAmount.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Purchase">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Vendor</label>
              <select
                value={vendorId}
                onChange={e => setVendorId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500"
                required
              >
                <option value="">-- Choose a vendor --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.contactPerson})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notes (Optional)</label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Invoice reference or notes..."
                className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-bold text-gray-500 uppercase">Purchase Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {purchaseItems.map((item, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-[10px] text-gray-500 uppercase mb-1 block">Part</span>
                    <select
                      value={item.partId}
                      onChange={e => handleItemChange(index, 'partId', e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 bg-[#0d0d12] border border-white/10 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
                      required
                    >
                      <option value="">-- Select Part --</option>
                      {parts.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <span className="text-[10px] text-gray-500 uppercase mb-1 block">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0d0d12] border border-white/10 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <span className="text-[10px] text-gray-500 uppercase mb-1 block">Unit Cost</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unitCost}
                      onChange={e => handleItemChange(index, 'unitCost', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0d0d12] border border-white/10 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div className="w-32 pt-2">
                    <span className="text-[10px] text-gray-500 uppercase mb-1 block">Line Total</span>
                    <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 font-mono">
                      Rs. {(item.quantity * item.unitCost).toLocaleString()}
                    </div>
                  </div>
                  {purchaseItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 mb-0.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-4">
                <span className="text-sm font-bold text-emerald-500 uppercase">Grand Total</span>
                <span className="text-xl font-bold text-white font-mono">
                  Rs. {purchaseItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20">Confirm Purchase</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;
