import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Car, 
  History, 
  Edit2, 
  Search, 
  MapPin, 
  CreditCard, 
  Calendar, 
  ExternalLink,
  Send,
  X,
  Package,
  ArrowRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<CustomerHistory | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [includeVehicle, setIncludeVehicle] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    vehicleNumber: '',
    brand: '',
    model: '',
    mileage: 0
  });

  const fetchCustomers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/staff/customers/search?query=${encodeURIComponent(query)}` : '/staff/customers';
      const res = await api.get(endpoint);
      setCustomers(res.data);
    } catch (err: unknown) {
      toastApiError(err, { context: 'load', fallback: 'Could not load customers.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchCustomers]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedCustomers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return customers.slice(start, start + pageSize);
  }, [customers, safePage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const fetchHistory = async (id: number) => {
    setSelectedHistory(null);
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

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', password: '', vehicleNumber: '', brand: '', model: '', mileage: 0 });
    setEditingId(null);
    setIncludeVehicle(true);
  };

  const openEdit = (customer: any) => {
    setEditingId(customer.id);
    setIncludeVehicle(false);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      password: '',
      vehicleNumber: '',
      brand: '',
      model: '',
      mileage: 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/staff/customers/${editingId}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        });
        toast.success('Customer profile updated');
      } else {
        const payload: Record<string, unknown> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password
        };
        if (includeVehicle && formData.vehicleNumber.trim()) {
          payload.vehicle = {
            vehicleNumber: formData.vehicleNumber.trim(),
            brand: formData.brand.trim(),
            model: formData.model.trim(),
            mileage: formData.mileage
          };
        }
        await api.post('/staff/customers', payload);
        toast.success('Customer and vehicle registered');
      }
      setIsModalOpen(false);
      resetForm();
      fetchCustomers(searchQuery);
    } catch (err) {
      toastApiError(err, { context: 'save', fallback: 'Could not save customer. Check name, email, and phone.' });
    }
  };

  const sendInvoiceEmail = async (id: number) => {
    try {
      await api.post(`/orders/${id}/email`);
      toast.success('Invoice dispatched to customer email');
    } catch (err) {
      toastApiError(err, { context: 'save', fallback: 'Could not email invoice. The customer may not have a valid email.' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Customer <span className="text-gradient">Registry</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Search, manage, and audit customer vehicle relationships.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setViewMode('grid')} className="glass" style={{ padding: '10px 16px', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: viewMode === 'grid' ? '1px solid var(--accent-primary)' : '1px solid transparent', background: viewMode === 'grid' ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
              <LayoutGrid size={18} /> Grid View
            </button>
            <button onClick={() => setViewMode('table')} className="glass" style={{ padding: '10px 16px', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: viewMode === 'table' ? '1px solid var(--accent-primary)' : '1px solid transparent', background: viewMode === 'table' ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
              <List size={18} /> Table View
            </button>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }} 
            style={{ 
              padding: '12px 24px', 
              background: 'var(--accent-gradient)', 
              color: 'white', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontWeight: '700',
              boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)'
            }}
          >
            <UserPlus size={20} /> New Profile
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, phone, ID, or vehicle number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              color: 'white'
            }}
          />
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="glass-card animate-pulse" style={{ height: '220px' }} />
             ))
          ) : customers.length === 0 ? (
             <div className="glass-card col-span-full text-center py-16 text-gray-500">
               No customer profiles match your query parameters.
             </div>
          ) : pagedCustomers.map(customer => (
            <motion.div 
              key={customer.id} 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card table-row-hover"
              style={{ position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '52px', height: '52px', background: 'var(--accent-gradient)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
                    {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{customer.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: '800', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                         ID: #{customer.id}
                      </span>
                      {customer.totalSpent > 5000 && (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                          VIP LOYALTY
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '800', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                         {customer.loyaltyPoints || 0} PTS
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => openEdit(customer)} style={{ color: 'var(--text-muted)', background: 'transparent' }} title="Edit"><Edit2 size={18} /></button>
                  <button onClick={() => fetchHistory(customer.id)} style={{ color: 'var(--accent-primary)', background: 'transparent' }} title="View history"><ExternalLink size={20} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Phone size={14} className="text-indigo-400" /> {customer.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Car size={14} className="text-indigo-400" /> {customer.vehicleNumbers?.join(', ') || 'No Vehicles'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => fetchHistory(customer.id)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <History size={16} /> Audit History
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicles</th>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loyalty Status</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="animate-pulse" style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No customer profiles match your query parameters.
                  </td>
                </tr>
              ) : pagedCustomers.map(customer => (
                <tr key={customer.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: 'var(--accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.8rem' }}>
                        {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'white' }}>{customer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {customer.phone}</div>
                      {customer.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {customer.email}</div>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {customer.vehicleNumbers?.join(', ') || 'None'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '800', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '20px' }}>
                         {customer.loyaltyPoints || 0} PTS
                      </span>
                      {customer.totalSpent > 5000 && (
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '20px' }}>
                          VIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => openEdit(customer)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }} title="Edit">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => fetchHistory(customer.id)} style={{ padding: '6px 10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }} title="Audit History">
                        <History size={14} /> Audit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && customers.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem' }}>
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={customers.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 9, 12, 24]}
            itemLabel="customers"
          />
        </div>
      )}

      {/* Customer Detail Modal */}
      <Modal 
        isOpen={!!selectedHistory} 
        onClose={() => setSelectedHistory(null)} 
        title={`${selectedHistory?.customer.name}'s Profile`}
        maxWidth="1000px"
      >
        {isHistoryLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%' }} />
            <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading customer history...</p>
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* Profile Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', background: 'var(--accent-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                   {selectedHistory?.customer.name[0]}
                </div>
                <h2 style={{ fontWeight: '800' }}>{selectedHistory?.customer.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer since {new Date().getFullYear()}</p>
             </div>

             <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Contact Intel</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                      <Phone size={16} className="text-indigo-400" /> {selectedHistory?.customer.phone}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                      <Mail size={16} className="text-indigo-400" /> {selectedHistory?.customer.email}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                      <MapPin size={16} className="text-indigo-400" style={{ marginTop: '2px' }} /> {selectedHistory?.customer.address}
                   </div>
                </div>
             </div>

             <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--accent-gradient)', border: 'none' }}>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '700' }}>LIFETIME SPEND</p>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>Rs. {selectedHistory?.totalSpent.toLocaleString()}</h2>
                {selectedHistory?.isLoyalCustomer && (
                   <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', color: 'white' }}>
                      LOYALTY TIER ACTIVATED
                   </div>
                )}
             </div>
          </div>

          {/* Activity Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {/* Vehicles */}
             <section>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Car size={20} color="var(--accent-primary)" /> Registered Assets
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   {selectedHistory?.vehicles.map((v, i) => (
                      <div key={i} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '800', fontSize: '1rem' }}>{v.brand} {v.model}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{v.vehicleNumber}</span>
                         </div>
                         <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Mileage: {v.mileage.toLocaleString()} KM
                         </div>
                      </div>
                   ))}
                </div>
             </section>

             {/* Purchase History */}
             <section>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <CreditCard size={20} color="var(--success)" /> Purchase History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {selectedHistory?.purchases.map((p, i) => (
                      <div key={i} className="glass-card" style={{ padding: '1rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                               <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>Invoice #{p.id}</p>
                               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(p.date).toLocaleDateString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                               <p style={{ fontWeight: '800', fontSize: '1.1rem' }}>Rs. {p.totalAmount.toLocaleString()}</p>
                               <button 
                                 onClick={() => sendInvoiceEmail(p.id)}
                                 style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-primary)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                               >
                                  <Send size={12} /> Email Invoice
                               </button>
                            </div>
                         </div>
                         <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                            {p.items.map((item: any, idx: number) => (
                               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  <span>{item.quantity}x {item.partName}</span>
                                  <span>Rs. {item.totalPrice.toLocaleString()}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             </section>

             {/* Appointments */}
             <section>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Calendar size={20} color="var(--warning)" /> Appointments
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {selectedHistory?.appointments.map((a, i) => (
                      <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{a.description}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleString()}</p>
                         </div>
                         <span style={{ fontSize: '0.7rem', fontWeight: '800', color: a.status === 'Completed' ? 'var(--success)' : 'var(--warning)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                            {a.status}
                         </span>
                      </div>
                   ))}
                </div>
             </section>
          </div>
        </div>
        )}
      </Modal>

      {/* Registration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingId ? 'Edit Customer' : 'New Customer Registration'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
             <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Identity</label>
             <input placeholder="e.g. Ram Bahadur" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="glass" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email</label>
                <input placeholder="ram.bahadur@example.com" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="glass" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white' }} required />
             </div>
             <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone</label>
                <input placeholder="+977 98XXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="glass" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white' }} required />
             </div>
          </div>
          <div>
             <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Residential Address</label>
             <textarea placeholder="Primary residence for billing..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="glass" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', minHeight: '100px' }} />
          </div>

          {!editingId && (
            <>
              <div>
                 <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Portal Password (Optional)</label>
                 <input type="password" placeholder="Create a secure password for portal access" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="glass" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '0.5rem' }}>
                <input type="checkbox" checked={includeVehicle} onChange={e => setIncludeVehicle(e.target.checked)} />
                Register vehicle with customer
              </label>
              {includeVehicle && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Vehicle Details</p>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>License Plate / Vehicle Number *</label>
                    <input placeholder="e.g. AB-1234" value={formData.vehicleNumber} onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })} className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required={includeVehicle} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Brand *</label>
                      <input placeholder="e.g. Toyota" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required={includeVehicle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Model *</label>
                      <input placeholder="e.g. Camry" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required={includeVehicle} />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Current Mileage (km)</label>
                    <input type="number" placeholder="e.g. 50000" value={formData.mileage || ''} onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })} className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} />
                  </div>
                </div>
              )}
            </>
          )}
          
          <button type="submit" style={{ padding: '16px', background: 'var(--accent-gradient)', borderRadius: '12px', color: 'white', fontWeight: '800', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {editingId ? 'Save Changes' : 'Register Customer'} <ArrowRight size={18} />
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;