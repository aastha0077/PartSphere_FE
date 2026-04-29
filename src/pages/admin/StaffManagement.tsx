import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Search,
  MoreVertical,
  Key,
  Trash2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { User } from '../../types';
import Modal from '../../components/common/Modal';

const StaffManagement = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff'
  });

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff');
      setStaff(res.data.filter((u: User) => u.role === 'Staff' || u.role === 'Admin'));
    } catch (err) {
      console.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/staff', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Staff' });
      fetchStaff();
    } catch (err) {
      console.error('Error creating staff member');
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      await api.delete(`/admin/staff/${id}`);
      fetchStaff();
    } catch (err) {
      console.error('Toggle status failed');
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Personnel <span className="text-gradient">Registry</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Manage system operators, access levels, and account status.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
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
          <UserPlus size={20} /> Register Personnel
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
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

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Full Name</th>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>System Role</th>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Account Status</th>
              <th style={{ padding: '1.25rem', fontSize: '0.875rem', fontWeight: '600' }}>Email Address</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing personnel records...</td></tr>
              ) : filteredStaff.map((user, idx) => (
                <motion.tr 
                  key={user.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="table-row-hover"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: 'transparent' }}
                >
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: user.role === 'Admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: user.role === 'Admin' ? 'var(--warning)' : 'var(--accent-primary)'
                      }}>
                        <Users size={20} />
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: '4px 10px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      color: user.role === 'Admin' ? 'var(--warning)' : 'var(--info)'
                    }}>
                      <Shield size={12} />
                      {user.role}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: user.isActive ? '#10b981' : '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {user.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {user.isActive ? 'Operational' : 'Restricted'}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} opacity={0.5} />
                      {user.email}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => toggleStatus(user.id)}
                        style={{ 
                          padding: '8px 16px', 
                          background: user.isActive ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                          color: user.isActive ? '#ef4444' : '#10b981',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = user.isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        {user.isActive ? 'Suspend' : 'Reinstate'}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register System Operator">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              placeholder="e.g. Alexander Pierce" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              placeholder="staff@partsphere.com" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Security Credentials</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                placeholder="Initial access password" 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
                required 
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Authorization Level</label>
            <select 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            >
              <option value="Staff">Staff (Standard Access)</option>
              <option value="Admin">Administrator (Full Control)</option>
            </select>
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              New personnel will be registered as active by default. You can suspend access at any time from the registry.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: '700' }}>Confirm Registration</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
