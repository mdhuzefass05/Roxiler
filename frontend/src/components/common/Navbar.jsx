import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../utils/constants';

/**
 * Navbar — Floating Clay Pill Navigation.
 * Renders role-specific routes, user avatar badge, and tactile logout.
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case ROLES.SYSTEM_ADMIN:
        return 'badge--admin';
      case ROLES.STORE_OWNER:
        return 'badge--owner';
      case ROLES.NORMAL_USER:
      default:
        return 'badge--user';
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  };

  return (
    <header className="navbar-fixed">
      <nav className="nav-clay-pill" aria-label="Main Navigation">
        <Link to={ROUTES.HOME} className="nav-brand">
          <div className="nav-logo-orb" aria-hidden="true">
            🏪
          </div>
          <span>StoreRate</span>
        </Link>

        <div className="nav-links">
          {!isAuthenticated && (
            <>
              <Link
                to={ROUTES.LOGIN}
                className={`nav-link ${location.pathname === ROUTES.LOGIN ? 'nav-link--active' : ''}`}
              >
                Login
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className={`nav-link ${location.pathname === ROUTES.REGISTER ? 'nav-link--active' : ''}`}
              >
                Register
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === ROLES.SYSTEM_ADMIN && (
            <>
              <Link
                to={ROUTES.ADMIN_DASHBOARD}
                className={`nav-link ${location.pathname === ROUTES.ADMIN_DASHBOARD ? 'nav-link--active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to={ROUTES.ADMIN_USERS}
                className={`nav-link ${location.pathname === ROUTES.ADMIN_USERS ? 'nav-link--active' : ''}`}
              >
                Users
              </Link>
              <Link
                to={ROUTES.ADMIN_STORES}
                className={`nav-link ${location.pathname === ROUTES.ADMIN_STORES ? 'nav-link--active' : ''}`}
              >
                Stores
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === ROLES.NORMAL_USER && (
            <Link
              to={ROUTES.STORES}
              className={`nav-link ${location.pathname === ROUTES.STORES ? 'nav-link--active' : ''}`}
            >
              Browse Stores
            </Link>
          )}

          {isAuthenticated && user?.role === ROLES.STORE_OWNER && (
            <Link
              to={ROUTES.OWNER_DASHBOARD}
              className={`nav-link ${location.pathname === ROUTES.OWNER_DASHBOARD ? 'nav-link--active' : ''}`}
            >
              My Store
            </Link>
          )}

          {isAuthenticated && (
            <div className="nav-user-badge">
              <div className="nav-user-avatar" title={user?.name}>
                {getUserInitials(user?.name)}
              </div>
              <span className="nav-user-name">{user?.name}</span>
              <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
                {user?.role?.replace('_', ' ')}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn--secondary btn--sm"
                style={{ height: '2.2rem', padding: '0 0.85rem', fontSize: '0.8rem', borderRadius: '12px' }}
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
