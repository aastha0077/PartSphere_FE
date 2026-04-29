import React, { useEffect, useState } from 'react';
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
  ExternalLink,
  MoreVertical,
  User
} from 'lucide-react';
import api from '../../services/api';
import { Vendor } from '../../types';
import Modal from '../../components/common/Modal';

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'General'
  });

  const fetchVendors = async () => {
    try {
      const res = await api.get('/admin/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleOpenModal = (vendor: Vendor | null = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({ 
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        category: (vendor as any).category || 'General'
      });
    } else {
      setEditingVendor(null);
      setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', category: 'General' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) await api.put(`/admin/vendors/${editingVendor.id}`, formData);
      else await api.post('/admin/vendors', formData);
      setIsModalOpen(false);
      fetchVendors();
    } catch (err) {
      console.error('Error saving vendor');
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Supply <span className="text-gradient">Partners</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Manage your procurement sources and vendor relationships.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
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
          <Plus size={20} /> Register Vendor
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by company or contact person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>Loading partners...</div>
          ) : filteredVendors.map((vendor, idx) => (
            <motion.div 
              key={vendor.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8, scale: 1.01 }} 
              className="glass-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  borderRadius: '18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--accent-primary)' 
                }}>
                  <Truck size={32} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenModal(vendor)} style={{ padding: '8px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}><Edit2 size={16} /></button>
                  <button onClick={async () => {
                    if (window.confirm('Delete vendor?')) {
                      try {
                        await api.delete(`/admin/vendors/${vendor.id}`);
                        fetchVendors();
                      } catch (e) { console.error('Failed to delete'); }
                    }
                  }} style={{ padding: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.25rem' }}>{vendor.name}</h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '4px 10px', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--accent-primary)', 
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  {(vendor as any).category || 'General Partner'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="var(--text-muted)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Person</p>
                    <p style={{ fontSize: '0.95rem' }}>{vendor.contactPerson}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={14} color="var(--text-muted)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</p>
                    <p style={{ fontSize: '0.95rem' }}>{vendor.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={14} color="var(--text-muted)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</p>
                    <p style={{ fontSize: '0.95rem' }}>{vendor.phone}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '3px' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{vendor.address}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVendor ? 'Edit Vendor Details' : 'Register New Vendor'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Company Name</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Contact Person</label>
            <input value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category</label>
            <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phone</label>
            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} required />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Office Address</label>
            <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '80px' }} required />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: '700' }}>Save Vendor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vendors;
