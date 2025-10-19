// frontend/src/hooks/useDriverComparison.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, buildApiUrl } from '../lib/api';
import { useAuth0 } from '@auth0/auth0-react';
import type { RecentFormResult } from './useRecentForm';
import { getCSIForDriver, applyCSIDampener } from '../lib/csi';

// Helper function to calculate recent form average
function calculateRecentFormAverage(recentForm: RecentFormResult[]): number {
  if (!recentForm || recentForm.length === 0) {
    return 0;
  }
  const total = recentForm.reduce((sum, race) => sum + race.position, 0);
  return Math.round((total / recentForm.length) * 100) / 100; // Round to 2 decimal places
}

// NEW: Types for the comparison feature
export type DriverSelection = {
  driverId: string;
  year: number | 'career';
};

export type DriverComparisonStats = {
  driverId: number;
  year: number | null;
  constructorName?: string; // Added for CSI integration
  career: {
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    dnfs: number;
    sprintWins: number;
    sprintPodiums: number;
    poles: number;
    races: number;
    recentForm: number; // Average position in recent races
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
    races: number;
    recentForm: number; // Average position in recent races
  };
};

export type MetricKey = 'wins' | 'podiums' | 'fastestLaps' | 'points' | 'sprintWins' | 'sprintPodiums' | 'dnfs' | 'poles' | 'races';

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
  const response = await fetch(buildApiUrl(`/api/standings/2025/99`));
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

async function fetchDriverStats(driverId: string, year?: number | 'career', token?: string): Promise<DriverComparisonStats> {
  if (year === 'career' || !year) {
    // Use career-stats endpoint for career/all-time data (includes fastest laps)
    const response = await apiFetch<any>(`/api/drivers/${driverId}/career-stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    // Use recent form data from career stats (precomputed in materialized view)
    let recentFormAverage = response.careerStats?.recentForm || 0;
    
    // Fallback: if career stats doesn't have recent form, fetch it separately
    if (!recentFormAverage || recentFormAverage === 0) {
      try {
        const recentFormResponse = await apiFetch<RecentFormResult[]>(`/api/drivers/${driverId}/recent-form`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        recentFormAverage = calculateRecentFormAverage(recentFormResponse);
      } catch (error) {
        console.warn(`Failed to fetch recent form for driver ${driverId}:`, error);
        recentFormAverage = 0;
      }
    }
    
    return {
      driverId: parseInt(driverId, 10),
      year: null, // Career data
      constructorName: response.driver?.currentTeamName || response.driver?.teamName || 'Unknown',
      career: {
        wins: response.careerStats?.wins || 0,
        podiums: response.careerStats?.podiums || 0,
        fastestLaps: response.careerStats?.fastestLaps || 0,
        points: response.careerStats?.points || 0,
        dnfs: response.careerStats?.dnfs || 0,
        sprintWins: response.careerStats?.sprintWins || 0,
        sprintPodiums: response.careerStats?.sprintPodiums || 0,
        poles: response.careerStats?.poles || 0,
        races: response.careerStats?.grandsPrixEntered || 0,
        recentForm: recentFormAverage,
      },
      yearStats: null, // Career data only
    };
  } else {
    // Use stats endpoint for year-specific data (no fastest laps for years)
    const response = await apiFetch<any>(`/api/drivers/${driverId}/stats?year=${year}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    // Fetch recent form data for year-specific comparison (still need separate API call)
    let recentFormAverage = 0;
    try {
      const recentFormResponse = await apiFetch<RecentFormResult[]>(`/api/drivers/${driverId}/recent-form`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      recentFormAverage = calculateRecentFormAverage(recentFormResponse);
    } catch (error) {
      console.warn(`Failed to fetch recent form for driver ${driverId} (year ${year}):`, error);
      recentFormAverage = 0;
    }
    
    return {
      driverId: response.driverId || parseInt(driverId, 10),
      year: response.year,
      constructorName: response.driver?.currentTeamName || response.driver?.teamName || 'Unknown',
      career: {
        wins: response.career?.wins || 0,
        podiums: response.career?.podiums || 0,
        fastestLaps: 0, // No fastest laps for year-specific data
        points: response.career?.points || 0,
        dnfs: response.career?.dnfs || 0,
        sprintWins: response.career?.sprintWins || 0,
        sprintPodiums: response.career?.sprintPodiums || 0,
        poles: response.career?.poles || 0,
        races: response.career?.races || 0,
        recentForm: recentFormAverage,
      },
      yearStats: response.yearStats ? {
        wins: response.yearStats.wins || 0,
        podiums: response.yearStats.podiums || 0,
        fastestLaps: 0, // No fastest laps for year-specific data
        points: response.yearStats.points || 0,
        dnfs: response.yearStats.dnfs || 0,
        sprintWins: response.yearStats.sprintWins || 0,
        sprintPodiums: response.yearStats.sprintPodiums || 0,
        poles: response.yearStats.poles || 0,
        races: response.yearStats.races || 0,
        recentForm: recentFormAverage,
      } : null,
    };
  }
}

// NEW: Aggregate multiple years of stats
async function fetchDriverStatsForYears(driverId: string, years: number[], token?: string): Promise<DriverComparisonStats> {
  if (years.length === 0) {
    return fetchDriverStats(driverId, 'career', token);
  }
  
  if (years.length === 1) {
    return fetchDriverStats(driverId, years[0], token);
  }
  
  // Multiple years selected = career comparison (use career-stats endpoint for fastest laps)
  return fetchDriverStats(driverId, 'career', token);
}

// Legacy stats fetch
async function fetchDriverLegacyStats(driverId: string): Promise<any> {
  try {
    return await getJSON<any>(`/drivers/${driverId}/career-stats`);
  } catch {
    return await getJSON<any>(`/drivers/${driverId}/stats`);
  }
}

// Metric weights for more realistic scoring
const METRIC_WEIGHTS: Record<MetricKey, number> = {
  wins: 3.0,           // Most important - wins define champions
  podiums: 2.0,        // Very important - consistent performance
  points: 1.0,         // Standard baseline
  poles: 1.5,          // Important - qualifying performance
  fastestLaps: 0.8,    // Less important - can be luck-based
  sprintWins: 2.5,     // Important - new format wins
  sprintPodiums: 1.8,  // Important - sprint performance
  dnfs: 0.5,          // Negative metric - reliability
  races: 0.3,         // Context metric - participation
};

// Improved scoring functions with weighted metrics and logarithmic scaling
function normalizeMetric(metric: MetricKey, value1: number, value2: number): [number, number] {
  if (metric === 'dnfs') {
    // For DNFs, lower values are better
    if (value1 === 0 && value2 === 0) return [1.0, 1.0];
    const max = Math.max(value1, value2);
    if (max === 0) return [0.5, 0.5];
    return [1 - value1 / max, 1 - value2 / max];
  }
  
  // Handle zero values better
  if (value1 === 0 && value2 === 0) return [0.5, 0.5];
  
  // Use logarithmic scaling for large differences (e.g., 1000 vs 100 points)
  const log1 = value1 > 0 ? Math.log(value1 + 1) : 0;
  const log2 = value2 > 0 ? Math.log(value2 + 1) : 0;
  const maxLog = Math.max(log1, log2);
  
  if (maxLog === 0) return [0.5, 0.5];
  
  return [log1 / maxLog, log2 / maxLog];
}

// Enhanced normalization with CSI (Constructor Strength Index) adjustments
function normalizeMetricWithCSI(
  metric: MetricKey, 
  value1: number, 
  value2: number, 
  season: number,
  constructor1: string,
  constructor2: string
): [number, number] {
  // First, get the base normalized scores
  const [base1, base2] = normalizeMetric(metric, value1, value2);
  
  // Determine if this is a "higher is better" or "lower is better" metric
  const kind = metric === 'dnfs' ? 'lower' : 'higher';
  
  // Get CSI values for both constructors
  const csi1 = getCSIForDriver(season, constructor1);
  const csi2 = getCSIForDriver(season, constructor2);
  
  // Apply CSI dampening with moderate alpha for balanced adjustments
  const adjusted1 = applyCSIDampener(base1, csi1, kind, 0.3);
  const adjusted2 = applyCSIDampener(base2, csi2, kind, 0.3);
  
  // Moderate bonuses for small teams (CSI < 0.9) - only for truly small teams
  let smallTeamBonus1 = 1.0;
  let smallTeamBonus2 = 1.0;
  
  if (csi1 < 0.9) {
    // Small team bonuses - more conservative
    if (metric === 'points') smallTeamBonus1 = 1.15;      // 15% bonus for points
    else if (metric === 'podiums') smallTeamBonus1 = 1.1; // 10% bonus for podiums
    else if (metric === 'wins') smallTeamBonus1 = 1.2;    // 20% bonus for wins
  }
  
  if (csi2 < 0.9) {
    // Small team bonuses - more conservative
    if (metric === 'points') smallTeamBonus2 = 1.15;      // 15% bonus for points
    else if (metric === 'podiums') smallTeamBonus2 = 1.1; // 10% bonus for podiums
    else if (metric === 'wins') smallTeamBonus2 = 1.2;    // 20% bonus for wins
  }
  
  return [adjusted1 * smallTeamBonus1, adjusted2 * smallTeamBonus2];
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
  
  const metrics: MetricKey[] = ['wins', 'podiums', 'fastestLaps', 'points', 'sprintWins', 'sprintPodiums', 'dnfs', 'races'];
  
  if (useYearStats && (s1 as any).poles !== undefined && (s2 as any).poles !== undefined) {
    metrics.push('poles');
  }
  
  metrics.forEach(metric => {
    if (!enabledMetrics[metric]) return;
    
    const value1 = (s1 as any)[metric] || 0;
    const value2 = (s2 as any)[metric] || 0;
    
    // Use CSI-adjusted normalization if constructor info is available
    let normalized: [number, number];
    if (stats1.constructorName && stats2.constructorName) {
      const season = stats1.year || new Date().getFullYear();
      normalized = normalizeMetricWithCSI(metric, value1, value2, season, stats1.constructorName, stats2.constructorName);
    } else {
      normalized = normalizeMetric(metric, value1, value2);
    }
    
    // Apply metric weights for more realistic scoring
    const weight = METRIC_WEIGHTS[metric] || 1.0;
    const weighted1 = normalized[0] * weight;
    const weighted2 = normalized[1] * weight;
    
    perMetric[metric] = [weighted1, weighted2];
    totalScore1 += weighted1;
    totalScore2 += weighted2;
    enabledCount += weight; // Use weighted count for proper averaging
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
  const { getAccessTokenSilently } = useAuth0();
  
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
  
  // Default all metrics enabled (fastestLaps will be conditionally available)
  const [enabledMetrics, setEnabledMetrics] = useState<EnabledMetrics>({
    wins: true,
    podiums: true,
    fastestLaps: false, // Disabled by default, only enabled for career comparisons
    points: true,
    sprintWins: true,
    sprintPodiums: true,
    dnfs: true,
    poles: true,
    races: true,
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
  const selectDriver = useCallback(async (slot: 1 | 2, driverId: string, year: number | 'career') => {
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
    
    try {
      // Get authentication token
      const token = await getAccessTokenSilently();
      
      // Fetch comparison stats
      const yearParam = year === 'career' ? undefined : year;
      const stats = await fetchDriverStats(driverId, yearParam, token);
      
      if (slot === 1) {
        setStats1(stats);
      } else {
        setStats2(stats);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load driver stats');
    } finally {
      setLoading(false);
    }
  }, [getListItem, getAccessTokenSilently]);

  // NEW: Enhanced driver select with multiple years support
  const selectDriverForYears = useCallback(async (slot: 1 | 2, driverId: string, years: number[]) => {
    if (!driverId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token
      const token = await getAccessTokenSilently();
      
      // Fetch aggregated stats for multiple years
      const stats = await fetchDriverStatsForYears(driverId, years, token);
      
      if (slot === 1) {
        setStats1(stats);
      } else {
        setStats2(stats);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load driver stats');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);
  
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
