import apiClient from './axios';

/**
 * Authentication API services.
 */

export const loginApi = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const registerApi = async (formData) => {
  const { data } = await apiClient.post('/auth/register', formData);
  return data;
};

export const getMeApi = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

export const changePasswordApi = async (passwordData) => {
  const { data } = await apiClient.patch('/auth/change-password', passwordData);
  return data;
};
