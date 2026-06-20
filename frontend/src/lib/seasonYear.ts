/** Last fully ingested season when the calendar year is not in the DB yet. */
export const SEASON_FALLBACK_YEAR = 2026;

export function getCalendarSeasonYear(date = new Date()): number {
  return date.getFullYear();
}

/**
 * If `requestedYear` exists in `availableYears`, use it.
 * If it equals the calendar year but is missing, use {@link SEASON_FALLBACK_YEAR} when present,
 * else the latest year strictly before the calendar year, else the fallback constant.
 */
export function resolveFetchedSeasonYear(
  requestedYear: number,
  availableYears: number[],
): number {
  const sorted = [...new Set(availableYears.filter((y) => Number.isFinite(y)))].sort((a, b) => b - a);
  const set = new Set(sorted);
  if (set.has(requestedYear)) return requestedYear;

  const cal = getCalendarSeasonYear();
  if (requestedYear !== cal) return requestedYear;

  if (set.has(SEASON_FALLBACK_YEAR)) return SEASON_FALLBACK_YEAR;

  const best = sorted.find((y) => y < cal);
  if (best !== undefined) return best;

  return SEASON_FALLBACK_YEAR;
}
