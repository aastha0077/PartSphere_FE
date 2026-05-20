import React, { useEffect, useState, useMemo } from 'react';
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
import type { User } from '../../types';
import Modal from '../../components/common/Modal';
import { toast } from 'sonner';
import FormAlert, { FieldError } from '../../components/common/FormAlert';
import {
  hasFieldErrors,
  toastApiError,
  validateStaffForm,
  type FieldErrors,
} from '../../utils/feedback';
import TablePagination from '../../components/common/TablePagination';

const StaffManagement = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff'
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

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

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredStaff = useMemo(
    () =>
      staff.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
      ),
    [staff, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedStaff = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, safePage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const validation = validateStaffForm(formData, !!editingId);
    setFieldErrors(validation);
    if (hasFieldErrors(validation)) {
      setFormError('Please fix the highlighted fields before saving.');
      toast.error('Please fix the highlighted fields before saving.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/staff/${editingId}`, formData);
        toast.success('Staff member updated successfully');
      } else {
        await api.post('/admin/staff', formData);
        toast.success('Staff member registered successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Staff' });
      setEditingId(null);
      setFieldErrors({});
      fetchStaff();
    } catch (err: unknown) {
      const msg = toastApiError(err, {
        context: 'save',
        fallback: 'Could not save staff member. The email may already be in use.',
      });
      setFormError(msg);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave empty unless changing
      role: user.role as any
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: number) => {
    try {
      await api.patch(`/admin/staff/${id}/toggle-status`);
      toast.success('Personnel status updated');
      fetchStaff();
    } catch (err: unknown) {
      toastApiError(err, { context: 'save', fallback: 'Could not update staff status.' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Permanently delete this staff member? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      toast.success('Personnel removed permanently');
      fetchStaff();
    } catch (err: unknown) {
      toastApiError(err, { context: 'delete', fallback: 'Could not delete this staff member.' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Staff <span className="text-gradient">Management</span>
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
          <UserPlus size={20} /> Add Staff
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
              <th style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
              <th style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
              <th style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid rgba(99, 102, 241, 0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Synchronizing personnel records...</p>
                  </div>
                </td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No personnel match your search.</td></tr>
              ) : pagedStaff.map((user, idx) => (
                <motion.tr 
                  key={user.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="table-row-hover"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: 'transparent' }}
                >
                  <td style={{ padding: '6px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '30px', 
                        height: '30px', 
                        background: user.role === 'Admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                        borderRadius: '6px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: user.role === 'Admin' ? 'var(--warning)' : 'var(--accent-primary)',
                        flexShrink: 0
                      }}>
                        <Users size={15} />
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'white' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      padding: '2px 8px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: user.role === 'Admin' ? 'var(--warning)' : 'var(--info)'
                    }}>
                      <Shield size={10} />
                      {user.role}
                    </div>
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      color: user.isActive ? '#10b981' : '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {user.isActive ? 'Operational' : 'Restricted'}
                    </div>
                  </td>
                  <td style={{ padding: '6px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} opacity={0.5} />
                      {user.email}
                    </div>
                  </td>
                  <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button 
                        onClick={() => handleEdit(user)}
                        style={{ 
                          padding: '4px 8px', 
                          background: 'rgba(255, 255, 255, 0.05)', 
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          border: '1px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => toggleStatus(user.id)}
                        style={{ 
                          padding: '4px 10px', 
                          background: user.isActive ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                          color: user.isActive ? '#ef4444' : '#10b981',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          border: `1px solid ${user.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {user.isActive ? 'Suspend' : 'Reinstate'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        style={{ 
                          padding: '4px', 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: '#ef4444',
                          borderRadius: '6px',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {!loading && filteredStaff.length > 0 && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={filteredStaff.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="accounts"
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', email: '', password: '', role: 'Staff' }); setFieldErrors({}); setFormError(null); }} title={editingId ? "Edit Personnel Details" : "Register System Operator"}>
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {formError && (
            <FormAlert variant="error" title="Could not save">
              {formError}
            </FormAlert>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              placeholder="e.g. Ram Bahadur" 
              value={formData.name} 
              onChange={e => { setFormData({...formData, name: e.target.value}); setFieldErrors((p) => ({ ...p, name: undefined })); }} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              aria-invalid={!!fieldErrors.name}
            />
            <FieldError message={fieldErrors.name} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              placeholder="ram.bahadur@partsphere.com" 
              type="email" 
              value={formData.email} 
              onChange={e => { setFormData({...formData, email: e.target.value}); setFieldErrors((p) => ({ ...p, email: undefined })); }} 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
              aria-invalid={!!fieldErrors.email}
            />
            <FieldError message={fieldErrors.email} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {editingId ? "Update Password (Leave blank to keep current)" : "Security Credentials"}
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                placeholder={editingId ? "New password" : "Initial access password"} 
                type="password" 
                value={formData.password} 
                onChange={e => { setFormData({...formData, password: e.target.value}); setFieldErrors((p) => ({ ...p, password: undefined })); }} 
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
                aria-invalid={!!fieldErrors.password}
              />
            </div>
            <FieldError message={fieldErrors.password} />
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