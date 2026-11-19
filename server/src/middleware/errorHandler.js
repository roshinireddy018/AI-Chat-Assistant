import logger from '../utils/logger.js';
import { ZodError } from 'zod';

/**
 * Centralized error-handling middleware
 * Consistent error format: { error: { message, code } }
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err);

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedMessage = err.errors
      .map((e) => {
        const path = e.path.join('.');
        return path ? `${path}: ${e.message}` : e.message;
      })
      .join(', ');

    return res.status(400).json({
      error: {
        message: formattedMessage || 'Validation failed',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const formattedMessage = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ');

    return res.status(400).json({
      error: {
        message: formattedMessage || 'Database validation failed',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        message: `Invalid identifier: ${err.value}`,
        code: 'INVALID_ID'
      }
    });
  }

  // CORS error
  if (err.message === 'Blocked by CORS policy') {
    return res.status(403).json({
      error: {
        message: 'Blocked by CORS policy',
        code: 'CORS_ERROR'
      }
    });
  }

  // Generic errors
  const statusCode = err.statusCode || err.status || 500;
  let code = 'INTERNAL_SERVER_ERROR';
  if (typeof err.code === 'string' && !['ECONNREFUSED', 'ENOENT'].includes(err.code)) {
    code = err.code;
  } else if (statusCode === 400) {
    code = 'BAD_REQUEST';
  } else if (statusCode === 401) {
    code = 'UNAUTHORIZED';
  } else if (statusCode === 403) {
    code = 'FORBIDDEN';
  } else if (statusCode === 404) {
    code = 'NOT_FOUND';
  }

  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return res.status(statusCode).json({
    error: {
      message,
      code
    }
  });
};

export default errorHandler;
