import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import api from '../../services/api';
import ModernCalendar from '../../components/common/ModernCalendar';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';

const Appointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/staff/appointments');
      setAppointments(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/staff/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toastApiError(err, { context: 'save', fallback: 'Could not update appointment status.' });
    }
  };

  const dayAppointments = appointments.filter(a => {
    const d = new Date(a.appointmentDate || a.date);
    return d.getDate() === selectedDate.getDate() && 
           d.getMonth() === selectedDate.getMonth() && 
           d.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Service <span className="text-gradient">Registrar</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Workshop occupancy and service schedule management.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="glass" style={{ padding: '10px 16px', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Daily View
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ModernCalendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
            appointments={appointments} 
          />
          
          <div className="glass-card" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--accent-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Daily Capacity</p>
                <p style={{ fontWeight: '700' }}>{dayAppointments.length} Booked / 12 Max</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              Schedule for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {dayAppointments.length} tasks identified
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading records...</p>
            ) : dayAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                <CalendarIcon size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
                <p style={{ color: 'var(--text-muted)' }}>No bookings for this date.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayAppointments.map(app => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="table-row-hover"
                    style={{ 
                      padding: '1.25rem', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                      <div style={{ textAlign: 'center', minWidth: '60px' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>{new Date(app.appointmentDate || app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Arrival</p>
                      </div>
                      <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.05)' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '700', fontSize: '1rem', color: 'white' }}>{app.customerName}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{app.serviceType}</p>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>•</span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.vehicleInfo}</p>
                        </div>
                        {app.notes && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', borderLeft: '2px solid var(--accent-primary)' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Notes: </span> {app.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700',
                        background: app.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: app.status === 'Completed' ? 'var(--success)' : app.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)'
                      }}>
                        {app.status}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {app.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'Completed')} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Complete">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => updateStatus(app.id, 'Cancelled')} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Cancel">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-muted)', border: 'none' }}>
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;