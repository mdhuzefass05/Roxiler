import apiClient from './axios';

/**
 * Rating API services.
 */

export const submitRatingApi = async ({ store_id, rating_value }) => {
  const { data } = await apiClient.post('/ratings', { store_id, rating_value });
  return data;
};

export const updateRatingApi = async (storeId, ratingValue) => {
  const { data } = await apiClient.patch(`/ratings/${storeId}`, { rating_value: ratingValue });
  return data;
};

export const getRatingsByStoreApi = async (storeId) => {
  const { data } = await apiClient.get(`/ratings/store/${storeId}`);
  return data;
};
