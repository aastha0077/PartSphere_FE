import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Edit2, 
  Search,
  History,
  Car,
  ChevronRight,
  CreditCard,
  Calendar,
  ExternalLink,
  Send,
  Trash2
} from 'lucide-react';
import api from '../../services/api';
import type { Customer } from '../../types';
import Modal from '../../components/common/Modal';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';
import TablePagination from '../../components/common/TablePagination';

interface CustomerHistory {
  customer: Customer;
  vehicles: any[];
  purchases: any[];
  appointments: any[];
  totalSpent: number;
  isLoyalCustomer: boolean;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [selectedHistory, setSelectedHistory] = useState<CustomerHistory | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search)
      ),
    [customers, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedCustomers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, safePage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/customers/${editingId}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/admin/customers', formData);
        toast.success('Customer registered successfully');
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (err) {
      toastApiError(err, { context: 'save', fallback: 'Could not save customer details.' });
    }
  };

  const fetchHistory = async (id: number) => {
    setIsHistoryLoading(true);
    try {
      const res = await api.get(`/staff/customers/${id}/history`);
      setSelectedHistory(res.data);
    } catch (err) {
      toastApiError(err, { context: 'load', fallback: 'Could not load purchase history for this customer.' });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const sendInvoiceEmail = async (id: number) => {
    try {
      await api.post(`/orders/${id}/email`);
      toast.success('Invoice dispatched to customer email');
    } catch (err) {
      toastApiError(err, { context: 'save', fallback: 'Could not email the invoice. The customer may not have a valid email.' });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Permanently delete this client and their associated user account? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/customers/${id}`);
      toast.success('Client deleted successfully');
      fetchCustomers();
    } catch (err: unknown) {
      toastApiError(err, { context: 'delete', fallback: 'Could not delete this client.' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Customer <span className="text-gradient">Base</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Comprehensive directory and management of all PartSphere clients.
          </p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', email: '', address: '' }); setIsModalOpen(true); }}
          style={{ 
            padding: '12px 24px', 
            background: 'var(--accent-gradient)', 
            color: 'white', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontWeight: '600',
            boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)'
          }}
        >
          <UserPlus size={20} /> Register New Client
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            placeholder="Search by name, phone, or account ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 14px 14px 52px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '12px', 
              color: 'white',
              fontSize: '1rem'
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {loading ? (
             [1,2,3].map(i => <div key={i} className="glass-card" style={{ height: '200px', opacity: 0.5 }} />)
          ) : filteredCustomers.length === 0 ? (
            <div className="glass-card col-span-full text-center py-16 text-gray-500">
              No clients match your search criteria.
            </div>
          ) : pagedCustomers.map((customer, idx) => (
            <motion.div 
              key={customer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card hover-glow"
              style={{ position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--accent-gradient)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)' }}>
                    <Users size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{customer.name}</h3>
                    <p style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>ID: #CS{customer.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleEdit(customer)}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                    title="Edit Customer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                    title="Delete Customer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Phone size={16} opacity={0.6} /> {customer.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Mail size={16} opacity={0.6} /> {customer.email || 'No email provided'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', gridColumn: 'span 2' }}>
                  <MapPin size={16} opacity={0.6} /> {customer.address || 'No address registered'}
                </div>
              </div>

                <button 
                  onClick={() => fetchHistory(customer.id)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <History size={16} /> Audit History
                </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredCustomers.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem' }}>
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={filteredCustomers.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 9, 12, 24]}
            itemLabel="clients"
          />
        </div>
      )}

      <Modal 
        isOpen={!!selectedHistory} 
        onClose={() => setSelectedHistory(null)} 
        title={`${selectedHistory?.customer.name}'s Profile`}
        maxWidth="900px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', background: 'var(--accent-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                   {selectedHistory?.customer.name[0]}
                </div>
                <h2 style={{ fontWeight: '800' }}>{selectedHistory?.customer.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer ID: #CS{selectedHistory?.customer.id}</p>
             </div>

             <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--accent-gradient)', border: 'none' }}>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '700' }}>LIFETIME SPEND</p>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>Rs. {selectedHistory?.totalSpent.toLocaleString()}</h2>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
             <section>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Car size={20} color="var(--accent-primary)" /> Assets
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   {selectedHistory?.vehicles.map((v, i) => (
                      <div key={i} className="glass-card" style={{ padding: '1rem' }}>
                         <p style={{ fontWeight: '800' }}>{v.brand} {v.model}</p>
                         <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{v.vehicleNumber}</p>
                      </div>
                   ))}
                </div>
             </section>

             <section>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <CreditCard size={20} color="var(--success)" /> Orders
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {selectedHistory?.purchases.map((p, i) => (
                      <div key={i} className="glass-card" style={{ padding: '1rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                               <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>Order #{p.id}</p>
                               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(p.date).toLocaleDateString()}</p>
                            </div>
                            <p style={{ fontWeight: '800' }}>Rs. {p.totalAmount.toLocaleString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingId(null); }} 
        title={editingId ? "Update Client Profile" : "Register New Client"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              required 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Physical Address</label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '100px' }} 
            />
          </div>
          <button type="submit" style={{ padding: '14px', background: 'var(--accent-gradient)', borderRadius: '10px', color: 'white', fontWeight: '700', marginTop: '1rem', boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)' }}>
            {editingId ? "Save Changes" : "Create Account"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCustomers;