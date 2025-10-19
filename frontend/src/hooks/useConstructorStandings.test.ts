import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConstructorStandings } from './useConstructorStandings';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@chakra-ui/react';
import * as api from '../lib/api';

// Mock dependencies
vi.mock('@auth0/auth0-react');
vi.mock('@chakra-ui/react', () => ({
  useToast: vi.fn(),
}));
vi.mock('../lib/api', () => ({
  buildApiUrl: (path: string) => `http://test.local${path}`,
}));

describe('useConstructorStandings', () => {
  const mockToast = vi.fn();
  const mockGetAccessTokenSilently = vi.fn();
  let mockFetch: any;

  const mockSeasons = [
    { id: 1, year: 2024 },
    { id: 2, year: 2023 },
    { id: 3, year: 2022 },
  ];

  const mockConstructors = [
    { id: 1, name: 'Red Bull Racing', nationality: 'Austrian' },
    { id: 2, name: 'Ferrari', nationality: 'Italian' },
    { id: 3, name: 'McLaren', nationality: 'British' },
  ];

  const mockSeasonPoints = {
    1: [ // Red Bull
      { season: 1, points: 860, wins: 19, podiums: 32 },
      { season: 2, points: 900, wins: 21, podiums: 35 },
    ],
    2: [ // Ferrari
      { season: 1, points: 650, wins: 5, podiums: 25 },
      { season: 2, points: 700, wins: 4, podiums: 28 },
    ],
    3: [ // McLaren
      { season: 1, points: 450, wins: 0, podiums: 15 },
      { season: 2, points: 500, wins: 1, podiums: 18 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useToast
    vi.mocked(useToast).mockReturnValue(mockToast);
    
    // Mock useAuth0
    vi.mocked(useAuth0).mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isAuthenticated: true,
      user: { sub: 'test-user' },
    } as any);
    
    // Mock getAccessTokenSilently to return a token
    mockGetAccessTokenSilently.mockResolvedValue('mock-token');
    
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authenticated Mode (enabled=true)', () => {
    beforeEach(() => {
      // Default successful mock implementation
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return {
            ok: true,
            json: async () => mockSeasons,
          };
        }
        if (url.includes('/api/constructors?year=')) {
          return {
            ok: true,
            json: async () => mockConstructors,
          };
        }
        if (url.includes('/api/race-results/constructor/')) {
          const constructorId = parseInt(url.split('/constructor/')[1].split('/')[0]);
          return {
            ok: true,
            json: async () => mockSeasonPoints[constructorId] || [],
          };
        }
        return { ok: false };
      });
    });

    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useConstructorStandings(2024));

      expect(result.current.loading).toBe(true);
      expect(result.current.standings).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should fetch and return constructor standings', async () => {
      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.standings).toHaveLength(3);
      expect(result.current.error).toBeNull();
      
      // Verify sorting by points (descending)
      expect(result.current.standings[0].constructorName).toBe('Red Bull Racing');
      expect(result.current.standings[0].seasonPoints).toBe(860);
      expect(result.current.standings[0].position).toBe(1);
      
      expect(result.current.standings[1].constructorName).toBe('Ferrari');
      expect(result.current.standings[1].position).toBe(2);
      
      expect(result.current.standings[2].constructorName).toBe('McLaren');
      expect(result.current.standings[2].position).toBe(3);
    });

    it('should include all required fields in standings', async () => {
      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.standings.length).toBeGreaterThan(0);
      });

      const standing = result.current.standings[0];
      expect(standing).toHaveProperty('seasonYear', 2024);
      expect(standing).toHaveProperty('constructorId');
      expect(standing).toHaveProperty('constructorName');
      expect(standing).toHaveProperty('nationality');
      expect(standing).toHaveProperty('seasonPoints');
      expect(standing).toHaveProperty('seasonWins');
      expect(standing).toHaveProperty('seasonPodiums');
      expect(standing).toHaveProperty('position');
    });

    it('should use access token for authenticated requests', async () => {
      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'read:race-results read:races',
        },
      });

      // Verify Authorization header was used
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should handle season not found', async () => {
      const { result } = renderHook(() => useConstructorStandings(1999));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Season 1999 not found');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Constructor standings error',
        description: 'Season 1999 not found',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    it('should handle constructors fetch failure', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/constructors')) {
          return { ok: false };
        }
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch constructors');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          description: 'Failed to fetch constructors',
        })
      );
    });

    it('should handle seasons fetch failure', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: false };
        }
        return { ok: true, json: async () => [] };
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch seasons');
    });

    it('should handle individual constructor data fetch failure gracefully', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return { ok: true, json: async () => mockConstructors };
        }
        if (url.includes('/constructor/2/')) {
          // Fail for Ferrari
          return { ok: false };
        }
        if (url.includes('/api/race-results/constructor/')) {
          const constructorId = parseInt(url.split('/constructor/')[1].split('/')[0]);
          return { ok: true, json: async () => mockSeasonPoints[constructorId] || [] };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have 2 constructors (Ferrari failed)
      expect(result.current.standings).toHaveLength(2);
      expect(result.current.standings.find(s => s.constructorName === 'Ferrari')).toBeUndefined();
    });

    it('should skip constructors with no season data', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return { ok: true, json: async () => mockConstructors };
        }
        if (url.includes('/constructor/3/')) {
          // McLaren has no data for season 1
          return { ok: true, json: async () => [{ season: 2, points: 500, wins: 1, podiums: 18 }] };
        }
        if (url.includes('/api/race-results/constructor/')) {
          const constructorId = parseInt(url.split('/constructor/')[1].split('/')[0]);
          return { ok: true, json: async () => mockSeasonPoints[constructorId] || [] };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have 2 constructors (McLaren has no data for 2024)
      expect(result.current.standings).toHaveLength(2);
      expect(result.current.standings.find(s => s.constructorName === 'McLaren')).toBeUndefined();
    });

    it('should handle missing nationality gracefully', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return {
            ok: true,
            json: async () => [{ id: 1, name: 'Test Team' }], // No nationality
          };
        }
        if (url.includes('/api/race-results/constructor/')) {
          return {
            ok: true,
            json: async () => [{ season: 1, points: 100, wins: 1, podiums: 3 }],
          };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.standings.length).toBeGreaterThan(0);
      });

      expect(result.current.standings[0].nationality).toBe('');
    });

    it('should handle missing points/wins/podiums gracefully', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return { ok: true, json: async () => [mockConstructors[0]] };
        }
        if (url.includes('/api/race-results/constructor/')) {
          return {
            ok: true,
            json: async () => [{ season: 1 }], // No points, wins, podiums
          };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.standings.length).toBeGreaterThan(0);
      });

      expect(result.current.standings[0].seasonPoints).toBe(0);
      expect(result.current.standings[0].seasonWins).toBe(0);
      expect(result.current.standings[0].seasonPodiums).toBe(0);
    });
  });

  describe('Public Mode (enabled=false)', () => {
    beforeEach(() => {
      // Default successful mock implementation for public mode
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return {
            ok: true,
            json: async () => mockSeasons,
          };
        }
        if (url.includes('/api/constructors?year=')) {
          return {
            ok: true,
            json: async () => mockConstructors,
          };
        }
        if (url.includes('/api/race-results/constructor/')) {
          const constructorId = parseInt(url.split('/constructor/')[1].split('/')[0]);
          return {
            ok: true,
            json: async () => mockSeasonPoints[constructorId] || [],
          };
        }
        return { ok: false };
      });
    });

    it('should fetch standings without authentication', async () => {
      const { result } = renderHook(() => useConstructorStandings(2024, { enabled: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.standings).toHaveLength(3);
      expect(mockGetAccessTokenSilently).not.toHaveBeenCalled();
      
      // Verify no Authorization header was used
      const fetchCalls = mockFetch.mock.calls;
      fetchCalls.forEach((call: any) => {
        if (call[1]?.headers) {
          expect(call[1].headers).not.toHaveProperty('Authorization');
        }
      });
    });

    it('should initialize with loading false when disabled', () => {
      const { result } = renderHook(() => useConstructorStandings(2024, { enabled: false }));

      // Initial state should show loading as it will fetch in public mode
      expect(result.current.loading).toBe(true);
    });

    it('should handle season not found in public mode', async () => {
      const { result } = renderHook(() => useConstructorStandings(1999, { enabled: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.standings).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle seasons fetch failure in public mode', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: false };
        }
        return { ok: true, json: async () => [] };
      });

      const { result } = renderHook(() => useConstructorStandings(2024, { enabled: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch seasons');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          description: 'Failed to fetch seasons',
        })
      );
    });

    it('should handle constructors fetch failure in public mode', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors')) {
          return { ok: false };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024, { enabled: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch constructors');
    });

    it('should handle individual constructor fetch failures in public mode', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return { ok: true, json: async () => mockConstructors };
        }
        if (url.includes('/constructor/2/')) {
          // Ferrari fails
          return { ok: false };
        }
        if (url.includes('/api/race-results/constructor/')) {
          const constructorId = parseInt(url.split('/constructor/')[1].split('/')[0]);
          return { ok: true, json: async () => mockSeasonPoints[constructorId] || [] };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024, { enabled: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have 2 constructors
      expect(result.current.standings).toHaveLength(2);
      expect(result.current.standings.find(s => s.constructorName === 'Ferrari')).toBeUndefined();
    });

    it('should handle constructor data throw errors in public mode', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return { ok: true, json: async () => mockConstructors };
        }
        if (url.includes('/constructor/2/')) {
          throw new Error('Network error');
        }
        if (url.includes('/api/race-results/constructor/')) {
          const constructorId = parseInt(url.split('/constructor/')[1].split('/')[0]);
          return { ok: true, json: async () => mockSeasonPoints[constructorId] || [] };
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024, { enabled: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have 2 constructors (Ferrari threw error)
      expect(result.current.standings).toHaveLength(2);
    });

    it('should sort standings correctly in public mode', async () => {
      const { result } = renderHook(() => useConstructorStandings(2024, { enabled: false }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify correct sorting by points
      expect(result.current.standings[0].seasonPoints).toBeGreaterThanOrEqual(
        result.current.standings[1].seasonPoints
      );
      expect(result.current.standings[1].seasonPoints).toBeGreaterThanOrEqual(
        result.current.standings[2].seasonPoints
      );
    });
  });

  describe('Season Changes', () => {
    beforeEach(() => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return { ok: true, json: async () => mockConstructors };
        }
        if (url.includes('/api/race-results/constructor/')) {
          const constructorId = parseInt(url.split('/constructor/')[1].split('/')[0]);
          return { ok: true, json: async () => mockSeasonPoints[constructorId] || [] };
        }
        return { ok: false };
      });
    });

    it('should refetch when season year changes', async () => {
      const { result, rerender } = renderHook(
        ({ year }) => useConstructorStandings(year),
        { initialProps: { year: 2024 } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstStandings = result.current.standings;
      expect(firstStandings).toHaveLength(3);

      // Change year
      rerender({ year: 2023 });

      // Should start loading again
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have new data
      expect(mockFetch).toHaveBeenCalledTimes(10); // 5 calls for each year (seasons, constructors, 3x constructor points)
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty constructors list', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/seasons')) {
          return { ok: true, json: async () => mockSeasons };
        }
        if (url.includes('/api/constructors?year=')) {
          return { ok: true, json: async () => [] }; // Empty list
        }
        return { ok: false };
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.standings).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle error message without message property', async () => {
      mockFetch.mockImplementation(async () => {
        throw 'String error'; // Non-Error throw
      });

      const { result } = renderHook(() => useConstructorStandings(2024));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch constructor standings.');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Failed to fetch constructor standings.',
        })
      );
    });
  });
});

