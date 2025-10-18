// frontend/src/hooks/useConstructorStatsBulk.ts
import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export interface ConstructorStats {
  points: number;
  wins: number;
  podiums: number;
  position: number;
}

export interface ConstructorBulkItem {
  constructorId: number;
  constructorName: string;
  nationality: string;
  isActive: boolean;
  stats: ConstructorStats;
}

export interface ConstructorStatsBulkResponse {
  seasonYear: number;
  constructors: ConstructorBulkItem[];
}

export const useConstructorStatsBulk = (
  year?: number,
  includeHistorical: boolean = false
) => {
  const [data, setData] = useState<ConstructorStatsBulkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBulkStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (year) params.append('year', year.toString());
        if (includeHistorical) params.append('includeHistorical', 'true');
        
        const response = await fetch(
          buildApiUrl(`/api/constructors/stats/bulk?${params}`)
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bulk constructor stats: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBulkStats();
  }, [year, includeHistorical]);

  return { data, loading, error };
};
