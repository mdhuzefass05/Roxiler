import { createContext, useState, useCallback, useMemo } from 'react';
import apiClient from '../api/axios';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * AuthContext — provides authentication state and actions to the entire app.
 *
 * Consumed via the useAuth hook (src/hooks/useAuth.js).
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Persist auth state to localStorage.
   */
  const persistAuth = (token, userData) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * Register a new normal user.
   * @param {Object} formData - { name, email, password, address }
   */
  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/register', formData);
      persistAuth(data.data.token, data.data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log in with email and password.
   * @param {Object} credentials - { email, password }
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      persistAuth(data.data.token, data.data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log out — clears state and local storage.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated,
      register,
      login,
      logout,
    }),
    [user, loading, error, isAuthenticated, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
