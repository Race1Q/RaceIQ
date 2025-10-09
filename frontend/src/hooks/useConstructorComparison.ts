// frontend/src/hooks/useConstructorComparison.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

// Types for the constructor comparison feature
export type ConstructorSelection = {
  constructorId: string;
  year: number | 'career';
};

export type ConstructorComparisonStats = {
  constructorId: number;
  year: number | null;
  career: {
    wins: number;
    podiums: number;
    poles: number;
    fastestLaps: number;
    points: number;
    dnfs: number;
    races: number;
  };
  yearStats: null | {
    wins: number;
    podiums: number;
    poles: number;
    fastestLaps: number;
    points: number;
    dnfs: number;
    races: number;
  };
};

export type ConstructorMetricKey = 'wins' | 'podiums' | 'poles' | 'fastestLaps' | 'points' | 'dnfs' | 'races';

export type EnabledMetrics = Record<ConstructorMetricKey, boolean>;

export type CompositeScore = {
  c1: number | null;
  c2: number | null;
  perMetric: Record<ConstructorMetricKey, [number, number]>;
};

// Legacy type for backward compatibility
export type ConstructorDetails = {
  id: string;
  name: string;
  nationality: string;
  isActive: boolean;
  wins: number;
  podiums: number;
  points: number;
  imageUrl: string;
  teamColorToken: string;
};

type ConstructorListItem = {
  id: number | string;
  name: string;
  nationality: string;
  is_active: boolean;
  url?: string;
};

// Enhanced hook state with new features
type HookState = {
  // Original compatibility
  allConstructors: ConstructorListItem[];
  constructor1: ConstructorDetails | null;
  constructor2: ConstructorDetails | null;
  loading: boolean;
  error: string | null;
  handleSelectConstructor: (slot: 1 | 2, constructorId: string) => void;
  
  // NEW: Comparison features
  years: number[];
  selection1: ConstructorSelection | null;
  selection2: ConstructorSelection | null;
  stats1: ConstructorComparisonStats | null;
  stats2: ConstructorComparisonStats | null;
  enabledMetrics: EnabledMetrics;
  score: CompositeScore;
  selectConstructor: (slot: 1 | 2, constructorId: string, year: number | 'career') => void;
  selectConstructorForYears: (slot: 1 | 2, constructorId: string, years: number[]) => void;
  toggleMetric: (metric: ConstructorMetricKey) => void;
  clearSelection: (slot: 1 | 2) => void;
};

// HTTP helper using central apiFetch with automatic /api prefix.
const getJSON = <T,>(path: string) => apiFetch<T>(`/api${path.startsWith('/') ? path : `/${path}`}`);

// Fetch functions
async function fetchConstructorsList(): Promise<ConstructorListItem[]> {
  return getJSON<ConstructorListItem[]>('/constructors/active');
}

async function fetchYears(): Promise<number[]> {
  try {
    return await getJSON<number[]>('/races/years');
  } catch {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => currentYear - i);
  }
}

async function fetchConstructorStats(constructorId: string, year?: number | 'career'): Promise<ConstructorComparisonStats> {
  const yearParam = year && year !== 'career' ? `?year=${String(year)}` : '';
  return getJSON<ConstructorComparisonStats>(`/constructors/${constructorId}/stats${yearParam}`);
}

// NEW: Aggregate multiple years of stats
async function fetchConstructorStatsForYears(constructorId: string, years: number[]): Promise<ConstructorComparisonStats> {
  if (years.length === 0) {
    return fetchConstructorStats(constructorId, 'career');
  }
  
  if (years.length === 1) {
    return fetchConstructorStats(constructorId, years[0]);
  }
  
  // Fetch stats for each year and aggregate
  const yearStats = await Promise.all(
    years.map(year => fetchConstructorStats(constructorId, year))
  );
  
  // Aggregate the yearStats from each year
  const aggregatedYearStats = yearStats.reduce((acc, stats) => {
    if (stats.yearStats) {
      acc.wins += stats.yearStats.wins;
      acc.podiums += stats.yearStats.podiums;
      acc.poles += stats.yearStats.poles;
      acc.fastestLaps += stats.yearStats.fastestLaps;
      acc.points += stats.yearStats.points;
      acc.dnfs += stats.yearStats.dnfs;
      acc.races += stats.yearStats.races;
    }
    return acc;
  }, {
    wins: 0,
    podiums: 0,
    poles: 0,
    fastestLaps: 0,
    points: 0,
    dnfs: 0,
    races: 0,
  });
  
  // Return the aggregated stats in the same format
  return {
    constructorId: yearStats[0].constructorId,
    year: null, // Multiple years aggregated
    career: yearStats[0].career, // Keep career stats as reference
    yearStats: aggregatedYearStats,
  };
}

// Legacy stats fetch - now uses the new all-years endpoint
async function fetchConstructorLegacyStats(constructorId: string): Promise<any> {
  try {
    return await getJSON<any>(`/constructors/${constructorId}/stats/all`);
  } catch {
    return null;
  }
}

// Scoring functions
function normalizeMetric(metric: ConstructorMetricKey, value1: number, value2: number): [number, number] {
  if (metric === 'dnfs') {
    if (value1 === 0 && value2 === 0) return [1.0, 1.0];
    const max = Math.max(value1, value2);
    if (max === 0) return [0.5, 0.5];
    return [1 - value1 / max, 1 - value2 / max];
  }
  
  if (value1 === 0 && value2 === 0) return [0.5, 0.5];
  const max = Math.max(value1, value2);
  if (max === 0) return [0.5, 0.5];
  return [value1 / max, value2 / max];
}

function computeCompositeScore(
  stats1: ConstructorComparisonStats | null,
  stats2: ConstructorComparisonStats | null,
  enabledMetrics: EnabledMetrics
): CompositeScore {
  if (!stats1 || !stats2) {
    return { c1: null, c2: null, perMetric: {} as Record<ConstructorMetricKey, [number, number]> };
  }
  
  const perMetric: Record<ConstructorMetricKey, [number, number]> = {} as Record<ConstructorMetricKey, [number, number]>;
  let totalScore1 = 0;
  let totalScore2 = 0;
  let enabledCount = 0;
  
  const useYearStats = stats1.yearStats !== null && stats2.yearStats !== null;
  const s1 = useYearStats ? stats1.yearStats! : stats1.career;
  const s2 = useYearStats ? stats2.yearStats! : stats2.career;
  
  const metrics: ConstructorMetricKey[] = ['wins', 'podiums', 'poles', 'fastestLaps', 'points', 'dnfs', 'races'];
  
  metrics.forEach(metric => {
    if (!enabledMetrics[metric]) return;
    
    const value1 = (s1 as any)[metric] || 0;
    const value2 = (s2 as any)[metric] || 0;
    const normalized = normalizeMetric(metric, value1, value2);
    
    perMetric[metric] = normalized;
    totalScore1 += normalized[0];
    totalScore2 += normalized[1];
    enabledCount++;
  });
  
  return {
    c1: enabledCount > 0 ? Math.round((totalScore1 / enabledCount) * 100) : null,
    c2: enabledCount > 0 ? Math.round((totalScore2 / enabledCount) * 100) : null,
    perMetric,
  };
}

// Legacy mapping function
function mapStatsToDetails(id: string, base: Partial<ConstructorListItem> | undefined, stats: any): ConstructorDetails {
  const name = base?.name || `Constructor ${id}`;
  const nationality = base?.nationality || 'Unknown';

  // Handle the new stats structure from /constructors/:id/stats/all
  // stats is now an array of { year: number, stats: any }
  let aggregatedStats = {
    wins: 0,
    podiums: 0,
    points: 0,
  };

  if (Array.isArray(stats)) {
    // Aggregate stats across all years
    aggregatedStats = stats.reduce((acc, yearData) => {
      const yearStats = yearData.stats;
      return {
        wins: acc.wins + (Number(yearStats?.wins ?? 0) || 0),
        podiums: acc.podiums + (Number(yearStats?.podiums ?? 0) || 0),
        points: acc.points + (Number(yearStats?.points ?? 0) || 0),
      };
    }, aggregatedStats);
  } else if (stats?.career) {
    // Fallback for single year stats
    aggregatedStats = {
      wins: Number(stats.career?.wins ?? 0) || 0,
      podiums: Number(stats.career?.podiums ?? 0) || 0,
      points: Number(stats.career?.points ?? 0) || 0,
    };
  }

  return {
    id,
    name,
    nationality,
    isActive: base?.is_active ?? true,
    wins: aggregatedStats.wins,
    podiums: aggregatedStats.podiums,
    points: aggregatedStats.points,
    imageUrl: '',
    teamColorToken: '',
  };
}

export function useConstructorComparison(): HookState {
  // State
  const [allConstructors, setAllConstructors] = useState<ConstructorListItem[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [constructor1, setConstructor1] = useState<ConstructorDetails | null>(null);
  const [constructor2, setConstructor2] = useState<ConstructorDetails | null>(null);
  const [selection1, setSelection1] = useState<ConstructorSelection | null>(null);
  const [selection2, setSelection2] = useState<ConstructorSelection | null>(null);
  const [stats1, setStats1] = useState<ConstructorComparisonStats | null>(null);
  const [stats2, setStats2] = useState<ConstructorComparisonStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default all metrics enabled
  const [enabledMetrics, setEnabledMetrics] = useState<EnabledMetrics>({
    wins: true,
    podiums: true,
    poles: true,
    fastestLaps: true,
    points: true,
    dnfs: true,
    races: true,
  });
  
  // Load initial data
  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    Promise.all([fetchConstructorsList(), fetchYears()])
      .then(([constructorsList, yearsList]) => {
        if (alive) {
          setAllConstructors(constructorsList);
          setYears(yearsList.sort((a, b) => b - a));
        }
      })
      .catch((e) => {
        if (alive) setError(e.message || 'Failed to load initial data');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    
    return () => { alive = false; };
  }, []);
  
  const getListItem = useCallback(
    (id: string) => allConstructors.find(c => String(c.id) === String(id)),
    [allConstructors]
  );
  
  // Legacy constructor select for backward compatibility
  const handleSelectConstructor = useCallback((slot: 1 | 2, constructorId: string) => {
    if (!constructorId) return;
    
    setLoading(true);
    setError(null);
    
    fetchConstructorLegacyStats(constructorId)
      .then((stats) => {
        const base = getListItem(constructorId);
        const details = mapStatsToDetails(constructorId, base, stats);
        if (slot === 1) setConstructor1(details);
        else setConstructor2(details);
      })
      .catch((e) => setError(e.message || 'Failed to load constructor stats'))
      .finally(() => setLoading(false));
  }, [getListItem]);
  
  // NEW: Enhanced constructor select with year support
  const selectConstructor = useCallback((slot: 1 | 2, constructorId: string, year: number | 'career') => {
    if (!constructorId) return;
    
    const selection = { constructorId, year };
    
    setLoading(true);
    setError(null);
    
    if (slot === 1) {
      setSelection1(selection);
    } else {
      setSelection2(selection);
    }
    
    // Fetch comparison stats
    const yearParam = year === 'career' ? undefined : year;
    fetchConstructorStats(constructorId, yearParam)
      .then((stats) => {
        if (slot === 1) {
          setStats1(stats);
        } else {
          setStats2(stats);
        }
      })
      .catch((e) => setError(e.message || 'Failed to load constructor stats'))
      .finally(() => setLoading(false));
  }, [getListItem]);

  // NEW: Enhanced constructor select with multiple years support
  const selectConstructorForYears = useCallback((slot: 1 | 2, constructorId: string, years: number[]) => {
    if (!constructorId) return;
    
    setLoading(true);
    setError(null);
    
    // Fetch aggregated stats for multiple years
    fetchConstructorStatsForYears(constructorId, years)
      .then((stats) => {
        if (slot === 1) {
          setStats1(stats);
        } else {
          setStats2(stats);
        }
      })
      .catch((e) => setError(e.message || 'Failed to load constructor stats'))
      .finally(() => setLoading(false));
  }, []);
  
  // Toggle metric function
  const toggleMetric = useCallback((metric: ConstructorMetricKey) => {
    setEnabledMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  }, []);

  // Clear selection/constructor for a slot
  const clearSelection = useCallback((slot: 1 | 2) => {
    if (slot === 1) {
      setConstructor1(null);
      setSelection1(null);
      setStats1(null);
    } else {
      setConstructor2(null);
      setSelection2(null);
      setStats2(null);
    }
  }, []);
  
  // Compute composite score
  const score = useMemo(() => {
    return computeCompositeScore(stats1, stats2, enabledMetrics);
  }, [stats1, stats2, enabledMetrics]);
  
  return useMemo(() => ({
    // Legacy compatibility
    allConstructors,
    constructor1,
    constructor2,
    loading,
    error,
    handleSelectConstructor,
    
    // New comparison features
    years,
    selection1,
    selection2,
    stats1,
    stats2,
    enabledMetrics,
    score,
    selectConstructor,
    selectConstructorForYears,
    toggleMetric,
    clearSelection,
  }), [
    allConstructors, constructor1, constructor2, loading, error, handleSelectConstructor,
    years, selection1, selection2, stats1, stats2, enabledMetrics, score, selectConstructor, selectConstructorForYears, toggleMetric, clearSelection
  ]);
}
