import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../utils/constants';

/**
 * Login Page
 * Redirects to the role-appropriate dashboard after successful login.
 */
const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });

  const getRedirectPath = (role) => {
    const map = {
      [ROLES.SYSTEM_ADMIN]: ROUTES.ADMIN_DASHBOARD,
      [ROLES.NORMAL_USER]: ROUTES.STORES,
      [ROLES.STORE_OWNER]: ROUTES.OWNER_DASHBOARD,
    };
    return map[role] || ROUTES.HOME;
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      const redirectTo = location.state?.from?.pathname || getRedirectPath(data.data.user.role);
      navigate(redirectTo, { replace: true });
    } catch {
      // Error is handled in AuthContext and exposed via `error`
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h1>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert--error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER}>Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
