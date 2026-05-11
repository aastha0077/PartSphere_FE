import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  ChevronRight,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import type { VehiclePart, Customer } from '../../types';

interface CartItem extends VehiclePart {
  quantity: number;
}

const POS = () => {
  const [parts, setParts] = useState<VehiclePart[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partsRes, customersRes] = await Promise.all([
          api.get('/parts?pageSize=1000'),
          api.get('/staff/customers')
        ]);
        setParts(partsRes.data.items || []);
        setCustomers(customersRes.data);
      } catch (err) {
        console.error('POS data fetch failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (part: VehiclePart) => {
    if (part.stockQuantity <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === part.id);
      if (existing) {
        if (existing.quantity >= part.stockQuantity) return prev;
        return prev.map(item => item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...part, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.stockQuantity) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleCheckout = async (paymentStatus: string) => {
    if (cart.length === 0 || !selectedCustomer) return;

    try {
      await api.post('/orders', {
        customerId: selectedCustomer.id,
        paymentMethod: 'Cash', // Defaulting since requirement focused on Status
        paymentStatus: paymentStatus,
        items: cart.map(item => ({
          vehiclePartId: item.id,
          quantity: item.quantity
        }))
      });
      toast.success(`Order completed with status: ${paymentStatus}!`);
      setCart([]);
      setSelectedCustomer(null);
      
      const partsRes = await api.get('/parts?pageSize=1000');
      setParts(partsRes.data.items || []);
    } catch (err) {
      toast.error('Checkout failed. Please check stock levels.');
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', height: 'calc(100vh - 5rem)' }}>
      {/* Product Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.75rem' }}>POS <span className="text-gradient">Terminal</span></h1>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search parts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white'
              }}
            />
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1.25rem' 
        }}>
          {filteredParts.map(part => (
            <motion.div 
              key={part.id}
              whileHover={{ y: -4 }}
              onClick={() => addToCart(part)}
              className="glass-card"
              style={{ 
                cursor: 'pointer', 
                opacity: part.stockQuantity <= 0 ? 0.6 : 1,
                border: cart.find(i => i.id === part.id) ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)'
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'var(--text-muted)'
              }}>
                <Package size={48} />
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{part.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{part.category}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>Rs. {part.price.toLocaleString()}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: part.stockQuantity < 5 ? 'var(--danger)' : 'var(--success)'
                }}>
                  {part.stockQuantity} in stock
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="glass" style={{ 
        borderRadius: 'var(--radius-xl)', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <ShoppingCart size={24} className="text-gradient" />
          <h2 style={{ fontSize: '1.25rem' }}>Active Cart</h2>
        </div>

        {/* Customer Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Customer</label>
          <select 
            className="glass"
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find(c => c.id === parseInt(e.target.value));
              setSelectedCustomer(customer || null);
            }}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: 'var(--radius-md)', 
              color: 'white',
              border: '1px solid var(--glass-border)'
            }}
          >
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
              Cart is empty
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rs. {item.price.toLocaleString()} / unit</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}><Minus size={14} /></button>
                <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}><Plus size={14} /></button>
                <button onClick={() => removeFromCart(item.id)} style={{ padding: '4px', color: 'var(--danger)', background: 'transparent', marginLeft: '8px' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Loyalty Discount</span>
            <span style={{ color: 'var(--success)' }}>-Rs. {discount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '4px' }}>
            <span style={{ fontWeight: '700' }}>Total</span>
            <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>Rs. {total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button 
            disabled={!selectedCustomer || cart.length === 0}
            onClick={() => handleCheckout('PAID')}
            style={{ 
              padding: '12px', 
              background: 'var(--success)', 
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              opacity: (!selectedCustomer || cart.length === 0) ? 0.5 : 1
            }}
          >
            Mark PAID
          </button>
          <button 
            disabled={!selectedCustomer || cart.length === 0}
            onClick={() => handleCheckout('CREDIT')}
            style={{ 
              padding: '12px', 
              background: 'var(--warning)', 
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              opacity: (!selectedCustomer || cart.length === 0) ? 0.5 : 1,
              color: 'black'
            }}
          >
            Issue CREDIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;