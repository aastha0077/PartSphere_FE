import React from 'react';
import Modal from './Modal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  const getColors = () => {
    switch (type) {
      case 'danger': return { primary: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'success': return { primary: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'info': return { primary: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
      default: return { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    }
  };

  const colors = getColors();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            minWidth: '48px',
            background: colors.bg, 
            color: colors.primary, 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem' }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            onClick={onClose}
            className="glass"
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '10px', 
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: type === 'danger' ? 'var(--danger)' : 'var(--accent-gradient)', 
              color: 'white', 
              borderRadius: '10px', 
              fontWeight: '700',
              boxShadow: type === 'danger' ? '0 10px 15px -3px rgba(239, 68, 68, 0.2)' : '0 10px 15px -3px rgba(99, 102, 241, 0.2)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
