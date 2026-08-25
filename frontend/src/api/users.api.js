import apiClient from './axios';

/**
 * User Management API services (SYSTEM_ADMIN).
 */

export const getUsersApi = async (params = {}) => {
  const { data } = await apiClient.get('/users', { params });
  return data;
};

export const getUserByIdApi = async (id) => {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
};

export const createUserApi = async (userData) => {
  const { data } = await apiClient.post('/users', userData);
  return data;
};

export const deleteUserApi = async (id) => {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
};
