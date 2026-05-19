import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: any[];
}

const parseUTCDate = (dateStr: string | undefined | null): Date => {
  if (!dateStr) return new Date();
  const hasTimezone = dateStr.includes('Z') || (dateStr.includes('T') && (dateStr.includes('+') || dateStr.slice(dateStr.indexOf('T')).includes('-')));
  return new Date(hasTimezone ? dateStr : dateStr + 'Z');
};

const ModernCalendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, appointments }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [direction, setDirection] = useState(0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handleMonthChange = (offset: number) => {
    setDirection(offset);
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();
  };

  const isSelected = (day: number) => 
    selectedDate.getDate() === day && 
    selectedDate.getMonth() === viewDate.getMonth() && 
    selectedDate.getFullYear() === viewDate.getFullYear();

  const getAppointmentsForDay = (day: number) => 
    appointments.filter(a => {
      const dateStr = a.date || a.appointmentDate;
      if (!dateStr) return false;
      const d = parseUTCDate(dateStr);
      return d.getDate() === day && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    });

  return (
    <div className="glass-card" style={{ padding: '1.25rem', width: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <CalendarIcon size={18} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => handleMonthChange(-1)} style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => handleMonthChange(1)} style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={viewDate.toISOString()}
          custom={direction}
          initial={{ x: direction * 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}
        >
          {blanks.map(b => <div key={`blank-${b}`} />)}
          
          {days.map(day => {
            const selected = isSelected(day);
            const today = isToday(day);
            const dayApts = getAppointmentsForDay(day);
            
            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
                style={{
                  aspectRatio: '1',
                  borderRadius: '10px',
                  border: today && !selected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  background: selected ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.02)',
                  color: selected ? 'white' : today ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: selected || today ? '700' : '500',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {day}
                {dayApts.length > 0 && (
                  <div style={{ position: 'absolute', bottom: '4px', display: 'flex', gap: '2px' }}>
                    {dayApts.slice(0, 3).map((_, i) => (
                      <div key={i} style={{ width: '3px', height: '3px', background: selected ? 'white' : 'var(--accent-primary)', borderRadius: '50%' }} />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ModernCalendar;