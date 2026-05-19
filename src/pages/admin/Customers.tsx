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
    address: '',
    password: ''
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
      setFormData({ name: '', phone: '', email: '', address: '', password: '' });
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
      address: customer.address || '',
      password: ''
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
          onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', email: '', address: '', password: '' }); setIsModalOpen(true); }}
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

      <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Client Name</th>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Contact Info</th>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Address</th>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Loyalty</th>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading customer records...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No clients match your search criteria.
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="table-row-hover"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--accent-secondary)' }}>
                      #CS{customer.id.toString().padStart(4, '0')}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'var(--accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                          {customer.name[0]}
                        </div>
                        <span style={{ fontWeight: '700', color: 'white' }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} opacity={0.6} /> {customer.phone}
                        </span>
                        {customer.email && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} opacity={0.6} /> {customer.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {customer.address ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={12} opacity={0.6} /> {customer.address}
                        </span>
                      ) : (
                        <span className="italic opacity-40">Not Registered</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700',
                        background: 'rgba(251, 191, 36, 0.1)', 
                        color: '#fbbf24'
                      }}>
                        {customer.loyaltyPoints || 0} pts
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => fetchHistory(customer.id)}
                          style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-secondary)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                          title="View Purchase History"
                        >
                          <History size={14} /> History
                        </button>
                        <button 
                          onClick={() => handleEdit(customer)}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                          title="Delete Client"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
          {!editingId && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Portal Password (Optional)</label>
              <input 
                type="password"
                placeholder="Secure password for portal access"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              />
            </div>
          )}
          <button type="submit" style={{ padding: '14px', background: 'var(--accent-gradient)', borderRadius: '10px', color: 'white', fontWeight: '700', marginTop: '1rem', boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)' }}>
            {editingId ? "Save Changes" : "Create Account"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCustomers;