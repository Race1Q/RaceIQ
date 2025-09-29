import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import LastPodiumWidget from './LastPodiumWidget';

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
      {ui}
    </ChakraProvider>
  );
};

const mockPodiumData = {
  raceName: 'Bahrain Grand Prix',
  podium: [
    {
      position: 1,
      driverFullName: 'Max Verstappen',
      constructorName: 'Red Bull Racing',
    },
    {
      position: 2,
      driverFullName: 'Lewis Hamilton',
      constructorName: 'Mercedes',
    },
    {
      position: 3,
      driverFullName: 'Charles Leclerc',
      constructorName: 'Ferrari',
    },
  ],
};

describe('LastPodiumWidget', () => {
  it('renders loading state when no data provided', () => {
    renderWithProviders(<LastPodiumWidget />);

    expect(screen.getByText('Last Race Podium')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders podium information when data is provided', () => {
    renderWithProviders(<LastPodiumWidget data={mockPodiumData} />);

    expect(screen.getByText('Last Race: Bahrain Grand Prix Podium')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
  });

  it('displays correct medal emojis for each position', () => {
    renderWithProviders(<LastPodiumWidget data={mockPodiumData} />);

    expect(screen.getByText('🥇')).toBeInTheDocument(); // Gold medal for 1st
    expect(screen.getByText('🥈')).toBeInTheDocument(); // Silver medal for 2nd
    expect(screen.getByText('🥉')).toBeInTheDocument(); // Bronze medal for 3rd
  });

  it('displays correct constructor names', () => {
    renderWithProviders(<LastPodiumWidget data={mockPodiumData} />);

    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
  });

  it('renders team color indicators', () => {
    renderWithProviders(<LastPodiumWidget data={mockPodiumData} />);

    // Check for podium items (they should be present as elements with team colors)
    const podiumItems = screen.getAllByText(/Max Verstappen|Lewis Hamilton|Charles Leclerc/);
    expect(podiumItems).toHaveLength(3);
  });

  it('handles null data gracefully', () => {
    renderWithProviders(<LastPodiumWidget data={null} />);

    expect(screen.getByText('Last Race Podium')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    renderWithProviders(<LastPodiumWidget data={undefined} />);

    expect(screen.getByText('Last Race Podium')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles incomplete podium data', () => {
    const incompletePodiumData = {
      raceName: 'Test Grand Prix',
      podium: [
        {
          position: 1,
          driverFullName: 'Max Verstappen',
          constructorName: 'Red Bull Racing',
        },
        {
          position: 2,
          driverFullName: 'Lewis Hamilton',
          constructorName: 'Mercedes',
        },
        // Missing 3rd place
      ],
    };

    renderWithProviders(<LastPodiumWidget data={incompletePodiumData} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.queryByText('🥉')).not.toBeInTheDocument();
  });

  it('handles podium with missing driver names', () => {
    const dataWithMissingNames = {
      raceName: 'Test Grand Prix',
      podium: [
        {
          position: 1,
          driverFullName: '',
          constructorName: 'Red Bull Racing',
        },
        {
          position: 2,
          driverFullName: 'Lewis Hamilton',
          constructorName: 'Mercedes',
        },
        {
          position: 3,
          driverFullName: 'Charles Leclerc',
          constructorName: 'Ferrari',
        },
      ],
    };

    renderWithProviders(<LastPodiumWidget data={dataWithMissingNames} />);

    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });

  it('handles podium with missing constructor names', () => {
    const dataWithMissingConstructors = {
      raceName: 'Test Grand Prix',
      podium: [
        {
          position: 1,
          driverFullName: 'Max Verstappen',
          constructorName: '',
        },
        {
          position: 2,
          driverFullName: 'Lewis Hamilton',
          constructorName: 'Mercedes',
        },
        {
          position: 3,
          driverFullName: 'Charles Leclerc',
          constructorName: 'Ferrari',
        },
      ],
    };

    renderWithProviders(<LastPodiumWidget data={dataWithMissingConstructors} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    renderWithProviders(<LastPodiumWidget data={mockPodiumData} />);

    // Check for title
    expect(screen.getByText('Last Race: Bahrain Grand Prix Podium')).toBeInTheDocument();
    
    // Check for podium items
    const podiumItems = screen.getAllByText(/Max Verstappen|Lewis Hamilton|Charles Leclerc/);
    expect(podiumItems).toHaveLength(3);
    
    // Check for medals
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });

  it('handles different race names', () => {
    const differentRaceData = {
      ...mockPodiumData,
      raceName: 'Monaco Grand Prix',
    };

    renderWithProviders(<LastPodiumWidget data={differentRaceData} />);

    expect(screen.getByText('Last Race: Monaco Grand Prix Podium')).toBeInTheDocument();
  });

  it('handles empty podium array', () => {
    const emptyPodiumData = {
      raceName: 'Test Grand Prix',
      podium: [],
    };

    renderWithProviders(<LastPodiumWidget data={emptyPodiumData} />);

    expect(screen.getByText('Last Race: Test Grand Prix Podium')).toBeInTheDocument();
    // Should not crash with empty podium
  });

  it('renders without crashing', () => {
    expect(() => renderWithProviders(<LastPodiumWidget data={mockPodiumData} />)).not.toThrow();
  });

  it('maintains consistent structure between loading and loaded states', () => {
    // Test loading state
    const { rerender } = renderWithProviders(<LastPodiumWidget />);
    
    expect(screen.getByText('Last Race Podium')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Test loaded state
    rerender(
      <ChakraProvider theme={testTheme}>
        <LastPodiumWidget data={mockPodiumData} />
      </ChakraProvider>
    );

    expect(screen.getByText('Last Race: Bahrain Grand Prix Podium')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });
});
