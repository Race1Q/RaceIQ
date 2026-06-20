import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  SEASON_FALLBACK_YEAR,
  getCalendarSeasonYear,
  resolveFetchedSeasonYear,
} from './seasonYear';

describe('seasonYear', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolveFetchedSeasonYear returns requested year when present', () => {
    expect(resolveFetchedSeasonYear(2024, [2025, 2024, 2023])).toBe(2024);
  });

  it('falls back from calendar year to the latest available prior year when calendar year missing', () => {
    vi.useFakeTimers({ now: new Date('2026-06-01T12:00:00Z') });
    expect(getCalendarSeasonYear()).toBe(2026);
    expect(resolveFetchedSeasonYear(2026, [2025, 2024])).toBe(2025);
    vi.useRealTimers();
  });

  it('uses SEASON_FALLBACK_YEAR for the calendar year when present in the list', () => {
    vi.useFakeTimers({ now: new Date(`${SEASON_FALLBACK_YEAR}-06-01T12:00:00Z`) });
    expect(resolveFetchedSeasonYear(SEASON_FALLBACK_YEAR, [SEASON_FALLBACK_YEAR, SEASON_FALLBACK_YEAR - 1])).toBe(SEASON_FALLBACK_YEAR);
    vi.useRealTimers();
  });

  it('keeps explicit historical year when missing from list', () => {
    vi.useFakeTimers({ now: new Date('2026-06-01T12:00:00Z') });
    expect(resolveFetchedSeasonYear(1999, [2025, 2024])).toBe(1999);
    vi.useRealTimers();
  });
});
