import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * useToast hook for triggering floating notifications anywhere in the UI.
 */
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default useToast;
