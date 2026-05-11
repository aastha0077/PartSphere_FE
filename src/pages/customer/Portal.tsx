import React, { useState, useEffect } from 'react';
import { Package, Calendar, History, Search, ShoppingBag, Plus, Clock, Sparkles, AlertCircle, Car, CreditCard } from 'lucide-react';
import api from '../../services/api';
import type { VehiclePart } from '../../types';
import Modal from '../../components/common/Modal';
import { toast } from 'sonner';

const CustomerPortal = () => {
  const [parts, setParts] = useState<VehiclePart[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'history' | 'appointments' | 'requests'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    serviceType: 'General Maintenance',
    appointmentDate: '',
    notes: ''
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    partName: '',
    brand: '',
    description: ''
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('partsphere_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'delivery' | 'payment' | 'card-details' | 'processing' | 'success'>('cart');
  const [checkoutInfo, setCheckoutInfo] = useState({
    address: '',
    phone: '',
    paymentMethod: 'Cash on Delivery',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  });
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('partsphere_cart', JSON.stringify(cart));
  }, [cart]);

  // Reset checkout step when modal closes
  useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => setCheckoutStep('cart'), 300);
    }
  }, [isCartOpen]);

  useEffect(() => {
    const fetchPortalData = async () => {
    try {
      const [partsRes, historyRes, aiRes, requestsRes, appointmentsRes] = await Promise.allSettled([
        api.get('/customer/parts'),
        api.get('/customer/history'),
        api.get('/ai/predictive-maintenance/1'), // Mocking vehicle ID 1 for now
        api.get('/customer/part-requests'),
        api.get('/customer/appointments')
      ]);

      if (partsRes.status === 'fulfilled') setParts(partsRes.value.data.items || partsRes.value.data);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data);
      if (aiRes.status === 'fulfilled') setSuggestions(aiRes.value.data);
      if (requestsRes.status === 'fulfilled') setRequests(requestsRes.value.data);
      if (appointmentsRes.status === 'fulfilled') setAppointments(appointmentsRes.value.data);

    } catch (err) {
      console.error('Failed to fetch portal data', err);
      // toast.error('Some data could not be loaded');
    }
  };
    fetchPortalData();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customer/appointments', bookingData);
      toast.success('Appointment requested successfully!');
      setIsBookingOpen(false);
      const res = await api.get('/customer/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Booking failed');
    }
  };

  const handlePartRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customer/part-requests', requestData);
      toast.success('Part request submitted successfully!');
      setIsRequestOpen(false);
      setRequestData({ partName: '', brand: '', description: '' });
      const res = await api.get('/customer/part-requests');
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to submit request');
    }
  };

  const handleCheckout = async () => {
    if (checkoutStep === 'cart') {
      setCheckoutStep('delivery');
      return;
    }
    if (checkoutStep === 'delivery') {
      if (!checkoutInfo.address || !checkoutInfo.phone) {
        toast.error('Please fill in your delivery details');
        return;
      }
      setCheckoutStep('payment');
      return;
    }
    if (checkoutStep === 'payment') {
      if (checkoutInfo.paymentMethod === 'Credit/Debit Card') {
        setCheckoutStep('card-details');
        return;
      }
    }
    
    if (checkoutStep === 'card-details') {
      if (!checkoutInfo.cardNumber || !checkoutInfo.cardExpiry || !checkoutInfo.cardCVC) {
        toast.error('Please fill in card details');
        return;
      }
    }

    setCheckoutStep('processing');
    try {
      const orderData = {
        customerId: 0, // Set by backend
        paymentMethod: checkoutInfo.paymentMethod,
        paymentStatus: 'Pending',
        items: cart.map(item => ({
          vehiclePartId: item.id,
          quantity: 1
        }))
      };
      
      // Simulate real-world processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const res = await api.post('/orders/checkout', orderData);
      setLastOrder(res.data);
      setCart([]);
      setCheckoutStep('success');
      toast.success('Order placed successfully!');
      
      // Refresh portal data
      const [partsRes, historyRes, aiRes, requestsRes, appointmentsRes] = await Promise.allSettled([
        api.get('/customer/parts'),
        api.get('/customer/history'),
        api.get('/ai/predictive-maintenance/1'),
        api.get('/customer/part-requests'),
        api.get('/customer/appointments')
      ]);

      if (partsRes.status === 'fulfilled') setParts(partsRes.value.data.items || partsRes.value.data);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data);
      if (aiRes.status === 'fulfilled') setSuggestions(aiRes.value.data);
      if (requestsRes.status === 'fulfilled') setRequests(requestsRes.value.data);
      if (appointmentsRes.status === 'fulfilled') setAppointments(appointmentsRes.value.data);
      
    } catch (err) {
      console.error('Checkout failed', err);
      toast.error('Checkout failed. Please try again.');
      setCheckoutStep('payment');
    }
  };

  const addToCart = (part: any) => {
    setCart([...cart, part]);
    toast.success(`${part.name} added to cart`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Customer <span className="text-gradient">Portal</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Manage your vehicle services and browse parts.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Loyalty Card */}
          <div className="glass" style={{ 
            padding: '12px 20px', 
            borderRadius: '16px', 
            background: 'var(--accent-gradient)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '180px',
            boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase' }}>Loyalty Balance</span>
              <Sparkles size={14} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>
              {(history as any)?.customer?.loyaltyPoints || 0} <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>PTS</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(((history as any)?.customer?.loyaltyPoints || 0) / 10, 100)}%`, height: '100%', background: 'white' }} />
            </div>
          </div>

          <button onClick={() => setIsBookingOpen(true)} className="glass" style={{ padding: '12px 24px', background: 'var(--accent-gradient)', color: 'white', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Calendar size={20} /> Book Service
          </button>
          <button onClick={() => setIsCartOpen(true)} className="glass" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: 'var(--radius-md)', position: 'relative' }}>
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {cart.length}
              </span>
            )}
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
        <button onClick={() => setActiveTab('appointments')} style={{ padding: '1rem 0', color: activeTab === 'appointments' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'appointments' ? '2px solid var(--accent-primary)' : 'none', background: 'transparent', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} /> My Bookings
        </button>
        <button onClick={() => setActiveTab('requests')} style={{ padding: '1rem 0', color: activeTab === 'requests' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'requests' ? '2px solid var(--accent-primary)' : 'none', background: 'transparent', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> Part Requests
        </button>
      </div>
      
      {/* AI Maintenance Insights */}
      {suggestions.length > 0 && (
        <div className="glass-card mb-10" style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '1.5rem'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Maintenance Insights</h2>
              <p className="text-xs text-indigo-400 font-medium">Predictive analysis based on your vehicle mileage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white">{s.partName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    s.urgency === 'Critical' ? 'bg-red-500/20 text-red-400' : 
                    s.urgency === 'High' ? 'bg-orange-500/20 text-orange-400' : 
                    'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {s.urgency}
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{s.reason}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>~{s.estimatedRemainingKm}km remaining</span>
                  </div>
                  <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                    Find Replacement →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tab-content">
        {activeTab === 'catalog' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
              <div className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderRadius: '14px' }}>
                <Search size={20} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search premium parts (e.g. V8 Engine, Brake Pads...)" 
                  style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['All', 'Engine', 'Brakes', 'Suspension', 'Interior'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className="glass" 
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', color: selectedCategory === cat ? 'white' : 'var(--text-secondary)', background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {filteredParts.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No parts found in the catalog.</p>
                </div>
              ) : filteredParts.map(part => (
                <div key={part.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.3s ease' }}>
                  <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <Package size={64} style={{ opacity: 0.1 }} />
                    {part.stockQuantity <= 0 && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>OUT OF STOCK</span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.25rem' }}>{part.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600' }}>{part.brand}</p>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-primary)' }}>Rs. {part.price.toLocaleString()}</span>
                    {part.stockQuantity > 0 ? (
                      <button 
                        onClick={() => addToCart(part)}
                        className="glass"
                        style={{ padding: '10px 16px', background: 'var(--accent-gradient)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.9rem' }}
                      >
                        <Plus size={18} /> Add
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setIsRequestOpen(true); setRequestData({ ...requestData, partName: part.name }); }}
                        className="glass"
                        style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem' }}
                      >
                        Enquire
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
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
                {((history as any)?.purchases || []).length === 0 ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No orders found yet.</td></tr> : ((history as any)?.purchases || []).map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '1rem' }}>#{order.id}</td>
                    <td style={{ padding: '1rem' }}>{new Date(order.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{order.items?.length || 0} units</td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>Rs. {order.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}><span style={{ color: 'var(--success)' }}>Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {appointments.length === 0 ? (
              <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                <Calendar size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
                <p style={{ color: 'var(--text-muted)' }}>No scheduled appointments found.</p>
              </div>
            ) : appointments.map(app => (
              <div key={app.id} className="glass-card" style={{ border: '1px solid var(--glass-border)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={24} />
                  </div>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: app.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: app.status === 'Completed' ? '#10b981' : app.status === 'Cancelled' ? '#ef4444' : '#f59e0b'
                  }}>
                    {app.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>{app.serviceType}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                    <Clock size={16} />
                    <span style={{ fontWeight: '600' }}>{new Date(app.date).toLocaleDateString()} at {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                    <ShoppingBag size={16} />
                    <span>{app.vehicleInfo || 'Vehicle details pending'}</span>
                  </div>
                </div>
                {app.description && (
                  <div style={{ marginTop: '1.5rem', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-muted)', borderLeft: '3px solid var(--accent-primary)' }}>
                    {app.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Part Name</th>
                  <th style={{ padding: '1rem' }}>Brand</th>
                  <th style={{ padding: '1rem' }}>Requested On</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Staff Notes</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No part requests found.</td></tr> : requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{req.partName}</td>
                    <td style={{ padding: '1rem' }}>{req.brand || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.7rem', 
                        fontWeight: '800',
                        background: req.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: req.status === 'Available' ? '#10b981' : '#f59e0b'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{req.staffNotes || 'Waiting for response...'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      <Modal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} title="Request Unavailable Part">
        <form onSubmit={handlePartRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Can't find the specific part you need? Let us know and we'll try to source it for you.
          </p>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Part Name</label>
            <input 
              placeholder="e.g. Brake Pads - Ceramic" 
              value={requestData.partName} 
              onChange={e => setRequestData({...requestData, partName: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Brand (Optional)</label>
            <input 
              placeholder="e.g. Bosch" 
              value={requestData.brand} 
              onChange={e => setRequestData({...requestData, brand: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Details / Description</label>
            <textarea 
              placeholder="Please provide specifics like part number or vehicle compatibility..." 
              value={requestData.description} 
              onChange={e => setRequestData({...requestData, description: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '100px' }} 
              required 
            />
          </div>
          <button type="submit" style={{ padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: 'bold', marginTop: '1rem' }}>Submit Request</button>
        </form>
      </Modal>

      <Modal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        title={
          checkoutStep === 'cart' ? 'Shopping Cart' :
          checkoutStep === 'delivery' ? 'Delivery Details' :
          checkoutStep === 'payment' ? 'Payment Method' :
          checkoutStep === 'processing' ? 'Processing Order...' : 'Order Confirmed'
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '300px' }}>
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.1, margin: '0 auto 1rem' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map((item, idx) => (
                      <div key={idx} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px' }}>
                        <div>
                          <p style={{ fontWeight: '700' }}>{item.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.brand}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>Rs. {item.price.toLocaleString()}</span>
                          <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={{ color: '#ef4444', background: 'transparent' }}>
                            <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-primary)' }}>
                        Rs. {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                      </span>
                    </div>
                    <button onClick={handleCheckout} className="glass" style={{ width: '100%', padding: '14px', background: 'var(--accent-gradient)', color: 'white', fontWeight: '800', borderRadius: '12px' }}>
                      Checkout Now
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {checkoutStep === 'delivery' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>SHIPPING ADDRESS</label>
                <textarea 
                  placeholder="Enter your full street address..."
                  value={checkoutInfo.address}
                  onChange={e => setCheckoutInfo({...checkoutInfo, address: e.target.value})}
                  className="glass"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', color: 'white', minHeight: '100px', border: '1px solid var(--glass-border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>CONTACT NUMBER</label>
                <input 
                  type="text"
                  placeholder="+977 98XXXXXXXX"
                  value={checkoutInfo.phone}
                  onChange={e => setCheckoutInfo({...checkoutInfo, phone: e.target.value})}
                  className="glass"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', color: 'white', border: '1px solid var(--glass-border)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setCheckoutStep('cart')} className="glass" style={{ flex: 1, padding: '12px', borderRadius: '10px', color: 'var(--text-secondary)' }}>Back</button>
                <button onClick={handleCheckout} className="glass" style={{ flex: 2, padding: '12px', background: 'var(--accent-gradient)', color: 'white', fontWeight: '700', borderRadius: '10px' }}>Continue to Payment</button>
              </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'Cash on Delivery', icon: <Car size={20} /> },
                  { name: 'Credit/Debit Card', icon: <CreditCard size={20} /> },
                  { name: 'Khalti / eSewa', icon: <Sparkles size={20} /> }
                ].map(method => (
                  <label key={method.name} className="glass" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    border: checkoutInfo.paymentMethod === method.name ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    background: checkoutInfo.paymentMethod === method.name ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                  }}>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={checkoutInfo.paymentMethod === method.name}
                      onChange={() => setCheckoutInfo({...checkoutInfo, paymentMethod: method.name})}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <div style={{ color: checkoutInfo.paymentMethod === method.name ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      {method.icon}
                    </div>
                    <span style={{ fontWeight: '600' }}>{method.name}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setCheckoutStep('delivery')} className="glass" style={{ flex: 1, padding: '12px', borderRadius: '10px', color: 'var(--text-secondary)' }}>Back</button>
                <button onClick={handleCheckout} className="glass" style={{ flex: 2, padding: '12px', background: 'var(--accent-gradient)', color: 'white', fontWeight: '700', borderRadius: '10px' }}>
                  {checkoutInfo.paymentMethod === 'Credit/Debit Card' ? 'Next: Card Details' : `Confirm Rs. ${cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}`}
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 'card-details' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e1e2f 0%, #111119 100%)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent-primary)', opacity: 0.1, borderRadius: '50%' }} />
                <CreditCard size={32} style={{ marginBottom: '2rem', opacity: 0.5 }} />
                <div style={{ fontSize: '1.25rem', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                  {checkoutInfo.cardNumber || 'XXXX XXXX XXXX XXXX'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>CARD HOLDER</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>EXPIRES</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>CUSTOMER NAME</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{checkoutInfo.cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Card Number"
                  value={checkoutInfo.cardNumber}
                  onChange={e => setCheckoutInfo({...checkoutInfo, cardNumber: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()})}
                  maxLength={19}
                  className="glass"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', color: 'white', border: '1px solid var(--glass-border)' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={checkoutInfo.cardExpiry}
                    onChange={e => setCheckoutInfo({...checkoutInfo, cardExpiry: e.target.value})}
                    maxLength={5}
                    className="glass"
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', color: 'white', border: '1px solid var(--glass-border)' }}
                  />
                  <input 
                    type="password" 
                    placeholder="CVC"
                    value={checkoutInfo.cardCVC}
                    onChange={e => setCheckoutInfo({...checkoutInfo, cardCVC: e.target.value})}
                    maxLength={3}
                    className="glass"
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', color: 'white', border: '1px solid var(--glass-border)' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setCheckoutStep('payment')} className="glass" style={{ flex: 1, padding: '12px', borderRadius: '10px', color: 'var(--text-secondary)' }}>Back</button>
                <button onClick={handleCheckout} className="glass" style={{ flex: 2, padding: '12px', background: 'var(--accent-gradient)', color: 'white', fontWeight: '700', borderRadius: '10px' }}>Pay Rs. {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</button>
              </div>
            </div>
          )}

          {checkoutStep === 'processing' && (
            <div style={{ textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Securing your order...</h3>
                <p style={{ color: 'var(--text-muted)' }}>We're communicating with the warehouse.</p>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={40} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.5rem' }}>Order Placed!</h3>
                <p style={{ color: 'var(--text-muted)' }}>Thank you for choosing PartSphere. Your order <strong>#{lastOrder?.id}</strong> is being prepared.</p>
              </div>
              <div className="glass" style={{ width: '100%', padding: '1.5rem', borderRadius: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
                  <span style={{ fontWeight: '700' }}>Rs. {lastOrder?.totalAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery to:</span>
                  <span style={{ fontWeight: '700' }}>{checkoutInfo.address.substring(0, 20)}...</span>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ width: '100%', padding: '14px', background: 'var(--accent-primary)', color: 'white', fontWeight: '800', borderRadius: '12px' }}>
                Close & Return to Portal
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CustomerPortal;