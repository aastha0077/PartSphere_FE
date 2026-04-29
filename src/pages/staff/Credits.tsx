import React, { useEffect, useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Send, DollarSign } from 'lucide-react';
import api from '../../services/api';

const Credits = () => {
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const res = await api.get('/admin/reports/customers'); // Using the report endpoint which includes pending credits
      setCredits(res.data.pendingCredits);
    } catch (err) {
      console.error('Failed to fetch credits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCredits(); }, []);

  const markAsPaid = async (id: number) => {
    try {
      await api.put(`/admin/credits/${id}/paid`);
      fetchCredits();
    } catch (err) {
      alert('Payment failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Credit <span className="text-gradient">Manager</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track outstanding payments and send overdue reminders.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? <p>Loading credits...</p> : credits.map(credit => (
          <div key={credit.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{credit.customerName}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice #{credit.salesInvoiceId}</p>
                </div>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--danger)' }}>${credit.dueAmount.toFixed(2)}</span>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Due Date</span>
                <span style={{ color: new Date(credit.dueDate) < new Date() ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {new Date(credit.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ fontWeight: '600' }}>{credit.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => markAsPaid(credit.id)}
                style={{ flex: 1, padding: '12px', background: 'var(--success)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}
              >
                <CheckCircle size={18} /> Mark Paid
              </button>
              <button style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
