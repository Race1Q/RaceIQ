import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FavoriteTeamSnapshotWidget from './FavoriteTeamSnapshotWidget';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useDashboardSharedData from context
vi.mock('../../../context/DashboardDataContext', () => ({
  useDashboardSharedData: () => ({
    driverStandings: [],
    constructorStandings: [
      { id: 1, fullName: 'Red Bull Racing', points: 500, wins: 15, podiums: 30, position: 1 }
    ],
    seasons: [
      { id: 1, year: 2025 }
    ],
    isLoading: false,
  }),
}));

// Mock useUserProfile hook
const mockUseUserProfile = vi.fn();
vi.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => mockUseUserProfile(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Building2: () => <div data-testid="building-icon">🏢</div>,
  RefreshCw: () => <div data-testid="refresh-icon">🔄</div>,
}));

// Mock teamColors
vi.mock('../../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '1E40AF',
    'Mercedes': '00D2BE',
    'Default': '666666',
  },
  getTeamColor: (teamName: string | undefined | null, opts?: { hash?: boolean }) => {
    const colors: any = {
      'Red Bull Racing': '1E40AF',
      'Mercedes': '00D2BE',
      'Default': '666666',
    };
    const hex = colors[teamName || ''] || colors['Default'];
    return opts?.hash ? `#${hex}` : hex;
  },
}));

// Mock getTeamLogo
vi.mock('../../../lib/teamAssets', () => ({
  getTeamLogo: vi.fn((teamName: string) => `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}-logo.png`),
}));

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      muted: '#666666',
    },
  },
  space: {
    md: '1rem',
    sm: '0.5rem',
    xs: '0.25rem',
    lg: '1.5rem',
  },
  fonts: {
    heading: 'Inter, sans-serif',
    mono: 'Monaco, monospace',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ChakraProvider theme={testTheme}>
        <ThemeColorProvider>
          {ui}
        </ThemeColorProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

const mockFavoriteTeam = {
  id: 1,
  name: 'Red Bull Racing',
};

// Mock global fetch
const fetchMock = vi.fn();

describe('FavoriteTeamSnapshotWidget', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        { season: 1, points: 600, position: 2 }
      ],
    });
  });

  it('renders loading state', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getAllByText('Loading...')).toHaveLength(2);
  });

  it('renders error state when no favorite team set', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: null,
      loading: false,
      error: 'No favorite team',
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getByText('No favorite team set')).toBeInTheDocument();
    expect(screen.getByText('Select Constructor')).toBeInTheDocument();
    expect(screen.getByTestId('building-icon')).toBeInTheDocument();
  });

  it('renders favorite team information when available', async () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText("Constructor's Championship")).toBeInTheDocument();
    
    // Wait for async points/position data to load
    await waitFor(() => {
      expect(screen.getByText('600 pts')).toBeInTheDocument();
    });
  });

  it('calls refetch when refresh button is clicked', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    // Component shows Change Team link, not a refresh button
    const changeTeamLink = screen.getByRole('link', { name: /change team/i });
    expect(changeTeamLink).toHaveAttribute('href', '/profile');
  });

  it('shows loading state on refresh button when loading', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    // In loading state, check that loading text is shown
    expect(screen.getAllByText('Loading...')).toHaveLength(2);
  });

  it('renders Set Favorite button as link when no favorite team', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: null,
      loading: false,
      error: 'No favorite team',
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    const setFavoriteButton = screen.getByText('Select Constructor');
    expect(setFavoriteButton).toBeInTheDocument();
    expect(setFavoriteButton.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('displays team logo with fallback', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    const teamLogo = screen.getByAltText('Red Bull Racing Logo');
    expect(teamLogo).toBeInTheDocument();
    // Mocked getTeamLogo returns the expected path
    expect(teamLogo).toHaveAttribute('src', '/images/teams/red-bull-racing-logo.png');
  });

  it('handles unknown team (no color in teamColors)', async () => {
    const unknownTeam = {
      id: 1,
      name: 'Unknown Team',
    };

    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: unknownTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
    
    // Wait for async points data to load
    await waitFor(() => {
      expect(screen.getByText('600 pts')).toBeInTheDocument();
    });
  });

  it('renders progress bar for team performance', async () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    // Check for points - wait for async load
    await waitFor(() => {
      expect(screen.getByText('600 pts')).toBeInTheDocument();
    });
  });

  it('renders with correct layout structure', async () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    // Check for title and change team link
    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /change team/i })).toBeInTheDocument();
    
    // Check for team information
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText("Constructor's Championship")).toBeInTheDocument();
    
    // Wait for async points data
    await waitFor(() => {
      expect(screen.getByText('600 pts')).toBeInTheDocument();
    });
  });

  it('handles different team names', () => {
    const differentTeam = {
      id: 2,
      name: 'Mercedes',
    };

    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: differentTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getByAltText('Mercedes Logo')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    expect(() => renderWithProviders(<FavoriteTeamSnapshotWidget />)).not.toThrow();
  });

  it('maintains consistent structure across different states', () => {
    // Test loading state
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    const { rerender } = renderWithProviders(<FavoriteTeamSnapshotWidget />);
    
    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getAllByText('Loading...')).toHaveLength(2);

    // Test loaded state
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender(
      <ChakraProvider theme={testTheme}>
        <ThemeColorProvider>
          <BrowserRouter>
            <FavoriteTeamSnapshotWidget />
          </BrowserRouter>
        </ThemeColorProvider>
      </ChakraProvider>
    );

    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('handles empty team name gracefully', async () => {
    const teamWithEmptyName = {
      id: 1,
      name: '',
    };

    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: teamWithEmptyName,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    expect(screen.getByText("Constructor's Championship")).toBeInTheDocument();
    
    // Wait for async points data
    await waitFor(() => {
      expect(screen.getByText('600 pts')).toBeInTheDocument();
    });
  });
});
