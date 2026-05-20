import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  Search,
  User,
  RefreshCw
} from 'lucide-react';
import { vendorService } from '../../services/vendorService';
import type { Vendor } from '../../services/vendorService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TablePagination from '../../components/common/TablePagination';

const Vendors = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    category: 'General'
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  const fetchVendors = async () => {
    try {
      const data = await vendorService.getAll();
      setVendors(data);
    } catch (err: any) {
      toastApiError(err, { context: 'load', fallback: 'Could not load vendors.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchVendors(); 
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredVendors = useMemo(
    () =>
      vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
          v.contact.toLowerCase().includes(search.toLowerCase())
      ),
    [vendors, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedVendors = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, safePage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleOpenModal = (vendor: Vendor | null = null) => {
    if (!isAdmin) return;
    
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({ 
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        contact: vendor.contact,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        category: vendor.category || 'General'
      });
    } else {
      setEditingVendor(null);
      setFormData({ name: '', contactPerson: '', contact: '', email: '', phone: '', address: '', category: 'General' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await vendorService.update(editingVendor.id, formData);
        toast.success('Vendor details updated successfully');
      } else {
        await vendorService.create(formData);
        toast.success('New vendor registered');
      }
      setIsModalOpen(false);
      fetchVendors();
    } catch (err: any) {
      toastApiError(err, { context: 'save', fallback: 'Could not save vendor details.' });
    }
  };

  const handleDelete = (id: number) => {
    if (!isAdmin) return;
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await vendorService.delete(deleteConfirm.id);
      toast.success('Vendor removed successfully');
      fetchVendors();
    } catch (err: any) {
      toastApiError(err, { context: 'delete', fallback: 'Could not delete vendor. They may still have linked parts or purchases.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Truck className="text-indigo-500" />
            <span className="text-indigo-500">Vendors</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage procurement and suppliers.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={20} />
            Add Vendor
          </button>
        )}
      </div>

      <div className="bg-[#0d0d12] border border-white/5 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by company, contact person or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="animate-spin mb-4" size={32} />
              Loading partners...
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 italic">
              No vendors found matching your criteria.
            </div>
          ) : pagedVendors.map((vendor, idx) => (
            <motion.div 
              key={vendor.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }} 
              className="bg-[#0d0d12] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-indigo-500/30 transition-all group relative"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(vendor)} className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(vendor.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                  <Truck size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 leading-tight pr-12">{vendor.name}</h3>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold uppercase">
                    {vendor.category || 'General'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-500"><User size={16} /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Contact</p>
                    <p className="text-sm text-gray-300 font-medium">{vendor.contactPerson}</p>
                    <p className="text-xs text-gray-500">{vendor.contact}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-500"><Mail size={16} /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="text-sm text-gray-300 font-medium">{vendor.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-500"><Phone size={16} /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Phone</p>
                    <p className="text-sm text-gray-300 font-medium">{vendor.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-400 leading-relaxed">{vendor.address}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {!loading && filteredVendors.length > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={filteredVendors.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[6, 9, 12, 24]}
          itemLabel="vendors"
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVendor ? 'Edit Vendor Details' : 'Register New Vendor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Person</label>
              <input value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="e.g. Ram Bahadur" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / Title</label>
              <input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="e.g. Sales Manager" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Engine Parts" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
              <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 min-h-[80px]" required />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all">Save Vendor</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Partner"
        message="Are you sure you want to remove this vendor? This will fail if there are active inventory items linked to this partner."
        confirmText="Remove Vendor"
        type="danger"
      />
    </div>
  );
};

export default Vendors;
