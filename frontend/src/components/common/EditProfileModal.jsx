import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { updateProfileApi } from '../../api/auth.api';
import { validateName, validateAddress } from '../../utils/validators';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    address: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (user && isOpen) {
      setForm({
        name: user.name || '',
        address: user.address || '',
      });
      setFieldErrors({});
      setApiError(null);
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameErr = validateName(form.name);
    if (nameErr) errors.name = nameErr;

    const addressErr = validateAddress(form.address);
    if (addressErr) errors.address = addressErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      const res = await updateProfileApi(form);
      if (res?.data) {
        updateUser(res.data);
      }
      toast.success('Your profile details have been updated!');
      onClose();
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile Details">
      <form onSubmit={handleSubmit} noValidate>
        {apiError && (
          <div className="alert alert--error" role="alert">
            {apiError}
          </div>
        )}

        <Input
          id="profile-name"
          name="name"
          type="text"
          label="Full Name"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
          helperText="Between 20 and 60 characters"
          required
        />

        <Input
          id="profile-email"
          name="email"
          type="email"
          label="Email Address"
          value={user?.email || ''}
          disabled
          helperText="Email address cannot be changed."
        />

        <Input
          id="profile-address"
          name="address"
          type="text"
          label="Street Address / City"
          value={form.address}
          onChange={handleChange}
          error={fieldErrors.address}
          helperText="Maximum 400 characters"
          required
        />

        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

EditProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditProfileModal;
