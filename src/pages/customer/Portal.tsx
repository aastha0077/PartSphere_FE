import React, { useState, useEffect } from 'react';
import { Package, Calendar, History, Search, ShoppingBag, Plus, Clock } from 'lucide-react';
import api from '../../services/api';
import { VehiclePart } from '../../types';
import Modal from '../../components/common/Modal';

const CustomerPortal = () => {
  const [parts, setParts] = useState<VehiclePart[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('catalog');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    serviceType: 'General Maintenance',
    appointmentDate: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partsRes, historyRes] = await Promise.all([
          api.get('/parts'),
          api.get('/customer/my-history') // Assuming this endpoint exists for logged-in customer
        ]);
        setParts(partsRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error('Failed to fetch portal data');
      }
    };
    fetchData();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', bookingData);
      alert('Appointment requested successfully!');
      setIsBookingOpen(false);
    } catch (err) {
      alert('Booking failed');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Customer <span className="text-gradient">Portal</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Manage your vehicle services and browse parts.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setIsBookingOpen(true)} className="glass" style={{ padding: '12px 24px', background: 'var(--accent-gradient)', color: 'white', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Calendar size={20} /> Book Service
          </button>
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="glass" style={{ padding: '12px 24px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)' }}>
        <button onClick={() => setActiveTab('catalog')} style={{ padding: '1rem 0', color: activeTab === 'catalog' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'catalog' ? '2px solid var(--accent-primary)' : 'none', background: 'transparent', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} /> Parts Catalog
        </button>
        <button onClick={() => setActiveTab('history')} style={{ padding: '1rem 0', color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'history' ? '2px solid var(--accent-primary)' : 'none', background: 'transparent', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} /> My Orders
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {parts.map(part => (
            <div key={part.id} className="glass-card">
              <div style={{ height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <Package size={48} />
              </div>
              <h3 style={{ marginBottom: '0.25rem' }}>{part.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{part.category}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${part.price.toFixed(2)}</span>
                <button style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '8px' }}>
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Items</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No orders found yet.</td></tr> : history.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '1rem' }}>#{order.id}</td>
                  <td style={{ padding: '1rem' }}>{new Date(order.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{order.itemCount} units</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>${order.totalAmount.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}><span style={{ color: 'var(--success)' }}>Completed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} title="Book Workshop Service">
        <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Service Type</label>
          <select value={bookingData.serviceType} onChange={e => setBookingData({...bookingData, serviceType: e.target.value})} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }}>
            <option>General Maintenance</option>
            <option>Engine Diagnostic</option>
            <option>Brake Service</option>
            <option>Oil Change</option>
            <option>Tire Rotation</option>
          </select>
          
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Preferred Date & Time</label>
          <input type="datetime-local" value={bookingData.appointmentDate} onChange={e => setBookingData({...bookingData, appointmentDate: e.target.value})} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Additional Notes</label>
          <textarea value={bookingData.notes} onChange={e => setBookingData({...bookingData, notes: e.target.value})} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white', minHeight: '80px' }} placeholder="Describe any specific issues..." />
          
          <button type="submit" style={{ padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: 'bold', marginTop: '1rem' }}>Confirm Booking</button>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerPortal;
