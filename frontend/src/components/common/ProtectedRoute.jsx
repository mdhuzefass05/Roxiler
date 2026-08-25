import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { ROUTES } from '../../utils/constants';

/**
 * ProtectedRoute — Guards routes that require authentication.
 *
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string[]}        roles    - Allowed roles; if empty, any authenticated user passes
 *
 * @example
 *   <ProtectedRoute roles={['SYSTEM_ADMIN']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Not authenticated — redirect to login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Role check: if specific roles are required, verify the user has one
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;
