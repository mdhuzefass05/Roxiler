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

export const updateStoreApi = async (id, storeData) => {
  const { data } = await apiClient.put(`/stores/${id}`, storeData);
  return data;
};

export const deleteStoreApi = async (id) => {
  const { data } = await apiClient.delete(`/stores/${id}`);
  return data;
};

export const getMyStoreApi = async () => {
  const { data } = await apiClient.get('/stores/my-store');
  return data;
};

export const getMyStoreRatingsApi = async (params = {}) => {
  const { data } = await apiClient.get('/stores/my-store/ratings', { params });
  return data;
};

export const getMyStoreStatsApi = async () => {
  const { data } = await apiClient.get('/stores/my-store/stats');
  return data;
};
