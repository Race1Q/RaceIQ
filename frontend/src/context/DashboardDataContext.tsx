// frontend/src/context/DashboardDataContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';
import { getCalendarSeasonYear, resolveFetchedSeasonYear } from '../lib/seasonYear';

interface DriverStandingsData {
  id: number;
  fullName: string;
  teamName: string;
  wins: number;
  podiums: number;
  points: number;
  position: number;
  headshotUrl?: string | null;
}

interface SeasonData {
  id: number;
  year: number;
}

interface DashboardSharedDataContextType {
  driverStandings: DriverStandingsData[];
  seasons: SeasonData[];
  loadingDriverStandings: boolean;
  loadingSeasons: boolean;
  errorDriverStandings: string | null;
  errorSeasons: string | null;
  refetchDriverStandings: () => Promise<void>;
  refetchSeasons: () => Promise<void>;
}

const DashboardSharedDataContext = createContext<DashboardSharedDataContextType | undefined>(undefined);

export function DashboardSharedDataProvider({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently } = useAuth0();

  const [driverStandings, setDriverStandings] = useState<DriverStandingsData[]>([]);
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loadingDriverStandings, setLoadingDriverStandings] = useState(true);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [errorDriverStandings, setErrorDriverStandings] = useState<string | null>(null);
  const [errorSeasons, setErrorSeasons] = useState<string | null>(null);

  const fetchStandingsForYear = useCallback(async (year: number, token: string) => {
    const res = await fetch(buildApiUrl(`/api/drivers/standings/${year}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch standings: ${res.status}`);
    const payload = await res.json();
    return (payload as any[]).map((d: any) => ({
      id: Number(d.id ?? d.driverId),
      fullName: d.fullname || d.fullName || `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim(),
      teamName: d.constructor || d.teamName || 'Unknown',
      wins: Number(d.wins ?? 0),
      podiums: Number(d.podiums ?? 0),
      points: Number(d.points ?? 0),
      position: Number(d.position ?? 0),
      headshotUrl: d.profileimageurl || d.profileImageUrl || d.headshotUrl || undefined,
    })).filter((r) => !!r.id && !!r.fullName) as DriverStandingsData[];
  }, []);

  const loadStandingsForSeasons = useCallback(
    async (seasonsList: SeasonData[], token: string) => {
      const years = seasonsList.map((s) => s.year);
      const effective = resolveFetchedSeasonYear(getCalendarSeasonYear(), years);
      setDriverStandings(await fetchStandingsForYear(effective, token));
    },
    [fetchStandingsForYear],
  );

  const fetchSeasons = useCallback(async () => {
    try {
      setLoadingSeasons(true);
      setLoadingDriverStandings(true);
      setErrorSeasons(null);
      setErrorDriverStandings(null);
      const token = await getAccessTokenSilently();

      // Standings used to wait on /api/seasons purely to learn which year to ask
      // for. The calendar year is right almost every time, so speculate on it and
      // fire both requests together; only pay for a second standings call on the
      // rare miss (season not ingested yet).
      const guessedYear = getCalendarSeasonYear();
      const [seasonsRes, guessedStandings] = await Promise.all([
        fetch(buildApiUrl('/api/seasons'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchStandingsForYear(guessedYear, token).catch(() => null),
      ]);

      if (!seasonsRes.ok) throw new Error(`Failed to fetch seasons: ${seasonsRes.status}`);
      const data = await seasonsRes.json();
      setSeasons(data);

      const effective = resolveFetchedSeasonYear(
        guessedYear,
        (data as SeasonData[]).map((s) => s.year),
      );
      if (effective === guessedYear && guessedStandings) {
        setDriverStandings(guessedStandings);
      } else {
        setDriverStandings(await fetchStandingsForYear(effective, token));
      }
    } catch (e: any) {
      setErrorSeasons(e.message || 'Failed to load seasons');
      setErrorDriverStandings(e.message || 'Failed to load driver standings');
    } finally {
      setLoadingSeasons(false);
      setLoadingDriverStandings(false);
    }
  }, [getAccessTokenSilently, fetchStandingsForYear]);

  const refetchDriverStandings = useCallback(async () => {
    try {
      setLoadingDriverStandings(true);
      setErrorDriverStandings(null);
      const token = await getAccessTokenSilently();
      await loadStandingsForSeasons(seasons, token);
    } catch (e: any) {
      setErrorDriverStandings(e.message || 'Failed to load driver standings');
    } finally {
      setLoadingDriverStandings(false);
    }
  }, [getAccessTokenSilently, seasons, loadStandingsForSeasons]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const value: DashboardSharedDataContextType = {
    driverStandings,
    seasons,
    loadingDriverStandings,
    loadingSeasons,
    errorDriverStandings,
    errorSeasons,
    refetchDriverStandings,
    refetchSeasons: fetchSeasons,
  };

  return (
    <DashboardSharedDataContext.Provider value={value}>
      {children}
    </DashboardSharedDataContext.Provider>
  );
}

export function useDashboardSharedData() {
  const context = useContext(DashboardSharedDataContext);
  if (context === undefined) {
    throw new Error('useDashboardSharedData must be used within a DashboardSharedDataProvider');
  }
  return context;
}
