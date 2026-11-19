/**
 * Standardized API Response Helpers
 * Errors consistently follow: { error: { message, code } }
 */

export const sendSuccess = (res, data = null, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

export const sendError = (res, { message = 'Internal Server Error', code = 'INTERNAL_SERVER_ERROR', statusCode = 500 } = {}) => {
  return res.status(statusCode).json({
    error: {
      message,
      code
    }
  });
};

export default {
  sendSuccess,
  sendError
};
