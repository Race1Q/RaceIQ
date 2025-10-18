// frontend/src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { buildApiUrl } from '../lib/api';
import type { DashboardData } from '../types';
import { fallbackDashboardData } from '../lib/fallbackData/dashboardData'; // 1. Import fallback data

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false); // 2. Add isFallback state
  const toast = useToast();

  useEffect(() => {
    let alive = true; // Cleanup flag to prevent state updates on unmounted component
    
    const fetchData = async () => {
      try {
        if (!alive) return; // Early exit if unmounted
        setLoading(true);
        setError(null);
        setIsFallback(false);
        
        const response = await fetch(buildApiUrl('/api/dashboard'));
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const dashboardData: DashboardData = await response.json();
        
        if (alive) {
          setData(dashboardData);
        }
      } catch (err) {
        if (!alive) return; // Don't update state if unmounted
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        console.error("Dashboard API failed, loading fallback data.", errorMessage);
        setError(errorMessage);
        // 3. On error, load fallback data and set state
        setData(fallbackDashboardData);
        setIsFallback(true);
        toast({
          title: 'Could not fetch live dashboard data',
          description: 'Displaying cached information.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      alive = false; // Mark as unmounted to prevent state updates
    };
  }, [toast]);

  // 4. Return the new isFallback state
  return { data, loading, error, isFallback };
};
