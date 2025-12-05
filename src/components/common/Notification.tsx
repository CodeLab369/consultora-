// Componente de notificación personalizada

import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import './Notification.css';
import { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Notification = ({ type, message, onClose, duration = 3000 }: NotificationProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    info: <Info size={24} />,
    warning: <AlertCircle size={24} />
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        {icons[type]}
      </div>
      <div className="notification-message">{message}</div>
      <button className="notification-close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
};
