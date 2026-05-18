import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';
import { partService } from '../../services/partService';
import type { Part } from '../../services/partService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TablePagination from '../../components/common/TablePagination';
import api from '../../services/api';

const Parts = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isStaff = user?.role === 'Staff';

  const [parts, setParts] = useState<Part[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: 0,
    stockQuantity: 0,
    description: '',
    imageUrl: '',
    vendorId: 1 // Mock vendor for now
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await partService.getAll({ 
        search, 
        category, 
        page, 
        pageSize 
      });
      setParts(data.items);
      setTotal(data.total);
    } catch (err: any) {
      toastApiError(err, { context: 'load', fallback: 'Could not load parts inventory.' });
    } finally {
      setLoading(false);
    }
  }, [search, category, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleOpenModal = (part: Part | null = null) => {
    if (!isAdmin) return;
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        brand: part.brand,
        category: part.category,
        price: part.price,
        stockQuantity: part.stockQuantity,
        description: part.description,
        imageUrl: part.imageUrl || '',
        vendorId: part.vendorId
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        brand: '',
        category: '',
        price: 0,
        stockQuantity: 0,
        description: '',
        imageUrl: '',
        vendorId: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenStockModal = (part: Part) => {
    setEditingPart(part);
    setFormData({ ...formData, stockQuantity: part.stockQuantity });
    setIsStockModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const res = await api.post<{ url: string }>('/upload', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
      toast.success('Image uploaded successfully to Cloudinary!');
    } catch (err: any) {
      toast.error('Image upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPart) {
        await partService.update(editingPart.id, { 
          ...formData, 
          rowVersion: editingPart.rowVersion 
        });
        toast.success('Part updated successfully');
      } else {
        await partService.create(formData);
        toast.success('New part registered');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toastApiError(err, { context: 'save', fallback: 'Could not save part details.' });
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;
    try {
      await partService.updateStock(editingPart.id, formData.stockQuantity, editingPart.rowVersion);
      toast.success('Stock levels synchronized');
      setIsStockModalOpen(false);
      fetchData();
    } catch (err: any) {
      toastApiError(err, { context: 'save', fallback: 'Could not update stock levels.' });
    }
  };

  const handleDelete = (id: number) => {
    if (!isAdmin) return;
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await partService.delete(deleteConfirm.id);
      toast.success('Part removed from inventory');
      fetchData();
    } catch (err: unknown) {
      toastApiError(err, { context: 'delete', fallback: 'Could not delete this part.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Package className="text-indigo-500" />
            Inventory <span className="text-indigo-500">Management</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage, track, and update vehicle parts stock levels.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={20} />
            Register Part
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="md:col-span-4 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none transition-all appearance-none"
          >
            <option value="" className="bg-[#1a1a2e]">All Categories</option>
            <option value="Engine" className="bg-[#1a1a2e]">Engine</option>
            <option value="Transmission" className="bg-[#1a1a2e]">Transmission</option>
            <option value="Brakes" className="bg-[#1a1a2e]">Brakes</option>
            <option value="Suspension" className="bg-[#1a1a2e]">Suspension</option>
            <option value="Electrical" className="bg-[#1a1a2e]">Electrical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d12] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="px-4 py-2 font-bold">Part Info</th>
                <th className="px-4 py-2 font-bold">Category</th>
                <th className="px-4 py-2 font-bold text-right">Price</th>
                <th className="px-4 py-2 font-bold text-center">Stock</th>
                <th className="px-4 py-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={16} />
                    Syncing with warehouse...
                  </td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                    No matching parts found in inventory.
                  </td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-md flex items-center justify-center text-indigo-400 shrink-0 overflow-hidden border border-white/5 shadow-inner">
                          {part.imageUrl ? (
                            <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold leading-snug">{part.name}</p>
                          <p className="text-[11px] text-gray-500 leading-none">{part.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                        {part.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-white text-sm font-mono font-bold">
                      Rs. {part.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-sm font-bold ${part.stockQuantity < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {part.stockQuantity}
                        </span>
                        {part.isLowStock && (
                          <span className="flex items-center gap-0.5 text-[9px] text-red-500 font-bold uppercase animate-pulse">
                            <AlertTriangle size={8} />
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(isAdmin || isStaff) && (
                          <button 
                            onClick={() => handleOpenStockModal(part)}
                            className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            title="Update Stock"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => handleOpenModal(part)}
                              className="p-1 text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                              title="Edit Part"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(part.id)}
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete Part"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="parts"
        />
      </div>

      {/* Edit/Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPart ? 'Edit Part Details' : 'Register New Vehicle Part'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col items-center justify-center p-4 bg-white/5 border border-dashed border-white/15 rounded-xl hover:border-indigo-500/50 transition-colors relative group">
              {formData.imageUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 group">
                  <img src={formData.imageUrl} alt="Part Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 font-bold transition-opacity text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full flex flex-col items-center gap-2 py-3 text-center">
                  {uploading ? (
                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                  ) : (
                    <UploadCloud className="text-gray-400 hover:text-indigo-400 transition-colors" size={24} />
                  )}
                  <span className="text-xs font-semibold text-gray-400">
                    {uploading ? 'Uploading to Cloudinary...' : 'Click to Upload Part Image'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Name</label>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand</label>
              <input 
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
              >
                <option value="Engine">Engine</option>
                <option value="Transmission">Transmission</option>
                <option value="Brakes">Brakes</option>
                <option value="Suspension">Suspension</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (Rs.)</label>
              <input 
                type="number" step="0.01" required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Stock</label>
              <input 
                type="number" required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
            >
              {editingPart ? 'Save Changes' : 'Create Part'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Update Modal */}
      <Modal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
        title="Quick Stock Update"
      >
        <form onSubmit={handleStockUpdate} className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Updating stock for <span className="text-white font-bold">{editingPart?.name}</span>.
            </p>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Quantity</label>
            <input 
              type="number" required min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 text-center text-2xl font-mono"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
            >
              Update Levels
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to remove this part from the inventory? This action cannot be undone."
        confirmText="Delete Part"
        type="danger"
      />
    </div>
  );
};

export default Parts;