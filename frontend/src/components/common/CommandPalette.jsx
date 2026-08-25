import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { ROLES, ROUTES } from '../../utils/constants';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { id: 'login', label: 'Sign In', icon: '🔑', action: () => navigate(ROUTES.LOGIN) },
        { id: 'register', label: 'Create Account', icon: '📝', action: () => navigate(ROUTES.REGISTER) },
      ];
    }

    const list = [];

    if (user?.role === ROLES.SYSTEM_ADMIN) {
      list.push(
        { id: 'admin-dash', label: 'Admin Dashboard Overview', icon: '👑', action: () => navigate(ROUTES.ADMIN_DASHBOARD) },
        { id: 'admin-users', label: 'Manage Platform Users', icon: '👥', action: () => navigate(ROUTES.ADMIN_USERS) },
        { id: 'admin-stores', label: 'Manage Registered Stores', icon: '🏬', action: () => navigate(ROUTES.ADMIN_STORES) },
      );
    } else if (user?.role === ROLES.STORE_OWNER) {
      list.push(
        { id: 'owner-dash', label: 'Store Owner Analytics', icon: '🏬', action: () => navigate(ROUTES.OWNER_DASHBOARD) },
      );
    } else {
      list.push(
        { id: 'user-stores', label: 'Explore & Rate Stores', icon: '🛍️', action: () => navigate(ROUTES.STORES) },
      );
    }

    list.push(
      {
        id: 'logout',
        label: 'Log Out of Account',
        icon: '🚪',
        action: () => {
          logout();
          toast.info('You have been logged out.');
          navigate(ROUTES.LOGIN);
        },
      }
    );

    return list;
  }, [isAuthenticated, user, navigate, logout, toast]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
  }, [actions, query]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsOpen(false)}
      style={{ zIndex: 10000 }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          padding: '1.25rem',
          borderRadius: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            background: 'var(--color-input-bg)',
            boxShadow: 'var(--shadow-clay-pressed)',
            borderRadius: '18px',
            marginBottom: '1rem',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <input
            type="text"
            placeholder="Type a command or navigate anywhere… (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--color-foreground)',
            }}
          />
          <kbd
            style={{
              background: 'rgba(0,0,0,0.06)',
              padding: '0.2rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--color-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
          {filteredActions.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-muted)', fontWeight: 600 }}>
              No matching commands found.
            </p>
          ) : (
            filteredActions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="btn btn--secondary"
                style={{
                  justifyContent: 'flex-start',
                  height: '3.2rem',
                  padding: '0 1.25rem',
                  fontSize: '0.95rem',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-clay-card)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
