/**
 * Centralized API client built with native fetch
 * Base URL configured via VITE_API_BASE_URL
 * Standardized error handling returning { message, code }
 */

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
export const API_BASE_URL = rawBaseURL.replace(/\/$/, '');

const buildUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Perform an HTTP request with JSON parsing and standardized errors
 */
const request = async (endpoint, options = {}) => {
  const { method = 'GET', headers = {}, body, ...customConfig } = options;

  const url = buildUrl(endpoint);

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...customConfig
  };

  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error(networkError.message || 'Network connection failed');
    error.message = networkError.message || 'Network connection failed';
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  if (!response.ok) {
    let errorPayload = null;
    try {
      errorPayload = await response.json();
    } catch {
      // Body is not JSON
    }

    const message =
      errorPayload?.error?.message ||
      errorPayload?.message ||
      response.statusText ||
      `Request failed with status ${response.status}`;

    const code =
      errorPayload?.error?.code ||
      errorPayload?.code ||
      (response.status === 404
        ? 'NOT_FOUND'
        : response.status === 400
        ? 'BAD_REQUEST'
        : response.status === 503
        ? 'SERVICE_UNAVAILABLE'
        : 'HTTP_ERROR');

    const error = new Error(message);
    error.message = message;
    error.code = code;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  request
};

/**
 * Streaming response helper using native ReadableStream
 * Prepared for upcoming phase AI chat streaming (e.g. OpenAI SSE tokens)
 */
export const streamRequest = async (endpoint, { body, onChunk, signal } = {}) => {
  const url = buildUrl(endpoint);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    let errorPayload = null;
    try {
      errorPayload = await response.json();
    } catch {
      // Body is not JSON
    }

    const message =
      errorPayload?.error?.message ||
      errorPayload?.message ||
      response.statusText ||
      `Stream request failed with status ${response.status}`;

    const code = errorPayload?.error?.code || errorPayload?.code || 'STREAM_ERROR';
    const error = new Error(message);
    error.message = message;
    error.code = code;
    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ReadableStream not supported by browser/response');
  }

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (onChunk) onChunk(chunk);
  }
};

export default apiClient;
