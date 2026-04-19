import { useEffect, useState } from 'react';
import { buildApiUrl } from '../lib/api';
import { getCalendarSeasonYear, resolveFetchedSeasonYear } from '../lib/seasonYear';

/**
 * Loads `/api/seasons` once and picks a default display year: calendar year if ingested, otherwise 2025 (or best alternative).
 */
export function useResolvedDefaultSeasonYear() {
  const [defaultSeasonYear, setDefaultSeasonYear] = useState(() => getCalendarSeasonYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/seasons'));
        if (!res.ok) throw new Error(`seasons ${res.status}`);
        const seasons = await res.json();
        const years = Array.isArray(seasons)
          ? seasons
              .map((s: { year: number }) => s.year)
              .filter((y: unknown) => typeof y === 'number' && Number.isFinite(y))
          : [];
        if (alive) setDefaultSeasonYear(resolveFetchedSeasonYear(getCalendarSeasonYear(), years));
      } catch {
        if (alive) setDefaultSeasonYear(resolveFetchedSeasonYear(getCalendarSeasonYear(), []));
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, []);

  return { defaultSeasonYear, loading };
}
