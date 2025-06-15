import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useToast } from '../../hooks/useToast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    timeout?: number;
  }>;
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: Omit<ToastState['toasts'][0], 'id'> }
  | { type: 'REMOVE_TOAST'; id: string };

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string, timeout?: number) => string;
  removeToast: (id: string) => void;
  toasts: ToastState['toasts'];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.toast, id: Math.random().toString(36).substr(2, 9) }]
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.id)
      };
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const showToast = useCallback((type: ToastType, message: string, description?: string, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    dispatch({
      type: 'ADD_TOAST',
      toast: { type, message, description, timeout }
    });

    if (timeout > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, timeout);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts: state.toasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`p-4 rounded-lg shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
            toast.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : toast.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : toast.type === 'warning'
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.description && (
                <p className="mt-1 text-sm opacity-90">{toast.description}</p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContainer;
