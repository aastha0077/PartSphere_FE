import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  ChevronRight,
  ShoppingCart,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import type { VehiclePart, Vendor } from '../../types';
import Modal from '../../components/common/Modal';

const Parts = () => {
  const [parts, setParts] = useState<VehiclePart[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<VehiclePart | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    category: '',
    brand: '',
    vendorId: 0
  });

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPartForPurchase, setSelectedPartForPurchase] = useState<VehiclePart | null>(null);
  const [purchaseData, setPurchaseData] = useState({
    quantity: 1,
    unitPrice: 0,
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partsRes, vendorsRes] = await Promise.all([
        api.get('/admin/parts'),
        api.get('/admin/vendors')
      ]);
      setParts(partsRes.data);
      setVendors(vendorsRes.data);
    } catch (err) {
      console.error('Error fetching inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (part: VehiclePart | null = null) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        description: part.description,
        price: part.price,
        stockQuantity: part.stockQuantity,
        category: (part as any).category || '',
        brand: (part as any).brand || '',
        vendorId: part.vendorId
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        category: '',
        brand: '',
        vendorId: vendors[0]?.id || 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPart) {
        await api.put(`/admin/parts/${editingPart.id}`, formData);
      } else {
        await api.post('/admin/parts', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving part');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await api.delete(`/admin/parts/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting part');
      }
    }
  };

  const handleOpenPurchaseModal = (part: VehiclePart) => {
    setSelectedPartForPurchase(part);
    setPurchaseData({
      quantity: 10,
      unitPrice: part.price * 0.8,
      notes: `Restocking ${part.name}`
    });
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForPurchase) return;

    try {
      const payload = {
        vendorId: selectedPartForPurchase.vendorId,
        totalAmount: purchaseData.quantity * purchaseData.unitPrice,
        notes: purchaseData.notes,
        items: [
          {
            partId: selectedPartForPurchase.id,
            quantity: purchaseData.quantity,
            unitPrice: purchaseData.unitPrice
          }
        ]
      };
      await api.post('/admin/purchases', payload);
      setIsPurchaseModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error recording purchase');
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    ((p as any).category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Inventory <span className="text-gradient">Control</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Centralized management for vehicle parts and stock distribution.
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
          <Plus size={20} /> Add New Part
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search inventory by part name, brand or category..."
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
          <button style={{ 
            padding: '0 1.5rem', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            border: '1px solid var(--glass-border)'
          }}>
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Part Details</th>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Classification</th>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Unit Price</th>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Available Stock</th>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Vendor</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving warehouse data...</td></tr>
              ) : filteredParts.map((part, idx) => (
                <motion.tr 
                  key={part.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="table-row-hover"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                >
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-primary)',
                        boxShadow: '0 4px 12px -4px rgba(99, 102, 241, 0.2)'
                      }}>
                        <Package size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{part.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(part as any).brand || 'Standard'} • ID: #{part.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      {(part as any).category || 'Auto Part'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: '700', fontSize: '1rem', color: 'white' }}>
                    ${part.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        color: part.stockQuantity < 10 ? '#ef4444' : '#10b981',
                        fontWeight: '800',
                        fontSize: '1rem'
                      }}>
                        {part.stockQuantity}
                      </span>
                      {part.stockQuantity < 10 && (
                        <div style={{ padding: '4px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
                          <AlertTriangle size={12} color="#ef4444" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {part.vendorName || 'General Supplier'}
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button 
                        onClick={() => handleOpenPurchaseModal(part)}
                        title="Purchase Inventory"
                        style={{ padding: '8px', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}
                      >
                        <ShoppingCart size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(part)}
                        title="Edit Record"
                        style={{ padding: '8px', color: 'var(--accent-secondary)', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(part.id)}
                        title="Delete Record"
                        style={{ padding: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPart ? 'Update Part Details' : 'Register New Part'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Product Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '80px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Brand</label>
            <input 
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category</label>
            <input 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Selling Price ($)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Initial Stock</label>
            <input 
              type="number" 
              required
              value={formData.stockQuantity}
              onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Assigned Vendor</label>
            <select 
              value={formData.vendorId}
              onChange={(e) => setFormData({...formData, vendorId: parseInt(e.target.value)})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            >
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ flex: 1, padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: '700' }}
            >
              {editingPart ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Purchase Modal */}
      <Modal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)} 
        title={`Inventory Restock: ${selectedPartForPurchase?.name}`}
      >
        <form onSubmit={handlePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Purchase Quantity</label>
              <input 
                type="number" 
                required
                min="1"
                value={purchaseData.quantity}
                onChange={(e) => setPurchaseData({...purchaseData, quantity: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cost Per Unit ($)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={purchaseData.unitPrice}
                onChange={(e) => setPurchaseData({...purchaseData, unitPrice: parseFloat(e.target.value)})}
                style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Transaction Notes</label>
            <textarea 
              placeholder="e.g. Bulk purchase for summer sale"
              value={purchaseData.notes}
              onChange={(e) => setPurchaseData({...purchaseData, notes: e.target.value})}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '80px' }}
            />
          </div>
          
          <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Total Transaction Value</span>
              <span style={{ color: 'white' }}>${purchaseData.quantity} x ${purchaseData.unitPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: '600' }}>Grand Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>${(purchaseData.quantity * purchaseData.unitPrice).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ flex: 1, padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Process Restock <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Parts;
