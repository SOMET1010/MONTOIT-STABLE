import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastPremiumProps extends Toast {
  onClose: (id: string) => void;
}

export const ToastPremium: React.FC<ToastPremiumProps> = ({
  id,
  variant,
  title,
  message,
  duration = 5000,
  action,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === 0) return;

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  // Variant styles
  const variantConfig = {
    success: {
      icon: CheckCircle2,
      bgClass: 'bg-success-light border-success',
      iconClass: 'text-success',
      progressClass: 'bg-success',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-error-light border-error',
      iconClass: 'text-error',
      progressClass: 'bg-error',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-warning-light border-amber-400',
      iconClass: 'text-warning',
      progressClass: 'bg-warning',
    },
    info: {
      icon: Info,
      bgClass: 'bg-info-light border-info',
      iconClass: 'text-info',
      progressClass: 'bg-info',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative w-full max-w-md rounded-lg border-l-4 shadow-xl overflow-hidden',
        'backdrop-blur-md bg-white/90',
        config.bgClass,
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200">
          <div
            className={cn('h-full transition-all duration-50', config.progressClass)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4 pt-5">
        {/* Icon */}
        <Icon className={cn('h-6 w-6 flex-shrink-0', config.iconClass)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900">{title}</p>
          {message && (
            <p className="mt-1 text-sm text-neutral-600">{message}</p>
          )}

          {/* Action button */}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              className={cn(
                'mt-2 text-sm font-medium underline hover:no-underline transition-colors',
                config.iconClass
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for custom toast events
    const handleToastEvent = (event: CustomEvent<Toast>) => {
      const toast = event.detail;
      setToasts((prev) => [...prev, toast]);
    };

    window.addEventListener('show-toast' as any, handleToastEvent);

    return () => {
      window.removeEventListener('show-toast' as any, handleToastEvent);
    };
  }, []);

  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Position styles
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-[9999] flex flex-col gap-3 pointer-events-none',
        positionStyles[position]
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastPremium {...toast} onClose={handleCloseToast} />
        </div>
      ))}
    </div>
  );
};

// Toast API
let toastCounter = 0;

export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    showToast({ variant: 'success', title, message, ...options });
  },
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    showToast({ variant: 'error', title, message, ...options });
  },
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    showToast({ variant: 'warning', title, message, ...options });
  },
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    showToast({ variant: 'info', title, message, ...options });
  },
};

function showToast(toast: Omit<Toast, 'id'>) {
  const id = `toast-${++toastCounter}`;
  const toastWithId: Toast = { id, ...toast };

  const event = new CustomEvent('show-toast', { detail: toastWithId });
  window.dispatchEvent(event);
}

// Animation styles
const animationStyles = `
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out-right {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-slide-out-right {
  animation: slide-out-right 0.3s ease-in;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'toast-premium-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = animationStyles;
    document.head.appendChild(style);
  }
}
