// frontend/src/context/DashboardDataContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';

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
  const currentSeason = new Date().getFullYear();

  const [driverStandings, setDriverStandings] = useState<DriverStandingsData[]>([]);
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loadingDriverStandings, setLoadingDriverStandings] = useState(true);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [errorDriverStandings, setErrorDriverStandings] = useState<string | null>(null);
  const [errorSeasons, setErrorSeasons] = useState<string | null>(null);

  // Fetch driver standings for current season
  const fetchDriverStandings = useCallback(async () => {
    try {
      setLoadingDriverStandings(true);
      setErrorDriverStandings(null);
      const token = await getAccessTokenSilently();
      const res = await fetch(buildApiUrl(`/api/drivers/standings/${currentSeason}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch standings: ${res.status}`);
      const payload = await res.json();
      const rows: DriverStandingsData[] = (payload as any[]).map((d: any) => ({
        id: Number(d.id ?? d.driverId),
        fullName: d.fullname || d.fullName || `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim(),
        teamName: d.constructor || d.teamName || 'Unknown',
        wins: Number(d.wins ?? 0),
        podiums: Number(d.podiums ?? 0),
        points: Number(d.points ?? 0),
        position: Number(d.position ?? 0),
        headshotUrl: d.profileimageurl || d.profileImageUrl || d.headshotUrl || undefined,
      })).filter(r => !!r.id && !!r.fullName);
      setDriverStandings(rows);
    } catch (e: any) {
      setErrorDriverStandings(e.message || 'Failed to load driver standings');
    } finally {
      setLoadingDriverStandings(false);
    }
  }, [getAccessTokenSilently, currentSeason]);

  // Fetch seasons data
  const fetchSeasons = useCallback(async () => {
    try {
      setLoadingSeasons(true);
      setErrorSeasons(null);
      const token = await getAccessTokenSilently();
      const res = await fetch(buildApiUrl('/api/seasons'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch seasons: ${res.status}`);
      const data = await res.json();
      setSeasons(data);
    } catch (e: any) {
      setErrorSeasons(e.message || 'Failed to load seasons');
    } finally {
      setLoadingSeasons(false);
    }
  }, [getAccessTokenSilently]);

  // Initial data fetch
  useEffect(() => {
    fetchDriverStandings();
    fetchSeasons();
  }, [fetchDriverStandings, fetchSeasons]);

  const value: DashboardSharedDataContextType = {
    driverStandings,
    seasons,
    loadingDriverStandings,
    loadingSeasons,
    errorDriverStandings,
    errorSeasons,
    refetchDriverStandings: fetchDriverStandings,
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

