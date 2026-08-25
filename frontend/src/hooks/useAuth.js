import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — convenience hook to consume AuthContext.
 *
 * @returns {{ user, loading, error, isAuthenticated, register, login, logout }}
 * @throws {Error} if used outside of AuthProvider
 *
 * @example
 *   const { user, login, logout } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return context;
};

export default useAuth;
