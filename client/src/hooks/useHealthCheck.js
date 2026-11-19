import { useState, useEffect, useCallback } from 'react';
import { fetchHealthStatus } from '../api/health.api.js';

/**
 * Hook to monitor backend and database health status
 * Expects trimmed response: { status, uptime, timestamp, database }
 */
export const useHealthCheck = (pollingInterval = 30000) => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchHealthStatus();
      setHealthData(res);
      if (res.database === 'connected') {
        setError(null);
      } else {
        setError('Database is disconnected');
      }
    } catch (err) {
      setError(err.message || 'Cannot reach backend server');
      setHealthData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();

    if (pollingInterval > 0) {
      const interval = setInterval(checkHealth, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [checkHealth, pollingInterval]);

  const isHealthy = Boolean(
    healthData &&
    healthData.status === 'healthy' &&
    healthData.database === 'connected'
  );

  return {
    healthData,
    isHealthy,
    isLoading,
    error,
    refetch: checkHealth
  };
};

export default useHealthCheck;
