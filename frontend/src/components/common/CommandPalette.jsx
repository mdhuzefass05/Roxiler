import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import useToast from '../../hooks/useToast';
import { ROLES, ROUTES } from '../../utils/constants';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
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
    const list = [
      {
        id: 'toggle-theme',
        label: isDark ? 'Switch to Day Candy ☀️ Light Theme' : 'Switch to Cyber Dark 🌙 Clay Theme',
        icon: isDark ? '☀️' : '🌙',
        category: 'Appearance',
        action: () => {
          toggleTheme();
          toast.info(isDark ? 'Switched to Day Candy Theme ☀️' : 'Switched to Cyber Dark Theme 🌙');
        },
      },
    ];

    if (!isAuthenticated) {
      list.push(
        { id: 'login', label: 'Sign In to Account', icon: '🔑', category: 'Navigation', action: () => navigate(ROUTES.LOGIN) },
        { id: 'register', label: 'Create New Customer Account', icon: '📝', category: 'Navigation', action: () => navigate(ROUTES.REGISTER) },
      );
      return list;
    }

    if (user?.role === ROLES.SYSTEM_ADMIN) {
      list.push(
        { id: 'admin-dash', label: 'Admin Dashboard Overview', icon: '👑', category: 'Admin Tools', action: () => navigate(ROUTES.ADMIN_DASHBOARD) },
        { id: 'admin-users', label: 'Manage Platform Users', icon: '👥', category: 'Admin Tools', action: () => navigate(ROUTES.ADMIN_USERS) },
        { id: 'admin-stores', label: 'Manage Registered Stores', icon: '🏬', category: 'Admin Tools', action: () => navigate(ROUTES.ADMIN_STORES) },
      );
    } else if (user?.role === ROLES.STORE_OWNER) {
      list.push(
        { id: 'owner-dash', label: 'Store Owner Analytics & Reviews', icon: '🏬', category: 'Store Owner', action: () => navigate(ROUTES.OWNER_DASHBOARD) },
      );
    } else {
      list.push(
        { id: 'user-stores', label: 'Explore & Rate Stores Catalog', icon: '🛍️', category: 'Customer Portal', action: () => navigate(ROUTES.STORES) },
      );
    }

    list.push(
      {
        id: 'logout',
        label: 'Log Out of Account',
        icon: '🚪',
        category: 'Account',
        action: () => {
          logout();
          toast.info('You have been logged out.');
          navigate(ROUTES.LOGIN);
        },
      }
    );

    return list;
  }, [isAuthenticated, user, isDark, toggleTheme, navigate, logout, toast]);

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
            placeholder="Type a command or jump to page…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--color-foreground)',
            }}
          />
          <kbd
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.06)',
              color: 'var(--color-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {filteredActions.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-muted)' }}>
              No matching commands found.
            </p>
          ) : (
            filteredActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  borderRadius: '16px',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: 'var(--color-foreground)',
                  transition: 'background var(--transition-squish)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)';
                  e.currentTarget.style.color = 'var(--color-accent-violet)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-foreground)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{action.icon}</span>
                <span style={{ flex: 1 }}>{action.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                  {action.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
