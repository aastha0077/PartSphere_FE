import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Phone, Mail, Car, History, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { Customer } from '../../types';
import Modal from '../../components/common/Modal';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/staff/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff/customers', formData);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert('Error registering customer');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Customer <span className="text-gradient">CRM</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your customer base and their vehicle history.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="glass" style={{ padding: '12px 24px', background: 'var(--accent-gradient)', color: 'white', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <UserPlus size={20} /> Register Customer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? <p>Loading customers...</p> : customers.map(customer => (
          <div key={customer.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{customer.name}</h3>
                  <p style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>{customer.loyaltyPoints} Points</p>
                </div>
              </div>
              <button style={{ color: 'var(--text-muted)', background: 'transparent' }}><Edit2 size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Mail size={16} /> {customer.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Phone size={16} /> {customer.phone}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Car size={16} /> Vehicles
              </button>
              <button style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <History size={16} /> History
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Customer Registration">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          <input placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          <input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          <textarea placeholder="Home Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white', minHeight: '80px' }} />
          <button type="submit" style={{ padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: 'bold', marginTop: '1rem' }}>Register Customer</button>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
