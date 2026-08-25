import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Role dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import StoreManagement from './pages/admin/StoreManagement';
import UserDashboard from './pages/user/UserDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';

import NotFound from './pages/NotFound';
import { ROLES, ROUTES } from './utils/constants';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />

          {/* Root redirect */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

          {/* System Admin routes */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute roles={[ROLES.SYSTEM_ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <ProtectedRoute roles={[ROLES.SYSTEM_ADMIN]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_STORES}
            element={
              <ProtectedRoute roles={[ROLES.SYSTEM_ADMIN]}>
                <StoreManagement />
              </ProtectedRoute>
            }
          />

          {/* Normal User routes */}
          <Route
            path={ROUTES.STORES}
            element={
              <ProtectedRoute roles={[ROLES.NORMAL_USER]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Store Owner routes */}
          <Route
            path={ROUTES.OWNER_DASHBOARD}
            element={
              <ProtectedRoute roles={[ROLES.STORE_OWNER]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
