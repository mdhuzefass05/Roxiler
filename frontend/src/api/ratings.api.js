import apiClient from './axios';

/**
 * Rating API services.
 */

export const submitRatingApi = async ({ store_id, rating_value, comment }) => {
  const { data } = await apiClient.post('/ratings', { store_id, rating_value, comment });
  return data;
};

export const updateRatingApi = async (storeId, ratingValue, comment) => {
  const payload = { rating_value: ratingValue };
  if (comment !== undefined) payload.comment = comment;
  const { data } = await apiClient.put(`/ratings/${storeId}`, payload);
  return data;
};

export const getMyRatingsApi = async () => {
  const { data } = await apiClient.get('/ratings/my-ratings');
  return data;
};

export const getRatingsByStoreApi = async (storeId) => {
  const { data } = await apiClient.get(`/ratings/store/${storeId}`);
  return data;
};

export const replyToRatingApi = async (ratingId, reply) => {
  const { data } = await apiClient.post(`/ratings/${ratingId}/reply`, { reply });
  return data;
};
