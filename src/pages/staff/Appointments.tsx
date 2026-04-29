import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

const Appointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/staff/appointments'); // Assuming this exists
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/staff/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Service <span className="text-gradient">Registrar</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage workshop service bookings and maintenance schedules.</p>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem' }}>Customer</th>
              <th style={{ padding: '1.25rem' }}>Service Type</th>
              <th style={{ padding: '1.25rem' }}>Date & Time</th>
              <th style={{ padding: '1.25rem' }}>Status</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading schedule...</td></tr> : appointments.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={18} color="var(--text-muted)" />
                    <span style={{ fontWeight: '600' }}>{app.customerName}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>{app.serviceType}</td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} /> {new Date(app.appointmentDate).toLocaleDateString()}
                    <Clock size={14} style={{ marginLeft: '8px' }} /> {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: app.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: app.status === 'Completed' ? 'var(--success)' : app.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)'
                  }}>
                    {app.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  {app.status === 'Pending' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => updateStatus(app.id, 'Completed')} style={{ padding: '6px', color: 'var(--success)', background: 'transparent' }}><CheckCircle size={20} /></button>
                      <button onClick={() => updateStatus(app.id, 'Cancelled')} style={{ padding: '6px', color: 'var(--danger)', background: 'transparent' }}><XCircle size={20} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
