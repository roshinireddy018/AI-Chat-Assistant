import apiClient from './client.js';

/**
 * Fetch server & database health status
 */
export const fetchHealthStatus = async () => {
  return apiClient.get('/health');
};

export default {
  fetchHealthStatus
};
