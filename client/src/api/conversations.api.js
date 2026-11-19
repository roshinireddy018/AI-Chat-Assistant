import apiClient from './client.js';

export const getConversations = async (query = '') => {
  const endpoint = query ? `/conversations?q=${encodeURIComponent(query)}` : '/conversations';
  return apiClient.get(endpoint);
};

export const getConversation = async (id) => {
  return apiClient.get(`/conversations/${id}`);
};

export const renameConversation = async (id, title) => {
  return apiClient.patch(`/conversations/${id}`, { title });
};

export const deleteConversation = async (id) => {
  return apiClient.delete(`/conversations/${id}`);
};

export default {
  getConversations,
  getConversation,
  renameConversation,
  deleteConversation
};
