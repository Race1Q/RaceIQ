import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TrackStatsBars from './TrackStatsBars';
import type { Race } from '../../data/types';

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Flag: ({ size, className, style }: any) => (
    <svg data-testid="flag-icon" width={size} height={size} className={className} style={style}>
      <title>Flag Icon</title>
    </svg>
  ),
  MapPin: ({ size, className, style }: any) => (
    <svg data-testid="map-pin-icon" width={size} height={size} className={className} style={style}>
      <title>MapPin Icon</title>
    </svg>
  ),
  Route: ({ size, className, style }: any) => (
    <svg data-testid="route-icon" width={size} height={size} className={className} style={style}>
      <title>Route Icon</title>
    </svg>
  ),
}));

// Mock the mockRaces data
vi.mock('../../data/mockRaces', () => ({
  mockRaces: [
    {
      id: 'race-1',
      totalLaps: 50,
      circuitLength: 5.0,
      raceDistance: 250.0,
    },
    {
      id: 'race-2',
      totalLaps: 60,
      circuitLength: 4.5,
      raceDistance: 270.0,
    },
    {
      id: 'race-3',
      totalLaps: 70,
      circuitLength: 6.0,
      raceDistance: 420.0,
    },
  ],
}));

// Helper function to render with Chakra UI
const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('TrackStatsBars', () => {
  const mockRace: Race = {
    id: 'race-1',
    trackName: 'Monaco',
    country: 'Monaco',
    countryCode: 'MC',
    date: '2024-05-26',
    trackMapCoords: '0,0 10,10 20,20 30,30 40,40 50,50 60,60 70,70 80,80 90,90 100,100',
    standings: [],
    keyInfo: {
      weather: 'Sunny',
      fastestLap: { driver: 'Verstappen', time: '1:12.345' },
      totalOvertakes: 15,
    },
    flagsTimeline: [],
    paceDistribution: [1, 2, 3, 4, 5],
    tireStrategies: [],
    historicalStats: {
      lapRecord: { driver: 'Hamilton', time: '1:10.166' },
      previousWinner: 'Verstappen',
    },
    driverOfTheDay: 'Verstappen',
    circuitLength: 3.337,
    raceDistance: 260.286,
    totalLaps: 78,
    weather: {
      airTemp: 25,
      trackTemp: 35,
      windSpeed: 5,
      condition: 'Sunny',
    },
    lapPositions: [],
    raceControlMessages: [],
  };

  it('renders without crashing', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    expect(screen.getByText('Laps')).toBeInTheDocument();
    expect(screen.getByText('Circuit Length')).toBeInTheDocument();
    expect(screen.getByText('Race Distance')).toBeInTheDocument();
  });

  it('renders all three stat items', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    expect(screen.getByText('Laps')).toBeInTheDocument();
    expect(screen.getByText('Circuit Length')).toBeInTheDocument();
    expect(screen.getByText('Race Distance')).toBeInTheDocument();
  });

  it('renders stat values correctly', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    expect(screen.getByText('78')).toBeInTheDocument(); // totalLaps
    expect(screen.getByText('3.337 km')).toBeInTheDocument(); // circuitLength
    expect(screen.getByText('260.286 km')).toBeInTheDocument(); // raceDistance
  });

  it('renders all three icons', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    expect(screen.getByTestId('flag-icon')).toBeInTheDocument();
    expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    expect(screen.getByTestId('route-icon')).toBeInTheDocument();
  });

  it('renders icons with correct size', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    const flagIcon = screen.getByTestId('flag-icon');
    const mapPinIcon = screen.getByTestId('map-pin-icon');
    const routeIcon = screen.getByTestId('route-icon');
    
    expect(flagIcon).toHaveAttribute('width', '16');
    expect(flagIcon).toHaveAttribute('height', '16');
    expect(mapPinIcon).toHaveAttribute('width', '16');
    expect(mapPinIcon).toHaveAttribute('height', '16');
    expect(routeIcon).toHaveAttribute('width', '16');
    expect(routeIcon).toHaveAttribute('height', '16');
  });

  it('applies correct CSS classes', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    const container = document.querySelector('[class*="container"]');
    expect(container).toBeInTheDocument();
    expect(container?.className).toContain('container');
    
    const statsContainer = document.querySelector('[class*="statsContainer"]');
    expect(statsContainer).toBeInTheDocument();
    expect(statsContainer?.className).toContain('statsContainer');
  });

  it('renders with team color', () => {
    const teamColor = '#FF0000';
    renderWithChakra(<TrackStatsBars race={mockRace} teamColor={teamColor} />);
    
    const flagIcon = screen.getByTestId('flag-icon');
    const mapPinIcon = screen.getByTestId('map-pin-icon');
    const routeIcon = screen.getByTestId('route-icon');
    
    expect(flagIcon).toHaveStyle(`color: ${teamColor}`);
    expect(mapPinIcon).toHaveStyle(`color: ${teamColor}`);
    expect(routeIcon).toHaveStyle(`color: ${teamColor}`);
  });

  it('renders with default color when no team color provided', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    const flagIcon = screen.getByTestId('flag-icon');
    const mapPinIcon = screen.getByTestId('map-pin-icon');
    const routeIcon = screen.getByTestId('route-icon');
    
    expect(flagIcon).toHaveStyle('color: var(--color-primary-red)');
    expect(mapPinIcon).toHaveStyle('color: var(--color-primary-red)');
    expect(routeIcon).toHaveStyle('color: var(--color-primary-red)');
  });

  it('renders with different team colors', () => {
    const teamColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
    
    teamColors.forEach((color) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={mockRace} teamColor={color} />);
      
      const flagIcon = screen.getByTestId('flag-icon');
      expect(flagIcon).toHaveStyle(`color: ${color}`);
      
      unmount();
    });
  });

  it('renders with different race data', () => {
    const races = [
      { ...mockRace, totalLaps: 50, circuitLength: 4.0, raceDistance: 200.0 },
      { ...mockRace, totalLaps: 60, circuitLength: 5.0, raceDistance: 300.0 },
      { ...mockRace, totalLaps: 70, circuitLength: 6.0, raceDistance: 420.0 },
    ];
    
    races.forEach((race) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={race} />);
      
      expect(screen.getByText(race.totalLaps.toString())).toBeInTheDocument();
      expect(screen.getByText(`${race.circuitLength} km`)).toBeInTheDocument();
      expect(screen.getByText(`${race.raceDistance} km`)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles zero values', () => {
    const zeroRace = { ...mockRace, totalLaps: 0, circuitLength: 0, raceDistance: 0 };
    renderWithChakra(<TrackStatsBars race={zeroRace} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    // Use getAllByText since there are multiple "0 km" elements
    const kmElements = screen.getAllByText('0 km');
    expect(kmElements).toHaveLength(2);
  });

  it('handles negative values', () => {
    const negativeRace = { ...mockRace, totalLaps: -10, circuitLength: -5.0, raceDistance: -100.0 };
    renderWithChakra(<TrackStatsBars race={negativeRace} />);
    
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('-5 km')).toBeInTheDocument();
    expect(screen.getByText('-100 km')).toBeInTheDocument();
  });

  it('handles very large values', () => {
    const largeRace = { ...mockRace, totalLaps: 1000, circuitLength: 100.0, raceDistance: 100000.0 };
    renderWithChakra(<TrackStatsBars race={largeRace} />);
    
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('100 km')).toBeInTheDocument();
    expect(screen.getByText('100000 km')).toBeInTheDocument();
  });

  it('handles decimal values', () => {
    const decimalRace = { ...mockRace, totalLaps: 78.5, circuitLength: 3.337, raceDistance: 260.286 };
    renderWithChakra(<TrackStatsBars race={decimalRace} />);
    
    expect(screen.getByText('78.5')).toBeInTheDocument();
    expect(screen.getByText('3.337 km')).toBeInTheDocument();
    expect(screen.getByText('260.286 km')).toBeInTheDocument();
  });

  it('handles null race', () => {
    // Null race will cause the component to crash, so we expect this to throw
    expect(() => {
      renderWithChakra(<TrackStatsBars race={null as any} />);
    }).toThrow();
  });

  it('handles undefined race', () => {
    // Undefined race will cause the component to crash, so we expect this to throw
    expect(() => {
      renderWithChakra(<TrackStatsBars race={undefined as any} />);
    }).toThrow();
  });

  it('handles missing race properties', () => {
    const incompleteRace = {
      ...mockRace,
      totalLaps: undefined,
      circuitLength: undefined,
      raceDistance: undefined,
    } as any;
    
    // The component actually handles undefined values gracefully, so it renders
    renderWithChakra(<TrackStatsBars race={incompleteRace} />);
    
    // Check that the component renders (undefined values are handled)
    expect(screen.getByText('Laps')).toBeInTheDocument();
  });

  it('handles null team color', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} teamColor={null as any} />);
    
    const flagIcon = screen.getByTestId('flag-icon');
    expect(flagIcon).toHaveStyle('color: var(--color-primary-red)');
  });

  it('handles undefined team color', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} teamColor={undefined as any} />);
    
    const flagIcon = screen.getByTestId('flag-icon');
    expect(flagIcon).toHaveStyle('color: var(--color-primary-red)');
  });

  it('handles empty team color', () => {
    renderWithChakra(<TrackStatsBars race={mockRace} teamColor="" />);
    
    const flagIcon = screen.getByTestId('flag-icon');
    expect(flagIcon).toHaveStyle('color: var(--color-primary-red)');
  });

  it('handles invalid team color', () => {
    const invalidColors = [123, true, false, {}, [], () => {}];
    
    invalidColors.forEach((color) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={mockRace} teamColor={color as any} />);
      
      const flagIcon = screen.getByTestId('flag-icon');
      expect(flagIcon).toHaveStyle('color: var(--color-primary-red)');
      
      unmount();
    });
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    expect(screen.getByText('Laps')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(<TrackStatsBars race={mockRace} />);
    expect(screen.getByText('Laps')).toBeInTheDocument();
    
    // Re-render with different props
    const newRace = { ...mockRace, totalLaps: 50 };
    rerender(<TrackStatsBars race={newRace} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    expect(screen.getByText('Laps')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Laps')).not.toBeInTheDocument();
    
    // Re-mount
    renderWithChakra(<TrackStatsBars race={mockRace} />);
    expect(screen.getByText('Laps')).toBeInTheDocument();
  });

  it('maintains performance with multiple instances', () => {
    const startTime = performance.now();
    
    renderWithChakra(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <TrackStatsBars key={i} race={mockRace} />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render reasonably quickly (less than 600ms for 10 instances in test environment)
    expect(renderTime).toBeLessThan(600);
    
    // All instances should be rendered
    const lapsTexts = screen.getAllByText('Laps');
    expect(lapsTexts).toHaveLength(10);
  });

  it('handles rapid prop changes', () => {
    const { rerender } = renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    expect(screen.getByText('78')).toBeInTheDocument();
    
    // Rapid changes
    const race1 = { ...mockRace, totalLaps: 50 };
    rerender(<TrackStatsBars race={race1} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    
    const race2 = { ...mockRace, totalLaps: 60 };
    rerender(<TrackStatsBars race={race2} />);
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('handles concurrent renders', () => {
    const { rerender } = renderWithChakra(<TrackStatsBars race={mockRace} />);
    
    // Simulate concurrent renders
    const race1 = { ...mockRace, totalLaps: 50 };
    rerender(<TrackStatsBars race={race1} />);
    
    const race2 = { ...mockRace, totalLaps: 60 };
    rerender(<TrackStatsBars race={race2} />);
    
    const race3 = { ...mockRace, totalLaps: 70 };
    rerender(<TrackStatsBars race={race3} />);
    
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('renders with all supported race properties', () => {
    const complexRace = {
      ...mockRace,
      totalLaps: 78,
      circuitLength: 3.337,
      raceDistance: 260.286,
      trackName: 'Monaco',
      country: 'Monaco',
      date: '2024-05-26',
    };
    
    renderWithChakra(<TrackStatsBars race={complexRace} />);
    
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('3.337 km')).toBeInTheDocument();
    expect(screen.getByText('260.286 km')).toBeInTheDocument();
  });

  it('handles extreme values', () => {
    const extremeRace = {
      ...mockRace,
      totalLaps: Number.MAX_SAFE_INTEGER,
      circuitLength: Number.MAX_VALUE,
      raceDistance: Number.MIN_VALUE,
    };
    
    renderWithChakra(<TrackStatsBars race={extremeRace} />);
    
    expect(screen.getByText(Number.MAX_SAFE_INTEGER.toString())).toBeInTheDocument();
    expect(screen.getByText(`${Number.MAX_VALUE} km`)).toBeInTheDocument();
    expect(screen.getByText(`${Number.MIN_VALUE} km`)).toBeInTheDocument();
  });

  it('renders with different team color formats', () => {
    const colorFormats = [
      { color: '#FF0000', expected: '#FF0000' },
      { color: 'rgb(255, 0, 0)', expected: 'rgb(255, 0, 0)' },
      { color: 'hsl(0, 100%, 50%)', expected: 'hsl(0, 100%, 50%)' },
      { color: 'red', expected: 'rgb(255, 0, 0)' }, // Browser converts named colors to rgb
      { color: 'var(--color-primary-red)', expected: 'var(--color-primary-red)' },
    ];
    
    colorFormats.forEach(({ color, expected }) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={mockRace} teamColor={color} />);
      
      const flagIcon = screen.getByTestId('flag-icon');
      expect(flagIcon).toHaveStyle(`color: ${expected}`);
      
      unmount();
    });
  });

  it('renders with all supported data types', () => {
    const testCases = [
      { totalLaps: 50, circuitLength: 4.0, raceDistance: 200.0 },
      { totalLaps: 60, circuitLength: 5.0, raceDistance: 300.0 },
      { totalLaps: 70, circuitLength: 6.0, raceDistance: 420.0 },
    ];
    
    testCases.forEach(({ totalLaps, circuitLength, raceDistance }) => {
      const race = { ...mockRace, totalLaps, circuitLength, raceDistance };
      const { unmount } = renderWithChakra(<TrackStatsBars race={race} />);
      
      expect(screen.getByText(totalLaps.toString())).toBeInTheDocument();
      expect(screen.getByText(`${circuitLength} km`)).toBeInTheDocument();
      expect(screen.getByText(`${raceDistance} km`)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders with mixed data types', () => {
    const mixedRace = {
      ...mockRace,
      totalLaps: 78.5,
      circuitLength: 3.337,
      raceDistance: 260.286,
    };
    
    renderWithChakra(<TrackStatsBars race={mixedRace} />);
    
    expect(screen.getByText('78.5')).toBeInTheDocument();
    expect(screen.getByText('3.337 km')).toBeInTheDocument();
    expect(screen.getByText('260.286 km')).toBeInTheDocument();
  });

  it('renders with all supported team color types', () => {
    const teamColors = [
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
    ];
    
    teamColors.forEach((color) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={mockRace} teamColor={color} />);
      
      const flagIcon = screen.getByTestId('flag-icon');
      expect(flagIcon).toHaveStyle(`color: ${color}`);
      
      unmount();
    });
  });

  it('renders with all supported race object structures', () => {
    const raceStructures = [
      { ...mockRace, totalLaps: 50, circuitLength: 4.0, raceDistance: 200.0 },
      { ...mockRace, totalLaps: 60, circuitLength: 5.0, raceDistance: 300.0 },
      { ...mockRace, totalLaps: 70, circuitLength: 6.0, raceDistance: 420.0 },
    ];
    
    raceStructures.forEach((race) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={race} />);
      
      expect(screen.getByText(race.totalLaps.toString())).toBeInTheDocument();
      expect(screen.getByText(`${race.circuitLength} km`)).toBeInTheDocument();
      expect(screen.getByText(`${race.raceDistance} km`)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders with all supported prop combinations', () => {
    const combinations = [
      { race: mockRace, teamColor: '#FF0000' },
      { race: { ...mockRace, totalLaps: 50 }, teamColor: '#00FF00' },
      { race: { ...mockRace, circuitLength: 4.0 }, teamColor: '#0000FF' },
      { race: { ...mockRace, raceDistance: 200.0 }, teamColor: '#FFFF00' },
    ];
    
    combinations.forEach(({ race, teamColor }) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={race} teamColor={teamColor} />);
      
      expect(screen.getByText(race.totalLaps.toString())).toBeInTheDocument();
      expect(screen.getByText(`${race.circuitLength} km`)).toBeInTheDocument();
      expect(screen.getByText(`${race.raceDistance} km`)).toBeInTheDocument();
      
      const flagIcon = screen.getByTestId('flag-icon');
      expect(flagIcon).toHaveStyle(`color: ${teamColor}`);
      
      unmount();
    });
  });

  it('renders with all supported edge cases', () => {
    const edgeCases = [
      { race: { ...mockRace, totalLaps: 0, circuitLength: 0, raceDistance: 0 } },
      { race: { ...mockRace, totalLaps: -10, circuitLength: -5.0, raceDistance: -100.0 } },
      { race: { ...mockRace, totalLaps: 1000, circuitLength: 100.0, raceDistance: 100000.0 } },
    ];
    
    edgeCases.forEach(({ race }) => {
      const { unmount } = renderWithChakra(<TrackStatsBars race={race} />);
      
      expect(screen.getByText(race.totalLaps.toString())).toBeInTheDocument();
      // Use getAllByText for km values since there are multiple elements
      const kmElements = screen.getAllByText(`${race.circuitLength} km`);
      expect(kmElements.length).toBeGreaterThan(0);
      const raceDistanceElements = screen.getAllByText(`${race.raceDistance} km`);
      expect(raceDistanceElements.length).toBeGreaterThan(0);
      
      unmount();
    });
  });
});
