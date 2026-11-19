/**
 * 404 Route Not Found middleware
 * Format: { error: { message, code } }
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND'
    }
  });
};

export default notFoundHandler;
