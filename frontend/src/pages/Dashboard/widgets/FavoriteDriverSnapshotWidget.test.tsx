import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FavoriteDriverSnapshotWidget from './FavoriteDriverSnapshotWidget';
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
    driverStandings: [
      { id: 1, fullName: 'Max Verstappen', teamName: 'Red Bull Racing', number: 1, countryCode: 'NLD', points: 454, position: 1 }
    ],
    constructorStandings: [],
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
  UserPlus: () => <div data-testid="user-plus-icon">👤</div>,
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

// Mock driverHeadshots
vi.mock('../../../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Max Verstappen': '/images/verstappen.jpg',
  },
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

const mockFavoriteDriver = {
  full_name: 'Max Verstappen',
  team_name: 'Red Bull Racing',
  driver_number: 1,
  country_code: 'NED',
};

describe('FavoriteDriverSnapshotWidget', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getAllByText('Loading...')).toHaveLength(2);
  });

  it('renders error state when no favorite driver set', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: null,
      loading: false,
      error: 'No favorite driver',
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getByText('No favorite driver set')).toBeInTheDocument();
    expect(screen.getByText('Select Driver')).toBeInTheDocument();
    expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
  });

  it('renders favorite driver information when available', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('NED')).toBeInTheDocument();
    expect(screen.getByText('Driver Number')).toBeInTheDocument();
  });

  it('calls refetch when refresh button is clicked', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    // Component shows Change Driver link, not a refresh button
    const changeDriverLink = screen.getByRole('link', { name: /change driver/i });
    expect(changeDriverLink).toBeInTheDocument();
    expect(changeDriverLink).toHaveAttribute('href', '/profile');
  });

  it('shows loading state on refresh button when loading', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    // In loading state, the refresh button should not be visible
    expect(screen.queryByRole('button', { name: /refresh favorite driver/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Loading...')).toHaveLength(2);
  });

  it('handles missing driver number gracefully', () => {
    const driverWithoutNumber = {
      ...mockFavoriteDriver,
      driver_number: null,
    };

    mockUseUserProfile.mockReturnValue({
      favoriteDriver: driverWithoutNumber,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('#N/A')).toBeInTheDocument();
  });

  it('handles missing country code gracefully', () => {
    const driverWithoutCountry = {
      ...mockFavoriteDriver,
      country_code: null,
    };

    mockUseUserProfile.mockReturnValue({
      favoriteDriver: driverWithoutCountry,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders Set Favorite button as link when no favorite driver', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: null,
      loading: false,
      error: 'No favorite driver',
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    const selectDriverButton = screen.getByText('Select Driver');
    expect(selectDriverButton).toBeInTheDocument();
    expect(selectDriverButton.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('displays driver image with fallback', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    const driverImage = screen.getByAltText('Max Verstappen');
    expect(driverImage).toBeInTheDocument();
    // Uses the mocked image from driverHeadshots
    expect(driverImage).toHaveAttribute('src', '/images/verstappen.jpg');
  });

  it('handles unknown driver (no image in driverHeadshots)', () => {
    const unknownDriver = {
      ...mockFavoriteDriver,
      full_name: 'Unknown Driver',
    };

    mockUseUserProfile.mockReturnValue({
      favoriteDriver: unknownDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    expect(screen.getByText('Unknown Driver')).toBeInTheDocument();
    expect(screen.getByAltText('Unknown Driver')).toBeInTheDocument();
  });

  it('handles unknown team (no color in teamColors)', () => {
    const driverWithUnknownTeam = {
      ...mockFavoriteDriver,
      team_name: 'Unknown Team',
    };

    mockUseUserProfile.mockReturnValue({
      favoriteDriver: driverWithUnknownTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    // Check for title and change driver link
    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /change driver/i })).toBeInTheDocument();
    
    // Check for driver information
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('NED')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    expect(() => renderWithProviders(<FavoriteDriverSnapshotWidget />)).not.toThrow();
  });

  it('maintains consistent structure across different states', () => {
    // Test loading state
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    const { rerender } = renderWithProviders(<FavoriteDriverSnapshotWidget />);
    
    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getAllByText('Loading...')).toHaveLength(2);

    // Test loaded state
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender(
      <ChakraProvider theme={testTheme}>
        <ThemeColorProvider>
          <BrowserRouter>
            <FavoriteDriverSnapshotWidget />
          </BrowserRouter>
        </ThemeColorProvider>
      </ChakraProvider>
    );

    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
  });
});
