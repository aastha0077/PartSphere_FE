import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Clock, MoreVertical, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';

const PartRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [updateData, setUpdateData] = useState({ status: '', notes: '' });

  const fetchRequests = async () => {
    try {
      const res = await api.get('/staff/part-requests');
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to fetch part requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/staff/part-requests/${selectedRequest.id}/status`, updateData);
      toast.success('Request updated successfully');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Part <span className="text-gradient">Inquiries</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Manage customer requests for unavailable inventory items.
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem 1.5rem' }}>Customer</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Requested Part</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Date</th>
              <th style={{ padding: '1.25rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending requests.</td></tr>
            ) : requests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="table-row-hover">
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: '700' }}>{req.customerName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{req.customerId}</div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{req.partName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.brand || 'No brand specified'}</div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    background: req.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : req.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: req.status === 'Available' ? '#10b981' : req.status === 'Cancelled' ? '#ef4444' : '#f59e0b'
                  }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button
                    onClick={() => { setSelectedRequest(req); setUpdateData({ status: req.status, notes: req.staffNotes || '' }); }}
                    className="glass"
                    style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'white', borderRadius: '8px' }}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Manage Part Request">
        {selectedRequest && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Customer Description</p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{selectedRequest.description}</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Update Status</label>
              <select
                value={updateData.status}
                onChange={e => setUpdateData({ ...updateData, status: e.target.value })}
                style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
              >
                <option value="Pending">Pending</option>
                <option value="InProcess">In Process</option>
                <option value="Available">Available / In Stock</option>
                <option value="Cancelled">Cancelled / Not Found</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Staff Notes (Internal/Customer Viewable)</label>
              <textarea
                placeholder="Updates for the customer..."
                value={updateData.notes}
                onChange={e => setUpdateData({ ...updateData, notes: e.target.value })}
                style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '100px' }}
              />
            </div>

            <button type="submit" style={{ padding: '12px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>
              Save Changes
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PartRequests;