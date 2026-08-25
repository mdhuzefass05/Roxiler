/**
 * Centralised Axios instance.
 *
 * - Base URL: proxied through Vite to http://localhost:5000/api in dev
 * - Request interceptor: attaches JWT from localStorage to every request
 * - Response interceptor: redirects to /login on 401
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Vite proxy forwards this to http://localhost:5000/api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Attach the auth token to every outgoing request if it exists.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Handle 401 globally: clear token and redirect to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
