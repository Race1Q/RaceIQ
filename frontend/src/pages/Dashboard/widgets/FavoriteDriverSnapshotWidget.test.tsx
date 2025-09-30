import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FavoriteDriverSnapshotWidget from './FavoriteDriverSnapshotWidget';

// Mock Auth0
const mockGetAccessTokenSilently = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

// Mock buildApiUrl
vi.mock('../../../lib/api', () => ({
  buildApiUrl: (path: string) => path,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
  getTeamColor: (teamName: string) => {
    const colors: Record<string, string> = {
      'Red Bull Racing': '1E40AF',
      'Mercedes': '00D2BE',
    };
    return colors[teamName] || '666666';
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
        {ui}
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
    
    // Default Auth0 mock
    mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
    
    // Default fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          fullname: 'Max Verstappen',
          points: 400,
          position: 1,
        },
      ],
    });
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
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
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

  it('renders Select Driver link when favorite driver is shown', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    const selectDriverLink = screen.getByText('Select Driver');
    expect(selectDriverLink).toBeInTheDocument();
    expect(selectDriverLink.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('shows loading state when loading', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteDriverSnapshotWidget />);

    // In loading state, only the widget's loading message is shown
    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
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

  it('renders Select Driver button as link when no favorite driver', () => {
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
    // In test environment, local images don't exist so fallback is used
    expect(driverImage).toHaveAttribute('src', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face');
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

    // Check for title and Select Driver link
    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getByText('Select Driver')).toBeInTheDocument();
    
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
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);

    // Test loaded state
    mockUseUserProfile.mockReturnValue({
      favoriteDriver: mockFavoriteDriver,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender(
      <BrowserRouter>
        <ChakraProvider theme={testTheme}>
          <FavoriteDriverSnapshotWidget />
        </ChakraProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
  });
});
