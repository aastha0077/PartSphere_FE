import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Car,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Settings2,
  Info,
  ChevronDown,
  ChevronLeft,
  Wrench,
  Activity,
  User,
  MapPin,
  ClipboardList,
  History as HistoryIcon,
  CreditCard
} from 'lucide-react';
import api from '../../services/api';
import ModernCalendar from '../../components/common/ModernCalendar';
import Modal from '../../components/common/Modal';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';

const serviceCategories = [
  { id: 'general', name: 'General Inspection', icon: <Settings2 size={16} /> },
  { id: 'oil', name: 'Oil & Filter Change', icon: <Wrench size={16} /> },
  { id: 'brakes', name: 'Brake Service', icon: <AlertCircle size={16} /> },
  { id: 'engine', name: 'Engine Diagnostics', icon: <Activity size={16} /> },
  { id: 'tire', name: 'Tire Replacement', icon: <ChevronRight size={16} /> },
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'Pending': { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    'Booked': { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' },
    'Confirmed': { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' },
    'Completed': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
    'Cancelled': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
  };
  const style = styles[status] || styles['Pending'];
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '700',
      background: style.bg,
      color: style.text,
      textTransform: 'uppercase',
      letterSpacing: '0.02em'
    }}>
      {status}
    </span>
  );
};

const MiniCalendar = ({ selectedDate, onDateSelect }: { selectedDate: Date, onDateSelect: (d: Date) => void }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</p>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ padding: '2px', background: 'transparent', color: 'var(--text-muted)' }}><ChevronLeft size={16} /></button>
          <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ padding: '2px', background: 'transparent', color: 'var(--text-muted)' }}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '4px' }}>{d}</div>)}
        {blanks.map(b => <div key={`b-${b}`} />)}
        {days.map(d => {
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <button
              key={d}
              type="button"
              disabled={isPast}
              onClick={() => onDateSelect(date)}
              style={{
                padding: '6px 0',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: isSelected ? 'var(--accent-gradient)' : 'transparent',
                color: isSelected ? 'white' : isPast ? 'var(--text-muted)' : 'var(--text-secondary)',
                opacity: isPast ? 0.3 : 1,
                cursor: isPast ? 'default' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const parseUTCDate = (dateStr: string | undefined | null): Date => {
  if (!dateStr) return new Date();
  const hasTimezone = dateStr.includes('Z') || (dateStr.includes('T') && (dateStr.includes('+') || dateStr.slice(dateStr.indexOf('T')).includes('-')));
  return new Date(hasTimezone ? dateStr : dateStr + 'Z');
};

const CustomerBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState<'scheduler' | 'history'>('scheduler');

  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: 'General Inspection',
    timeSlot: '09:00 AM',
    description: ''
  });

  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const fetchData = async () => {
    try {
      const [aptRes, vehRes] = await Promise.all([
        api.get('/customer/appointments'),
        api.get('/vehicle/my-vehicles')
      ]);
      setAppointments(aptRes.data);
      setVehicles(vehRes.data);
    } catch (err: unknown) {
      console.error('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (location.state?.openBooking) {
      setIsModalOpen(true);
      setStep(1);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleBooking = async () => {
    if (!formData.vehicleId) {
      toastValidationError('Select a vehicle for this appointment.');
      return;
    }
    if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvc || !cardInfo.name) {
      toastValidationError('Please complete the payment details to book your slot.');
      return;
    }

    setStep(4); // Show processing

    setTimeout(async () => {
      try {
        const userRes = await api.get('/auth/me');
        const customerId = userRes.data.customerId;

        const [time, modifier] = formData.timeSlot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const bookingDate = new Date(selectedDate);
        bookingDate.setHours(hours, minutes, 0, 0);

        await api.post('/customer/appointments', {
          customerId,
          vehicleId: parseInt(formData.vehicleId),
          serviceType: formData.serviceType,
          date: bookingDate.toISOString(),
          description: formData.description || 'Service request'
        });

        setStep(5); // Show success
        fetchData();
      } catch (err) {
        toastApiError(err, { context: 'booking', fallback: 'Could not book the appointment. Please try again.' });
        setStep(3);
      }
    }, 2000);
  };

  const dayAppointments = appointments.filter(a => {
    const d = parseUTCDate(a.date);
    return d.toDateString() === selectedDate.toDateString();
  });

  const sortedHistory = [...appointments].sort((a, b) => parseUTCDate(b.date).getTime() - parseUTCDate(a.date).getTime());

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Service <span className="text-gradient">Registrar</span>
          </h1>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => setViewMode('scheduler')}
              style={{ background: 'transparent', color: viewMode === 'scheduler' ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', borderBottom: viewMode === 'scheduler' ? '2px solid var(--accent-primary)' : 'none', paddingBottom: '4px' }}
            >
              Scheduler
            </button>
            <button
              onClick={() => setViewMode('history')}
              style={{ background: 'transparent', color: viewMode === 'history' ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', borderBottom: viewMode === 'history' ? '2px solid var(--accent-primary)' : 'none', paddingBottom: '4px' }}
            >
              Booking History
            </button>
          </div>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setStep(1); }}
          style={{ padding: '10px 20px', background: 'var(--accent-gradient)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '0.9rem' }}
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'scheduler' ? (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ModernCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                appointments={appointments}
              />

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--accent-primary)" />
                  Agenda for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dayAppointments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      No services scheduled for this date.
                    </div>
                  ) : dayAppointments.map(apt => (
                    <div key={apt.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `3px solid ${apt.status === 'Completed' ? '#10b981' : '#6366f1'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <p style={{ fontWeight: '800', fontSize: '1rem', color: 'white', width: '60px' }}>
                          {(() => {
                            const d = parseUTCDate(apt.date);
                            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          })()}
                        </p>
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white' }}>{apt.serviceType}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.vehicleInfo}</p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ background: 'var(--accent-gradient)', border: 'none', padding: '1.5rem', color: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Garage Overview</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1.5rem' }}>Maintaining {vehicles.length} active vehicles.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}><CheckCircle2 size={14} /> {appointments.filter(a => a.status === 'Completed').length} Completed</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}><Clock size={14} /> {appointments.filter(a => a.status === 'Pending').length} Pending</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Active Fleet</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {vehicles.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setFormData({ ...formData, vehicleId: v.id.toString() }); setIsModalOpen(true); setStep(2); }}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', border: '1px solid transparent' }}
                    >
                      <div style={{ width: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <Car size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>{v.brand} {v.model}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.vehicleNumber}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card"
            style={{ padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HistoryIcon size={20} color="var(--accent-primary)" /> Historical Records
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedHistory.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No previous bookings found.</div>
              ) : sortedHistory.map(apt => (
                <div key={apt.id} className="table-row-hover" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', display: 'grid', gridTemplateColumns: '100px 1fr 1fr 120px', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Date</p>
                    <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{(() => { const d = parseUTCDate(apt.date); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); })()}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(() => { const d = parseUTCDate(apt.date); return d.getFullYear(); })()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Vehicle</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Car size={14} color="var(--accent-primary)" />
                      <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{apt.vehicleInfo}</p>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Service Performed</p>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{apt.serviceType}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reserve Workshop Slot">
        <div style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Workshop Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>SELECT VEHICLE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {vehicles.map(v => (
                        <button key={v.id} type="button" onClick={() => setFormData({ ...formData, vehicleId: v.id.toString() })} style={{ padding: '10px', borderRadius: '10px', background: formData.vehicleId === v.id.toString() ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: formData.vehicleId === v.id.toString() ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{v.brand} {v.model}</p>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{v.vehicleNumber}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>SERVICE TYPE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {serviceCategories.map(cat => (
                        <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, serviceType: cat.name })} style={{ padding: '10px', borderRadius: '10px', background: formData.serviceType === cat.name ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: formData.serviceType === cat.name ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: formData.serviceType === cat.name ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{cat.icon}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '600', textAlign: 'center' }}>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button disabled={!formData.vehicleId} onClick={() => setStep(2)} style={{ padding: '12px', background: 'var(--accent-gradient)', borderRadius: '10px', color: 'white', fontWeight: '700', fontSize: '0.9rem', opacity: formData.vehicleId ? 1 : 0.5 }}>Continue</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Date & Time</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <MiniCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>TIME SLOT</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                      {timeSlots.map(slot => (
                        <button key={slot} type="button" onClick={() => setFormData({ ...formData, timeSlot: slot })} style={{ padding: '8px', borderRadius: '8px', background: formData.timeSlot === slot ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)', color: formData.timeSlot === slot ? 'white' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>{slot}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'white', fontSize: '0.9rem' }}>Back</button>
                  <button onClick={() => setStep(3)} style={{ flex: 2, padding: '12px', background: 'var(--accent-gradient)', borderRadius: '10px', color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>Review Request</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>Confirm Booking & Payment</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                  {/* Summary */}
                  <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div><p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '1px' }}>VEHICLE</p><p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{vehicles.find(v => v.id.toString() === formData.vehicleId)?.brand} {vehicles.find(v => v.id.toString() === formData.vehicleId)?.model}</p></div>
                      <div><p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '1px' }}>SERVICE</p><p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{formData.serviceType}</p></div>
                      <div style={{ gridColumn: 'span 2' }}><p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '1px' }}>SCHEDULED FOR</p><p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {formData.timeSlot}</p></div>
                    </div>
                  </div>

                  {/* Payment Info Banner */}
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#fbbf24', fontSize: '0.7rem', fontWeight: '800' }}>REQUIRED BOOKING FEE</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>Rs. 1,000</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>SECURE GATEWAY</span>
                  </div>

                  {/* Simulated Credit Card */}
                  <div className="glass" style={{ padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e1e2f 0%, #111119 100%)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'var(--accent-primary)', opacity: 0.1, borderRadius: '50%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <CreditCard size={24} style={{ opacity: 0.5 }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.5 }}>DEMO CARD</span>
                    </div>
                    <div style={{ fontSize: '1rem', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>
                      {cardInfo.number || 'XXXX XXXX XXXX XXXX'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>CARD HOLDER</span>
                      <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>EXPIRES</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{cardInfo.name || 'CUSTOMER NAME'}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{cardInfo.expiry || 'MM/YY'}</span>
                    </div>
                  </div>

                  {/* Card Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      placeholder="Cardholder Name"
                      value={cardInfo.name}
                      onChange={e => setCardInfo({ ...cardInfo, name: e.target.value })}
                      className="glass"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white', fontSize: '0.8rem', background: 'rgba(0,0,0,0.1)' }}
                    />
                    <input
                      placeholder="Card Number"
                      value={cardInfo.number}
                      onChange={e => {
                        const val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardInfo({ ...cardInfo, number: val });
                      }}
                      maxLength={19}
                      className="glass"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white', fontSize: '0.8rem', background: 'rgba(0,0,0,0.1)' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input
                        placeholder="MM/YY"
                        value={cardInfo.expiry}
                        onChange={e => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                        maxLength={5}
                        className="glass"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white', fontSize: '0.8rem', background: 'rgba(0,0,0,0.1)' }}
                      />
                      <input
                        placeholder="CVC"
                        type="password"
                        maxLength={4}
                        value={cardInfo.cvc}
                        onChange={e => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                        className="glass"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white', fontSize: '0.8rem', background: 'rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  </div>

                  {/* Notes Textarea */}
                  <textarea
                    placeholder="Optional notes for the mechanic..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', minHeight: '60px', fontSize: '0.8rem' }}
                  />

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white', fontSize: '0.85rem' }}>Back</button>
                    <button onClick={handleBooking} style={{ flex: 2, padding: '10px', background: 'var(--accent-gradient)', borderRadius: '8px', color: 'white', fontWeight: '800', fontSize: '0.85rem' }}>Pay & Book Slot</button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ width: '50px', height: '50px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
                </motion.div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Processing Payment & Booking...</h3>
                <p style={{ color: 'var(--text-muted)' }}>Validating card and securing vehicle slot.</p>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-6 text-center">
                <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.25rem' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Booking Confirmed & Paid!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Your {formData.serviceType} appointment is set for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {formData.timeSlot}.</p>

                <div className="glass" style={{ width: '100%', padding: '1.25rem', borderRadius: '12px', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>Rs. 1,000 (Booking Fee)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Transaction Status:</span>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>SUCCESS</span>
                  </div>
                </div>

                <button onClick={() => { setIsModalOpen(false); setStep(1); setFormData({ vehicleId: '', serviceType: 'General Inspection', timeSlot: '09:00 AM', description: '' }); setCardInfo({ number: '', expiry: '', cvc: '', name: '' }); navigate('/customer/dashboard', { state: { activeTab: 'appointments' } }); }} style={{ padding: '12px 32px', background: 'var(--accent-gradient)', borderRadius: '10px', color: 'white', fontWeight: '700' }}>
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerBooking;