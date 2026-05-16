import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

type FormAlertVariant = 'error' | 'success' | 'info';

interface FormAlertProps {
  variant?: FormAlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<
  FormAlertVariant,
  { wrap: string; icon: string; text: string; Icon: typeof AlertCircle }
> = {
  error: {
    wrap: 'bg-red-500/10 border-red-500/20',
    icon: 'text-red-400',
    text: 'text-red-300',
    Icon: AlertCircle,
  },
  success: {
    wrap: 'bg-emerald-500/10 border-emerald-500/20',
    icon: 'text-emerald-400',
    text: 'text-emerald-300',
    Icon: CheckCircle,
  },
  info: {
    wrap: 'bg-indigo-500/10 border-indigo-500/20',
    icon: 'text-indigo-400',
    text: 'text-indigo-300',
    Icon: Info,
  },
};

const FormAlert: React.FC<FormAlertProps> = ({
  variant = 'error',
  title,
  children,
  className = '',
}) => {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.Icon;

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 border rounded-xl flex items-start gap-3 ${styles.wrap} ${className}`}
    >
      <Icon size={18} className={`${styles.icon} mt-0.5 shrink-0`} aria-hidden />
      <motion.div className="min-w-0">
        {title ? <p className={`text-sm font-semibold mb-1 ${styles.text}`}>{title}</p> : null}
        <p className={`text-sm ${styles.text}`}>{children}</p>
      </motion.div>
    </motion.div>
  );
};

export default FormAlert;

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-400 flex items-start gap-1" role="alert">
      <AlertCircle size={12} className="mt-0.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}
