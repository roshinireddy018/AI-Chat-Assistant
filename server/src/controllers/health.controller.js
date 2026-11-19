import { getDatabaseStatus } from '../config/db.js';

/**
 * Controller for GET /api/health
 * Returns trimmed status: status, uptime, timestamp, database
 */
export const getHealth = (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus === 'connected';

  const responseBody = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus
  };

  return res.status(isHealthy ? 200 : 503).json(responseBody);
};

export default {
  getHealth
};
