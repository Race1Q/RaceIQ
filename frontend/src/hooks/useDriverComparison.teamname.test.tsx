import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useDriverComparison } from './useDriverComparison';

// Mock fetch implementations
vi.mock('../lib/api', () => ({
  apiFetch: async (path: string) => {
    if (path.startsWith('/api/drivers/') && path.endsWith('/career-stats')) {
      // Return stats without team name
      return { wins: 1, podiums: 2, points: 10 } as any;
    }
    if (path === '/api/drivers') {
      return [
        { id: '99', full_name: 'Max Verstappen' },
      ];
    }
    if (path === '/api/races/years') {
      return [2025];
    }
    if (path.startsWith('/api/drivers/') && path.includes('/stats')) {
      return {
        driverId: 99,
        year: null,
        career: { wins: 1, podiums: 2, fastestLaps: 0, points: 10, dnfs: 0, sprintWins: 0, sprintPodiums: 0 },
        yearStats: null
      };
    }
    return {};
  }
}));

describe('useDriverComparison team name fallback', () => {
  it('populates team name from driverTeamMapping when missing in API', async () => {
    const { result } = renderHook(() => useDriverComparison());

    // Wait a tick for initial load
    await act(async () => { await Promise.resolve(); });

    act(() => {
      result.current.handleSelectDriver(1, '99');
    });

    await act(async () => { await Promise.resolve(); });

    expect(result.current.driver1?.teamName).toBe('Red Bull Racing');
  });
});
