import { useState, useCallback } from 'react';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast = { id, message, type, duration };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return {
    toasts,
    addToast,
    removeToast,
    toast,
  };
};

// Global toast instance for use outside of React components
let globalToastHandler = null;

export const setGlobalToastHandler = (handler) => {
  globalToastHandler = handler;
};

export const globalToast = {
  success: (message, duration) => {
    if (globalToastHandler) {
      return globalToastHandler.success(message, duration);
    }
    console.warn('Global toast handler not initialized');
  },
  error: (message, duration) => {
    if (globalToastHandler) {
      return globalToastHandler.error(message, duration);
    }
    console.warn('Global toast handler not initialized');
  },
  warning: (message, duration) => {
    if (globalToastHandler) {
      return globalToastHandler.warning(message, duration);
    }
    console.warn('Global toast handler not initialized');
  },
  info: (message, duration) => {
    if (globalToastHandler) {
      return globalToastHandler.info(message, duration);
    }
    console.warn('Global toast handler not initialized');
  },
};