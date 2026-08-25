import apiClient from './axios';

/**
 * Store API services.
 */

export const getStoresApi = async (params = {}) => {
  const { data } = await apiClient.get('/stores', { params });
  return data;
};

export const getStoreByIdApi = async (id) => {
  const { data } = await apiClient.get(`/stores/${id}`);
  return data;
};

export const createStoreApi = async (storeData) => {
  const { data } = await apiClient.post('/stores', storeData);
  return data;
};

export const getMyStoreApi = async () => {
  const { data } = await apiClient.get('/stores/my-store');
  return data;
};
