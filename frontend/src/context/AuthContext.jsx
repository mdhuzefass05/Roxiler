import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/auth.api';
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
  const [initialCheckDone, setInitialCheckDone] = useState(false);
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
   * Clear session.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setUser(null);
    setError(null);
  }, []);

  /**
   * Validate token on app load if token exists.
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        try {
          const res = await getMeApi();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(res.data));
          }
        } catch {
          logout();
        }
      }
      setInitialCheckDone(true);
    };

    checkAuth();
  }, [logout]);

  /**
   * Register a new normal user.
   * @param {Object} formData - { name, email, password, address }
   */
  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerApi(formData);
      persistAuth(res.data.token, res.data.user);
      return res;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed. Please check your details.';
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
      const res = await loginApi(credentials);
      persistAuth(res.data.token, res.data.user);
      return res;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update current user in state & localStorage.
   */
  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const merged = { ...prev, ...userData };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({
      user,
      loading: loading || !initialCheckDone,
      error,
      isAuthenticated,
      register,
      login,
      logout,
      updateUser,
    }),
    [user, loading, initialCheckDone, error, isAuthenticated, register, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
