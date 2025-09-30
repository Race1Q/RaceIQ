import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FavoriteTeamSnapshotWidget from './FavoriteTeamSnapshotWidget';

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
        {ui}
      </ChakraProvider>
    </BrowserRouter>
  );
};

const mockFavoriteTeam = {
  name: 'Red Bull Racing',
};

describe('FavoriteTeamSnapshotWidget', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders favorite team information when available', () => {
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
    expect(screen.getByText('600 pts')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
  });

  it('renders Select Constructor link when favorite team is shown', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    const selectConstructorLink = screen.getByText('Select Constructor');
    expect(selectConstructorLink).toBeInTheDocument();
    expect(selectConstructorLink.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('shows loading state when loading', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    // In loading state, only the widget's loading message is shown
    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Select Constructor button as link when no favorite team', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: null,
      loading: false,
      error: 'No favorite team',
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    const selectConstructorButton = screen.getByText('Select Constructor');
    expect(selectConstructorButton).toBeInTheDocument();
    expect(selectConstructorButton.closest('a')).toHaveAttribute('href', '/profile');
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
    // In test environment, local images don't exist so fallback is used
    expect(teamLogo).toHaveAttribute('src', '/assets/placeholder.svg');
  });

  it('handles unknown team (no color in teamColors)', () => {
    const unknownTeam = {
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
    expect(screen.getByText('600 pts')).toBeInTheDocument();
  });

  it('renders progress bar for team performance', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    // Check for points and position
    expect(screen.getByText('600 pts')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<FavoriteTeamSnapshotWidget />);

    // Check for title and team information
    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('handles different team names', () => {
    const differentTeam = {
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
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);

    // Test loaded state
    mockUseUserProfile.mockReturnValue({
      favoriteConstructor: mockFavoriteTeam,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender(
      <BrowserRouter>
        <ChakraProvider theme={testTheme}>
          <FavoriteTeamSnapshotWidget />
        </ChakraProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('handles empty team name gracefully', () => {
    const teamWithEmptyName = {
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
    expect(screen.getByText('600 pts')).toBeInTheDocument();
  });
});
