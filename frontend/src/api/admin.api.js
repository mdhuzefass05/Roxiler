import apiClient from './axios';

/**
 * Admin API services.
 */

export const getAdminStatsApi = async () => {
  const { data } = await apiClient.get('/admin/stats');
  return data;
};
