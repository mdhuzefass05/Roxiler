import { createContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

export const ToastContext = createContext(null);

/**
 * Toast Provider for floating dismissible clay notifications
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (msg, duration) => addToast(msg, 'success', duration),
      error: (msg, duration) => addToast(msg, 'error', duration),
      info: (msg, duration) => addToast(msg, 'info', duration),
      warning: (msg, duration) => addToast(msg, 'warning', duration),
      dismiss: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Floating Toast Viewport */}
      {toasts.length > 0 && (
        <aside
          className="toast-viewport"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '420px',
            pointerEvents: 'none',
          }}
        >
          {toasts.map((t) => {
            const icons = {
              success: '✨',
              error: '⚠️',
              warning: '🔔',
              info: '💬',
            };

            return (
              <div
                key={t.id}
                role="alert"
                className={`clay-toast clay-toast--${t.type}`}
                style={{
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-clay-card-hover)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  animation: 'clay-pop-in 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color: 'var(--color-foreground)',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{icons[t.type] || '🔔'}</span>
                <span style={{ flex: 1 }}>{t.message}</span>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    color: 'var(--color-muted)',
                    padding: '0.2rem 0.4rem',
                  }}
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </aside>
      )}
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
