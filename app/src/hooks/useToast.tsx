import React, { useState, useCallback } from 'react';

// Types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  timeout?: number;
}

// useToast hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, description?: string, timeout = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: ToastMessage = { id, type, message, description, timeout };
      setToasts((prevToasts) => [...prevToasts, newToast]);

      if (timeout > 0) {
        setTimeout(() => removeToast(id), timeout);
      }

      return id;
    },
    [removeToast]
  );

  const ToastContainer = () => {
    const getToastClasses = (type: ToastType) => {
      const base = 'p-4 rounded-lg shadow-lg border';
      const styles = {
        success: 'bg-green-100 border-green-300 text-green-800',
        error: 'bg-red-100 border-red-300 text-red-800',
        info: 'bg-blue-100 border-blue-300 text-blue-800',
        warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      };
      return `${base} ${styles[type]}`;
    };

    if (toasts.length === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={getToastClasses(toast.type)}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <div className="font-semibold">{toast.message}</div>
            {toast.description && (
              <div className="text-sm mt-1">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return {
    showToast,
    removeToast,
    ToastContainer,
    toasts,
  };
};

export default useToast;
