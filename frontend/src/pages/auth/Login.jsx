import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import BorderGlow from '../../components/common/BorderGlow';
import { validateEmail } from '../../utils/validators';
import { ROLES, ROUTES } from '../../utils/constants';

/**
 * Login Page
 * Unified authentication entry point for all three roles:
 * - SYSTEM_ADMIN → Admin Area (/admin)
 * - NORMAL_USER  → Normal User Area (/stores)
 * - STORE_OWNER  → Store Owner Area (/owner)
 */
const DEMO_ACCOUNTS = [
  {
    role: 'SYSTEM_ADMIN',
    label: 'Admin',
    icon: '👑',
    email: 'admin@storerate.dev',
    password: 'Admin@1234',
    hint: 'Full platform management',
  },
  {
    role: 'STORE_OWNER',
    label: 'Store Owner',
    icon: '🏬',
    email: 'owner@storerate.dev',
    password: 'Owner@1234',
    hint: 'Store dashboard & ratings',
  },
  {
    role: 'NORMAL_USER',
    label: 'Customer',
    icon: '🛍️',
    email: 'user@storerate.dev',
    password: 'User@1234',
    hint: 'Browse & rate stores',
  },
];

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

  const handleQuickFill = (acc) => {
    setForm({ email: acc.email, password: acc.password });
    setFieldErrors({});
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
      <BorderGlow
        className="auth-card"
        animated={true}
        borderRadius={48}
        glowRadius={36}
        edgeSensitivity={30}
        glowColor="268 90 75"
        colors={['#a78bfa', '#f472b6', '#38bdf8']}
      >
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

        {/* ── Quick Demo Login Autofill ────────────────────────────── */}
        <div className="demo-section">
          <div className="demo-section__title">⚡ Quick Demo Accounts</div>
          <div className="demo-section__grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                className="demo-chip-btn"
                onClick={() => handleQuickFill(acc)}
                title={`Autofill ${acc.label} (${acc.email})`}
              >
                <span className="demo-chip__icon">{acc.icon}</span>
                <span>{acc.label}</span>
                <span className="demo-chip__role">{acc.email.split('@')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-card__footer">
          <p>
            Don&apos;t have an account?{' '}
            <Link to={ROUTES.REGISTER} className="auth-link">
              Create a free account
            </Link>
          </p>
        </div>
      </BorderGlow>
    </main>
  );
};

export default Login;
