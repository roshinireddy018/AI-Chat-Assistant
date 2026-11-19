/**
 * Standardized logger utility
 * Provides consistent timestamps and log levels for backend operations
 */

const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = '') => {
    console.log(`[${getTimestamp()}] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[${getTimestamp()}] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message, error = '') => {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`, error ? (error.stack || error) : '');
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }
};

export default logger;
