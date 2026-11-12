/**
 * Custom Hook for Pathway Data Fetching
 * Provides consistent polling and error handling for Pathway endpoints
 */

import { useState, useEffect, useCallback } from 'react';

interface UsePathwayDataOptions {
  pollingInterval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface UsePathwayDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data from Pathway endpoints with polling
 */
export function usePathwayData<T>(
  endpoint: string,
  options: UsePathwayDataOptions = {}
): UsePathwayDataReturn<T> {
  const {
    pollingInterval = 5000,
    enabled = true,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled, onError]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchData, pollingInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
