// frontend/src/hooks/useDriverComparison.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

// NEW: Types for the comparison feature
export type DriverSelection = {
  driverId: string;
  year: number | 'career';
};

export type DriverComparisonStats = {
  driverId: number;
  year: number | null;
  career: {
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    dnfs: number;
    sprintWins: number;
    sprintPodiums: number;
  };
  yearStats: null | {
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    dnfs: number;
    sprintWins: number;
    sprintPodiums: number;
    poles: number;
  };
};

export type MetricKey = 'wins' | 'podiums' | 'fastestLaps' | 'points' | 'sprintWins' | 'sprintPodiums' | 'dnfs' | 'poles';

export type EnabledMetrics = Record<MetricKey, boolean>;

export type CompositeScore = {
  d1: number | null;
  d2: number | null;
  perMetric: Record<MetricKey, [number, number]>;
};

// LEGACY: Existing type for backward compatibility
export type DriverDetails = {
  id: string;
  fullName: string;
  teamName: string;
  championshipStanding: number | string | null;
  wins: number;
  podiums: number;
  points: number;
  imageUrl: string;
  teamColorToken: string;
};

type DriverListItem = {
  id: number | string;
  full_name?: string;
  code?: string | null;
  family_name?: string | null;
  given_name?: string | null;
  current_team_name?: string | null;
  image_url?: string | null;
  team_color?: string | null;
};

// Enhanced hook state with new features
type HookState = {
  // Original compatibility
  allDrivers: DriverListItem[];
  driver1: DriverDetails | null;
  driver2: DriverDetails | null;
  loading: boolean;
  error: string | null;
  handleSelectDriver: (slot: 1 | 2, driverId: string) => void;
  
  // NEW: Comparison features
  years: number[];
  selection1: DriverSelection | null;
  selection2: DriverSelection | null;
  stats1: DriverComparisonStats | null;
  stats2: DriverComparisonStats | null;
  enabledMetrics: EnabledMetrics;
  score: CompositeScore;
  selectDriver: (slot: 1 | 2, driverId: string, year: number | 'career') => void;
  selectDriverForYears: (slot: 1 | 2, driverId: string, years: number[]) => void;
  toggleMetric: (metric: MetricKey) => void;
  clearSelection: (slot: 1 | 2) => void;
};

// HTTP helper using central apiFetch with automatic /api prefix.
const getJSON = <T,>(path: string) => apiFetch<T>(`/api${path.startsWith('/') ? path : `/${path}`}`);

// Fetch functions
async function fetchDriversList(): Promise<DriverListItem[]> {
  // Use the same endpoint as the drivers page to get team information
  const response = await fetch(`/api/standings/2025/99`);
  if (!response.ok) {
    throw new Error(`Failed to fetch driver standings: ${response.status}`);
  }
  const data = await response.json();
  
  const driverStandings = (data as any)?.driverStandings || [];
  
  // Transform standings data to match DriverListItem format
  return driverStandings.map((standing: any) => {
    if (!standing || !standing.driverId) return null;
    
    const teamName = standing.constructorName || 'Unknown Team';
    const fullName = standing.driverFullName || `${standing.driverFirstName || ''} ${standing.driverLastName || ''}`.trim();
    
    return {
      id: standing.driverId as number,
      full_name: fullName,
      given_name: standing.driverFirstName || '',
      family_name: standing.driverLastName || '',
      code: standing.driverCode || null,
      current_team_name: teamName, // This is the key fix!
      image_url: standing.driverProfileImageUrl || null,
      team_color: null, // Will be populated later if needed
      country_code: standing.driverCountryCode || null,
      driver_number: standing.driverNumber || null,
    };
  }).filter(Boolean);
}

async function fetchYears(): Promise<number[]> {
  try {
    return await getJSON<number[]>('/races/years');
  } catch {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => currentYear - i);
  }
}

async function fetchDriverStats(driverId: string, year?: number | 'career'): Promise<DriverComparisonStats> {
  const yearParam = year && year !== 'career' ? `?year=${year}` : '';
  return getJSON<DriverComparisonStats>(`/drivers/${driverId}/stats${yearParam}`);
}

// NEW: Aggregate multiple years of stats
async function fetchDriverStatsForYears(driverId: string, years: number[]): Promise<DriverComparisonStats> {
  if (years.length === 0) {
    return fetchDriverStats(driverId, 'career');
  }
  
  if (years.length === 1) {
    return fetchDriverStats(driverId, years[0]);
  }
  
  // Fetch stats for each year and aggregate
  const yearStats = await Promise.all(
    years.map(year => fetchDriverStats(driverId, year))
  );
  
  // Aggregate the yearStats from each year
  const aggregatedYearStats = yearStats.reduce((acc, stats) => {
    if (stats.yearStats) {
      acc.wins += stats.yearStats.wins;
      acc.podiums += stats.yearStats.podiums;
      acc.fastestLaps += stats.yearStats.fastestLaps;
      acc.points += stats.yearStats.points;
      acc.dnfs += stats.yearStats.dnfs;
      acc.sprintWins += stats.yearStats.sprintWins;
      acc.sprintPodiums += stats.yearStats.sprintPodiums;
      acc.poles += stats.yearStats.poles || 0;
    }
    return acc;
  }, {
    wins: 0,
    podiums: 0,
    fastestLaps: 0,
    points: 0,
    dnfs: 0,
    sprintWins: 0,
    sprintPodiums: 0,
    poles: 0,
  });
  
  // Return the aggregated stats in the same format
  return {
    driverId: yearStats[0].driverId,
    year: null, // Multiple years aggregated
    career: yearStats[0].career, // Keep career stats as reference
    yearStats: aggregatedYearStats,
  };
}

// Legacy stats fetch
async function fetchDriverLegacyStats(driverId: string): Promise<any> {
  try {
    return await getJSON<any>(`/drivers/${driverId}/career-stats`);
  } catch {
    return await getJSON<any>(`/drivers/${driverId}/stats`);
  }
}

// Scoring functions
function normalizeMetric(metric: MetricKey, value1: number, value2: number): [number, number] {
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
  stats1: DriverComparisonStats | null,
  stats2: DriverComparisonStats | null,
  enabledMetrics: EnabledMetrics
): CompositeScore {
  if (!stats1 || !stats2) {
    return { d1: null, d2: null, perMetric: {} as Record<MetricKey, [number, number]> };
  }
  
  const perMetric: Record<MetricKey, [number, number]> = {} as Record<MetricKey, [number, number]>;
  let totalScore1 = 0;
  let totalScore2 = 0;
  let enabledCount = 0;
  
  const useYearStats = stats1.yearStats !== null && stats2.yearStats !== null;
  const s1 = useYearStats ? stats1.yearStats! : stats1.career;
  const s2 = useYearStats ? stats2.yearStats! : stats2.career;
  
  const metrics: MetricKey[] = ['wins', 'podiums', 'fastestLaps', 'points', 'sprintWins', 'sprintPodiums', 'dnfs'];
  
  if (useYearStats && (s1 as any).poles !== undefined && (s2 as any).poles !== undefined) {
    metrics.push('poles');
  }
  
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
    d1: enabledCount > 0 ? Math.round((totalScore1 / enabledCount) * 100) : null,
    d2: enabledCount > 0 ? Math.round((totalScore2 / enabledCount) * 100) : null,
    perMetric,
  };
}

// Legacy mapping function
function mapStatsToDetails(id: string, base: Partial<DriverListItem> | undefined, stats: any): DriverDetails {
  const fullName = base?.full_name || 
                  [base?.given_name, base?.family_name].filter(Boolean).join(' ') ||
                  base?.code || 
                  String(id);

  const teamName = base?.current_team_name || stats?.teamName || '—';

  return {
    id,
    fullName,
    teamName,
    championshipStanding: stats?.championshipStanding ?? null,
    wins: Number(stats?.wins ?? stats?.totalWins ?? stats?.careerWins ?? 0) || 0,
    podiums: Number(stats?.podiums ?? stats?.totalPodiums ?? stats?.careerPodiums ?? 0) || 0,
    points: Number(stats?.points ?? stats?.totalPoints ?? 0) || 0,
    imageUrl: base?.image_url ?? stats?.imageUrl ?? '',
    teamColorToken: base?.team_color ?? stats?.teamColorToken ?? '',
  };
}

export function useDriverComparison(): HookState {
  // State
  const [allDrivers, setAllDrivers] = useState<DriverListItem[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [driver1, setDriver1] = useState<DriverDetails | null>(null);
  const [driver2, setDriver2] = useState<DriverDetails | null>(null);
  const [selection1, setSelection1] = useState<DriverSelection | null>(null);
  const [selection2, setSelection2] = useState<DriverSelection | null>(null);
  const [stats1, setStats1] = useState<DriverComparisonStats | null>(null);
  const [stats2, setStats2] = useState<DriverComparisonStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default all metrics enabled
  const [enabledMetrics, setEnabledMetrics] = useState<EnabledMetrics>({
    wins: true,
    podiums: true,
    fastestLaps: true,
    points: true,
    sprintWins: true,
    sprintPodiums: true,
    dnfs: true,
    poles: true,
  });
  
  // Load initial data
  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    Promise.all([fetchDriversList(), fetchYears()])
      .then(([driversList, yearsList]) => {
        if (alive) {
          setAllDrivers(driversList);
          setYears([...yearsList].sort((a, b) => b - a));
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
    (id: string) => allDrivers.find(d => String(d.id) === String(id)),
    [allDrivers]
  );
  
  // Legacy driver select for backward compatibility
  const handleSelectDriver = useCallback((slot: 1 | 2, driverId: string) => {
    if (!driverId) return;
    
    setLoading(true);
    setError(null);
    
    fetchDriverLegacyStats(driverId)
      .then((stats) => {
        const base = getListItem(driverId);
        const details = mapStatsToDetails(driverId, base, stats);
        if (slot === 1) setDriver1(details);
        else setDriver2(details);
      })
      .catch((e) => setError(e.message || 'Failed to load driver stats'))
      .finally(() => setLoading(false));
  }, [getListItem]);
  
  // NEW: Enhanced driver select with year support
  const selectDriver = useCallback((slot: 1 | 2, driverId: string, year: number | 'career') => {
    if (!driverId) return;
    
  const selection = { driverId, year };
    
    setLoading(true);
    setError(null);
    
    if (slot === 1) {
      setSelection1(selection);
    } else {
      setSelection2(selection);
    }
    
    // Also set driver details for UI display
    const base = getListItem(driverId);
    if (base) {
      const details = mapStatsToDetails(driverId, base, null);
      if (slot === 1) {
        setDriver1(details);
      } else {
        setDriver2(details);
      }
    }
    
    // Fetch comparison stats
    const yearParam = year === 'career' ? undefined : year;
    fetchDriverStats(driverId, yearParam)
      .then((stats) => {
        if (slot === 1) {
          setStats1(stats);
        } else {
          setStats2(stats);
        }
      })
      .catch((e) => setError(e.message || 'Failed to load driver stats'))
      .finally(() => setLoading(false));
  }, [getListItem]);

  // NEW: Enhanced driver select with multiple years support
  const selectDriverForYears = useCallback((slot: 1 | 2, driverId: string, years: number[]) => {
    if (!driverId) return;
    
    setLoading(true);
    setError(null);
    
    // Fetch aggregated stats for multiple years
    fetchDriverStatsForYears(driverId, years)
      .then((stats) => {
        if (slot === 1) {
          setStats1(stats);
        } else {
          setStats2(stats);
        }
      })
      .catch((e) => setError(e.message || 'Failed to load driver stats'))
      .finally(() => setLoading(false));
  }, []);
  
  // Toggle metric function
  const toggleMetric = useCallback((metric: MetricKey) => {
    setEnabledMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  }, []);

  // Clear selection/driver for a slot
  const clearSelection = useCallback((slot: 1 | 2) => {
    if (slot === 1) {
      setDriver1(null);
      setSelection1(null);
      setStats1(null);
    } else {
      setDriver2(null);
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
    allDrivers,
    driver1,
    driver2,
    loading,
    error,
    handleSelectDriver,
    
    // New comparison features
    years,
    selection1,
    selection2,
    stats1,
    stats2,
    enabledMetrics,
    score,
    selectDriver,
    selectDriverForYears,
    toggleMetric,
    clearSelection,
  }), [
    allDrivers, driver1, driver2, loading, error, handleSelectDriver,
    years, selection1, selection2, stats1, stats2, enabledMetrics, score, selectDriver, selectDriverForYears, toggleMetric, clearSelection
  ]);
}
