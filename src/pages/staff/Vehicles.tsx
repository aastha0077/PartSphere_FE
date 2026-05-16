import React, { useEffect, useState } from 'react';
import { Car, Plus, Trash2, Search, Edit2 } from 'lucide-react';
import api from '../../services/api';
import type { Customer } from '../../types';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleNumber: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  const fetchVehicles = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/staff/vehicles/search?query=${query}` : '/staff/vehicles';
      const res = await api.get(url);
      setVehicles(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/staff/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers');
    }
  };

  useEffect(() => { 
    fetchVehicles(); 
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff/vehicles', formData);
      toast.success('Vehicle registered successfully');
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      toastApiError(err, { context: 'save', fallback: 'Could not register vehicle. The plate number may already exist.' });
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.delete(`/staff/vehicles/${deleteConfirm.id}`);
      toast.success('Vehicle removed from registry');
      fetchVehicles();
    } catch (err) {
      toastApiError(err, { context: 'delete', fallback: 'Could not delete this vehicle.' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Vehicle <span className="text-gradient">Registry</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage customer vehicles and service links.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by plate or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 36px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="glass" style={{ padding: '10px 20px', background: 'var(--accent-gradient)', color: 'white', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No vehicles found.</p>
        ) : vehicles.map(vehicle => (
          <motion.div whileHover={{ y: -4 }} key={vehicle.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{vehicle.brand} {vehicle.model}</h3>
                  <div style={{ display: 'inline-block', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid var(--glass-border)', marginTop: '4px' }}>
                    {vehicle.vehicleNumber}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ color: 'var(--text-muted)', background: 'transparent' }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(vehicle.id)} style={{ color: 'var(--danger)', background: 'transparent' }}><Trash2 size={16} /></button>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Owner</p>
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{vehicle.customerName}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Mileage: {vehicle.mileage.toLocaleString()} km</span>
              <span>Last Service: {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'None'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Vehicle">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <select 
            value={formData.customerId} 
            onChange={e => setFormData({ ...formData, customerId: e.target.value })} 
            className="glass" 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} 
            required
          >
            <option value="">Select Owner (Customer)...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
          </select>
          <input placeholder="License Plate / Vehicle Number" value={formData.vehicleNumber} onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          <input placeholder="Brand (e.g. Toyota)" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          <input placeholder="Model (e.g. Camry)" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} required />
          <input type="number" placeholder="Current Mileage" value={formData.mileage} onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })} className="glass" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white' }} />
          <button type="submit" style={{ padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: 'bold', marginTop: '1rem' }}>Register Vehicle</button>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to remove this vehicle? This will not delete past service history but will remove it from active registry."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Vehicles;