import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../utils/constants';

/**
 * Navbar — Top navigation bar.
 * Renders different links based on the user's role.
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="navbar">
      <nav className="navbar__inner">
        <Link to={ROUTES.HOME} className="navbar__brand">
          🏪 StoreRate
        </Link>

        <div className="navbar__links">
          {!isAuthenticated && (
            <>
              <Link to={ROUTES.LOGIN} className="nav-link">Login</Link>
              <Link to={ROUTES.REGISTER} className="nav-link">Register</Link>
            </>
          )}

          {isAuthenticated && user?.role === ROLES.SYSTEM_ADMIN && (
            <>
              <Link to={ROUTES.ADMIN_DASHBOARD} className="nav-link">Dashboard</Link>
              <Link to={ROUTES.ADMIN_USERS} className="nav-link">Users</Link>
              <Link to={ROUTES.ADMIN_STORES} className="nav-link">Stores</Link>
            </>
          )}

          {isAuthenticated && user?.role === ROLES.NORMAL_USER && (
            <Link to={ROUTES.STORES} className="nav-link">Browse Stores</Link>
          )}

          {isAuthenticated && user?.role === ROLES.STORE_OWNER && (
            <Link to={ROUTES.OWNER_DASHBOARD} className="nav-link">My Store</Link>
          )}

          {isAuthenticated && (
            <div className="navbar__user">
              <span className="navbar__username">{user?.name}</span>
              <span className="navbar__role-badge">{user?.role?.replace('_', ' ')}</span>
              <button onClick={handleLogout} className="btn btn--outline btn--sm">
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
