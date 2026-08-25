import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';
import { ROLES, ROUTES } from '../../utils/constants';

/**
 * Login Page
 * Unified authentication entry point for all three roles:
 * - SYSTEM_ADMIN → Admin Area (/admin)
 * - NORMAL_USER  → Normal User Area (/stores)
 * - STORE_OWNER  → Store Owner Area (/owner)
 */
const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const getRedirectPath = (role) => {
    switch (role) {
      case ROLES.SYSTEM_ADMIN:
        return ROUTES.ADMIN_DASHBOARD;
      case ROLES.STORE_OWNER:
        return ROUTES.OWNER_DASHBOARD;
      case ROLES.NORMAL_USER:
      default:
        return ROUTES.STORES;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;
    if (!form.password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = await login(form);
      const userRole = data?.data?.user?.role;
      const targetDestination = location.state?.from?.pathname || getRedirectPath(userRole);
      navigate(targetDestination, { replace: true });
    } catch {
      // Backend error is set into AuthContext error state
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__badge">Store Rating Platform</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}

          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="auth-card__footer">
          <p>
            Don&apos;t have an account?{' '}
            <Link to={ROUTES.REGISTER} className="auth-link">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
