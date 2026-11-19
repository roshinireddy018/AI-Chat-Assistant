/**
 * Centralized API Client built exclusively with native Fetch API
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
 * Standard fetch request wrapper for JSON endpoints
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
  } catch (networkErr) {
    const error = new Error(networkErr.message || 'Network connection failed');
    error.message = networkErr.message || 'Network connection failed';
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  if (!response.ok) {
    let errorPayload = null;
    try {
      errorPayload = await response.json();
    } catch {
      // Body not JSON
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

/**
 * SSE Streaming helper using native ReadableStream and AbortController
 */
export const streamChat = async ({
  conversationId,
  message,
  tone = 'Professional',
  onSession,
  onChunk,
  onDone,
  onError,
  signal
}) => {
  const url = buildUrl('/chat/stream');

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversationId, message, tone }),
      signal
    });
  } catch (err) {
    if (signal?.aborted) return;
    const error = { message: err.message || 'Network error occurred', code: 'NETWORK_ERROR' };
    if (onError) onError(error);
    throw error;
  }

  if (!response.ok) {
    let errJson = null;
    try {
      errJson = await response.json();
    } catch {
      // not JSON
    }
    const error = {
      message: errJson?.error?.message || response.statusText || 'Failed to start stream',
      code: errJson?.error?.code || 'STREAM_START_FAILED'
    };
    if (onError) onError(error);
    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const error = { message: 'ReadableStream not supported', code: 'STREAM_UNSUPPORTED' };
    if (onError) onError(error);
    throw error;
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split SSE message blocks by double newline
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        if (!part.trim()) continue;

        const lines = part.split('\n');
        let eventType = 'message';
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice(5).trim();
          }
        }

        if (!dataStr) continue;

        let parsedData = null;
        try {
          parsedData = JSON.parse(dataStr);
        } catch {
          parsedData = dataStr;
        }

        if (eventType === 'session') {
          if (onSession) onSession(parsedData);
        } else if (eventType === 'done') {
          if (onDone) onDone(parsedData);
        } else if (eventType === 'error') {
          if (onError) onError(parsedData);
        } else if (eventType === 'message' || !eventType) {
          if (parsedData?.text !== undefined) {
            if (onChunk) onChunk(parsedData.text);
          }
        }
      }
    }
  } catch (readErr) {
    if (signal?.aborted) {
      return;
    }
    const error = { message: readErr.message || 'Stream interrupted', code: 'STREAM_INTERRUPTED' };
    if (onError) onError(error);
    throw error;
  }
};

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  request,
  streamChat
};

export default apiClient;
