import { useState } from 'react';
import { changePasswordApi } from '../../api/auth.api';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { validatePassword } from '../../utils/validators';

const INITIAL_STATE = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/**
 * ChangePasswordModal — Secure password update modal for authenticated users.
 */
const ChangePasswordModal = ({ isOpen, onClose, onPasswordChanged }) => {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleClose = () => {
    setForm(INITIAL_STATE);
    setErrors({});
    setApiError(null);
    setSuccessMsg(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }

    const newPassErr = validatePassword(form.newPassword);
    if (newPassErr) {
      errs.newPassword = newPassErr;
    } else if (form.currentPassword && form.currentPassword === form.newPassword) {
      errs.newPassword = 'New password must be different from your current password.';
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (form.newPassword !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      await changePasswordApi({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      setSuccessMsg('Your password was updated successfully!');
      setForm(INITIAL_STATE);
      if (onPasswordChanged) onPasswordChanged();
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to change password. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Your Password">
      <form onSubmit={handleSubmit} noValidate>
        {successMsg && (
          <div className="alert alert--success" role="alert">
            {successMsg}
          </div>
        )}

        {apiError && (
          <div className="alert alert--error" role="alert">
            {apiError}
          </div>
        )}

        <Input
          id="change-current-password"
          name="currentPassword"
          type="password"
          label="Current Password"
          placeholder="••••••••"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          required
        />

        <Input
          id="change-new-password"
          name="newPassword"
          type="password"
          label="New Password"
          placeholder="••••••••"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          helperText="8–16 characters, 1+ uppercase letter, 1+ special character"
          required
        />

        <Input
          id="change-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirm New Password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
