/**
 * Client-side validation helpers matching backend business rules.
 */

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required.';
  const len = name.trim().length;
  if (len < 3 || len > 60) return 'Name must be between 3 and 60 characters.';
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) return 'Address is required.';
  if (address.trim().length > 400) return 'Address must not exceed 400 characters.';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
};
