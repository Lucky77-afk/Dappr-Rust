import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  timeout?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    description?: string,
    timeout: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      type,
      message,
      description,
      timeout,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (timeout > 0) {
      setTimeout(() => {
        removeToast(id);
      }, timeout);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
            toast.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
            toast.type === 'warning' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
            'bg-blue-100 border border-blue-300 text-blue-800'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="font-semibold">{toast.message}</div>
          {toast.description && (
            <div className="text-sm mt-1">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );

  return {
    showToast,
    removeToast,
    ToastContainer,
    toasts,
  };
};

export default useToast;
