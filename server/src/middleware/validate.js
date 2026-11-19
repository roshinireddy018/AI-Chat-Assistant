/**
 * Reusable Express middleware for Zod schema validation
 * Format on failure: { error: { message, code: 'VALIDATION_ERROR' } }
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const formattedMessage = result.error.errors
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

    req[source] = result.data;
    next();
  };
};

export default validate;
