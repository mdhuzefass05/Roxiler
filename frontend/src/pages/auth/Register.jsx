import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validators';
import { ROUTES } from '../../utils/constants';

/**
 * Normal User Registration Page
 * Only NORMAL_USER role accounts can self-register.
 */
const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateAll = () => {
    const errors = {};

    const nameErr = validateName(form.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;

    const addressErr = validateAddress(form.address);
    if (addressErr) errors.address = addressErr;

    const passwordErr = validatePassword(form.password);
    if (passwordErr) errors.password = passwordErr;

    const confirmErr = validateConfirmPassword(form.password, form.confirmPassword);
    if (confirmErr) errors.confirmPassword = confirmErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      const { name, email, address, password } = form;
      await register({ name, email, address, password });
      navigate(ROUTES.STORES, { replace: true });
    } catch {
      // Backend error is stored in AuthContext error
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__badge">New Member Signup</div>
          <h1>Create an Account</h1>
          <p>Register as a user to discover, browse, and rate stores</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}

          <Input
            id="name"
            name="name"
            type="text"
            label="Full Name"
            placeholder="Aarav Sharma Customer Shopper"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            helperText="Between 20 and 60 characters"
            required
            autoComplete="name"
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="user@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <Input
            id="address"
            name="address"
            type="text"
            label="Address"
            placeholder="42 MG Road, Indiranagar, Bengaluru, Karnataka 560038"
            value={form.address}
            onChange={handleChange}
            error={fieldErrors.address}
            helperText="Maximum 400 characters"
            required
            autoComplete="street-address"
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
            helperText="8–16 chars, 1+ uppercase letter, 1+ special char"
            required
            autoComplete="new-password"
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="auth-card__footer">
          <p>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
