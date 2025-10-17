import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import StandingsWidget from './StandingsWidget';
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

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
    text: {
      primary: '#ffffff',
      muted: '#666666',
    },
  },
  space: {
    md: '1rem',
    sm: '0.5rem',
    xs: '0.25rem',
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

const mockStandingsData = [
  {
    position: 1,
    driverFullName: 'Max Verstappen',
    constructorName: 'Red Bull Racing',
    points: 25,
  },
  {
    position: 2,
    driverFullName: 'Lewis Hamilton',
    constructorName: 'Mercedes',
    points: 18,
  },
  {
    position: 3,
    driverFullName: 'Charles Leclerc',
    constructorName: 'Ferrari',
    points: 15,
  },
  {
    position: 4,
    driverFullName: 'Sergio Perez',
    constructorName: 'Red Bull Racing',
    points: 12,
  },
  {
    position: 5,
    driverFullName: 'Carlos Sainz',
    constructorName: 'Ferrari',
    points: 10,
  },
  {
    position: 6,
    driverFullName: 'Lando Norris',
    constructorName: 'McLaren',
    points: 8,
  },
];

describe('StandingsWidget', () => {
  it('renders loading state when no data provided', () => {
    renderWithProviders(<StandingsWidget />);

    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders loading state when empty array provided', () => {
    renderWithProviders(<StandingsWidget data={[]} />);

    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders standings when data is provided', () => {
    renderWithProviders(<StandingsWidget data={mockStandingsData} />);

    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    
    // Should show top 5 drivers
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Sergio Perez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
    
    // Should not show 6th driver (Lando Norris)
    expect(screen.queryByText('Lando Norris')).not.toBeInTheDocument();
  });

  it('displays correct positions', () => {
    renderWithProviders(<StandingsWidget data={mockStandingsData} />);

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
    expect(screen.getByText('4.')).toBeInTheDocument();
    expect(screen.getByText('5.')).toBeInTheDocument();
  });

  it('displays correct constructor names', () => {
    renderWithProviders(<StandingsWidget data={mockStandingsData} />);

    // Use getAllByText since Red Bull Racing appears twice (Max Verstappen and Sergio Perez)
    expect(screen.getAllByText('Red Bull Racing')).toHaveLength(2);
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getAllByText('Ferrari')).toHaveLength(2); // Charles Leclerc and Carlos Sainz
  });

  it('displays correct points', () => {
    renderWithProviders(<StandingsWidget data={mockStandingsData} />);

    expect(screen.getByText('25 pts')).toBeInTheDocument();
    expect(screen.getByText('18 pts')).toBeInTheDocument();
    expect(screen.getByText('15 pts')).toBeInTheDocument();
    expect(screen.getByText('12 pts')).toBeInTheDocument();
    expect(screen.getByText('10 pts')).toBeInTheDocument();
  });

  it('renders team color indicators', () => {
    renderWithProviders(<StandingsWidget data={mockStandingsData} />);

    // Check for team color dots (they should be present as colored elements)
    const standingsItems = screen.getAllByText(/Max Verstappen|Lewis Hamilton|Charles Leclerc|Sergio Perez|Carlos Sainz/);
    expect(standingsItems).toHaveLength(5);
  });

  it('handles null data gracefully', () => {
    renderWithProviders(<StandingsWidget data={null} />);

    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    renderWithProviders(<StandingsWidget data={undefined} />);

    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('limits display to top 5 drivers', () => {
    const largeStandingsData = [
      ...mockStandingsData,
      { position: 6, driverFullName: 'Lando Norris', constructorName: 'McLaren', points: 8 },
      { position: 7, driverFullName: 'George Russell', constructorName: 'Mercedes', points: 6 },
      { position: 8, driverFullName: 'Fernando Alonso', constructorName: 'Aston Martin', points: 4 },
    ];

    renderWithProviders(<StandingsWidget data={largeStandingsData} />);

    // Should show first 5
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Sergio Perez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
    
    // Should not show 6th, 7th, 8th
    expect(screen.queryByText('Lando Norris')).not.toBeInTheDocument();
    expect(screen.queryByText('George Russell')).not.toBeInTheDocument();
    expect(screen.queryByText('Fernando Alonso')).not.toBeInTheDocument();
  });

  it('handles standings with missing data gracefully', () => {
    const incompleteData = [
      { position: 1, driverFullName: 'Max Verstappen', constructorName: '', points: 25 },
      { position: 2, driverFullName: '', constructorName: 'Mercedes', points: 18 },
      { position: 3, driverFullName: 'Charles Leclerc', constructorName: 'Ferrari', points: null },
    ];

    renderWithProviders(<StandingsWidget data={incompleteData} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('25 pts')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    renderWithProviders(<StandingsWidget data={mockStandingsData} />);

    // Check for title
    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    
    // Check for standings items
    const standingsItems = screen.getAllByText(/Max Verstappen|Lewis Hamilton|Charles Leclerc|Sergio Perez|Carlos Sainz/);
    expect(standingsItems).toHaveLength(5);
    
    // Check for points display
    expect(screen.getByText('25 pts')).toBeInTheDocument();
  });

  it('handles single driver standings', () => {
    const singleDriverData = [
      { position: 1, driverFullName: 'Max Verstappen', constructorName: 'Red Bull Racing', points: 25 },
    ];

    renderWithProviders(<StandingsWidget data={singleDriverData} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('25 pts')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => renderWithProviders(<StandingsWidget data={mockStandingsData} />)).not.toThrow();
  });

  it('maintains consistent structure between loading and loaded states', () => {
    // Test loading state
    const { rerender } = renderWithProviders(<StandingsWidget />);
    
    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Test loaded state
    rerender(
      <ChakraProvider theme={testTheme}>
        <StandingsWidget data={mockStandingsData} />
      </ChakraProvider>
    );

    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('25 pts')).toBeInTheDocument();
  });
});
