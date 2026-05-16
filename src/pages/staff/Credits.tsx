import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle, Send, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { toastApiError } from '../../utils/feedback';
import TablePagination from '../../components/common/TablePagination';

interface CreditRecord {
  id: number;
  customerName: string;
  salesInvoiceId: number;
  dueAmount: number;
  dueDate: string;
  status: string;
}

const Credits = () => {
  const [credits, setCredits] = useState<CreditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fetchCredits = async () => {
    try {
      const res = await api.get('/admin/credits');
      const pending = (res.data as CreditRecord[]).filter(
        (c) => c.status !== 'Paid'
      );
      setCredits(pending);
    } catch (err: unknown) {
      toastApiError(err, { context: 'load', fallback: 'Could not load credit payments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCredits(); }, []);

  const sortedCredits = useMemo(
    () =>
      [...credits].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
    [credits]
  );

  const totalPages = Math.max(1, Math.ceil(sortedCredits.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedCredits = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedCredits.slice(start, start + pageSize);
  }, [sortedCredits, safePage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const markAsPaid = async (id: number) => {
    try {
      await api.put(`/admin/credits/${id}/paid`);
      toast.success('Payment recorded');
      fetchCredits();
    } catch (err) {
      toastApiError(err, { context: 'save', fallback: 'Could not record payment.' });
    }
  };

  const sendReminder = async (id: number) => {
    try {
      const toastId = toast.loading('Sending reminder...');
      await api.post(`/admin/credits/${id}/remind`);
      toast.success('Reminder emailed to customer', { id: toastId });
    } catch (err) {
      toastApiError(err, { context: 'save', fallback: 'Could not send reminder. Customer may not have an email on file.' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Credit <span className="text-gradient">Manager</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track outstanding payments and send overdue reminders.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p className="text-gray-500 col-span-full">Loading credits...</p>
        ) : sortedCredits.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-12">No outstanding credits in the ledger.</p>
        ) : (
          pagedCredits.map((credit) => (
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
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--danger)' }}>Rs. {credit.dueAmount.toLocaleString()}</span>
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
              <button
                onClick={() => sendReminder(credit.id)}
                title="Send payment reminder email"
                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-primary)' }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          ))
        )}
      </div>
      {!loading && sortedCredits.length > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={sortedCredits.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[6, 12, 24, 48]}
          itemLabel="credits"
        />
      )}
    </div>
  );
};

export default Credits;
