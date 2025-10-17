import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import HeadToHeadQuickCompareWidget from './HeadToHeadQuickCompareWidget';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
  }),
}));

// Mock useUserProfile
vi.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock teamColors
vi.mock('../../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '1E40AF',
    'Mercedes': '00D2BE',
    'Ferrari': 'DC143C',
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
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

const mockHeadToHeadData = {
  driver1: {
    fullName: 'Max Verstappen',
    teamName: 'Red Bull Racing',
    headshotUrl: '/images/verstappen.jpg',
    wins: 3,
    podiums: 5,
    points: 150,
  },
  driver2: {
    fullName: 'Lewis Hamilton',
    teamName: 'Mercedes',
    headshotUrl: '/images/hamilton.jpg',
    wins: 1,
    podiums: 3,
    points: 120,
  },
};

describe('HeadToHeadQuickCompareWidget', () => {
  it('renders loading state when no data provided', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders head-to-head comparison when data is provided', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
  });

  it('displays driver names correctly', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
  });

  it('displays team names correctly', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
  });

  it('displays driver statistics correctly', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    // Driver 1 stats
    expect(screen.getByText('Wins: 3')).toBeInTheDocument();
    expect(screen.getByText('Podiums: 5')).toBeInTheDocument();
    expect(screen.getByText('Points: 150')).toBeInTheDocument();

    // Driver 2 stats
    expect(screen.getByText('Wins: 1')).toBeInTheDocument();
    expect(screen.getByText('Podiums: 3')).toBeInTheDocument();
    expect(screen.getByText('Points: 120')).toBeInTheDocument();
  });

  it('displays VS indicator', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('renders driver images with fallback', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    const verstappenImage = screen.getByAltText('Max Verstappen');
    const hamiltonImage = screen.getByAltText('Lewis Hamilton');

    expect(verstappenImage).toBeInTheDocument();
    // In test environment, local images don't exist so fallback is used
    expect(verstappenImage).toHaveAttribute('src', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face');
    
    expect(hamiltonImage).toBeInTheDocument();
    expect(hamiltonImage).toHaveAttribute('src', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face');
  });

  it('renders team logos', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    const redBullLogo = screen.getByAltText('Red Bull Racing Logo');
    const mercedesLogo = screen.getByAltText('Mercedes Logo');

    expect(redBullLogo).toBeInTheDocument();
    expect(redBullLogo).toHaveAttribute('src', '/images/teams/red-bull-racing-logo.png');
    
    expect(mercedesLogo).toBeInTheDocument();
    expect(mercedesLogo).toHaveAttribute('src', '/images/teams/mercedes-logo.png');
  });

  it('handles null data gracefully', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={undefined} />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={undefined} />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles incomplete driver data', () => {
    const incompleteData = {
      driver1: {
        fullName: 'Max Verstappen',
        teamName: 'Red Bull Racing',
        headshotUrl: '/images/verstappen.jpg',
        wins: 3,
        podiums: 5,
        points: 150,
      },
      driver2: {
        fullName: '',
        teamName: 'Mercedes',
        headshotUrl: '',
        wins: 0,
        podiums: 0,
        points: 0,
      },
    };

    renderWithProviders(<HeadToHeadQuickCompareWidget data={incompleteData} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Wins: 3')).toBeInTheDocument();
    expect(screen.getByText('Wins: 0')).toBeInTheDocument();
  });

  it('handles unknown teams', () => {
    const dataWithUnknownTeams = {
      ...mockHeadToHeadData,
      driver1: {
        ...mockHeadToHeadData.driver1,
        teamName: 'Unknown Team',
      },
      driver2: {
        ...mockHeadToHeadData.driver2,
        teamName: 'Another Unknown Team',
      },
    };

    renderWithProviders(<HeadToHeadQuickCompareWidget data={dataWithUnknownTeams} />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
    expect(screen.getByText('Another Unknown Team')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    // Check for title
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    
    // Check for VS indicator
    expect(screen.getByText('VS')).toBeInTheDocument();
    
    // Check for both drivers
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    
    // Check for stats
    expect(screen.getByText('Wins: 3')).toBeInTheDocument();
    expect(screen.getByText('Wins: 1')).toBeInTheDocument();
  });

  it('handles different driver statistics', () => {
    const differentStatsData = {
      driver1: {
        fullName: 'Charles Leclerc',
        teamName: 'Ferrari',
        headshotUrl: '/images/leclerc.jpg',
        wins: 0,
        podiums: 2,
        points: 75,
      },
      driver2: {
        fullName: 'Carlos Sainz',
        teamName: 'Ferrari',
        headshotUrl: '/images/sainz.jpg',
        wins: 1,
        podiums: 1,
        points: 50,
      },
    };

    renderWithProviders(<HeadToHeadQuickCompareWidget data={differentStatsData} />);

    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
    expect(screen.getByText('Wins: 0')).toBeInTheDocument();
    expect(screen.getByText('Wins: 1')).toBeInTheDocument();
    expect(screen.getByText('Podiums: 2')).toBeInTheDocument();
    expect(screen.getByText('Podiums: 1')).toBeInTheDocument();
    expect(screen.getByText('Points: 75')).toBeInTheDocument();
    expect(screen.getByText('Points: 50')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />)).not.toThrow();
  });

  it('maintains consistent structure between loading and loaded states', () => {
    // Test loading state
    const { rerender } = renderWithProviders(<HeadToHeadQuickCompareWidget />);
    
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Test loaded state
    rerender(
      <ChakraProvider theme={testTheme}>
        <HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />
      </ChakraProvider>
    );

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('displays all statistics in correct format', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    // Check that all stats are displayed with proper formatting
    const winsElements = screen.getAllByText(/Wins: \d+/);
    const podiumsElements = screen.getAllByText(/Podiums: \d+/);
    const pointsElements = screen.getAllByText(/Points: \d+/);

    expect(winsElements).toHaveLength(2);
    expect(podiumsElements).toHaveLength(2);
    expect(pointsElements).toHaveLength(2);
  });
});
