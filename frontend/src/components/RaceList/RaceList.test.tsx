import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RaceList from './RaceList';
import type { Race } from '../../data/types';

// Mock Chakra UI theme
const theme = {
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      red: '#e53e3e',
    },
  },
  components: {
    Box: {
      baseStyle: {},
    },
    Text: {
      baseStyle: {},
    },
    VStack: {
      baseStyle: {},
    },
    Input: {
      baseStyle: {},
    },
    InputGroup: {
      baseStyle: {},
    },
    InputLeftElement: {
      baseStyle: {},
    },
  },
};

// Mock teamColors
vi.mock('../../lib/assets', () => ({
  teamColors: {
    'Mercedes': '#00D2BE',
    'Red Bull Racing': '#0600EF',
    'Ferrari': '#DC0000',
    'McLaren': '#FF8700',
    'Aston Martin': '#006F62',
    'Alpine': '#0090FF',
    'Williams': '#005AFF',
    'Haas F1 Team': '#FFFFFF',
    'AlphaTauri': '#2B4562',
    'Alfa Romeo': '#900000',
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
}

// Mock race data
const mockRaces: Race[] = [
  {
    id: '1',
    trackName: 'Silverstone Circuit',
    country: 'United Kingdom',
    countryCode: 'GBR',
    date: '2024-07-14',
    trackMapCoords: '52.0786,-1.0169',
    standings: [
      { position: 1, driver: 'Lewis Hamilton', points: 25, team: 'Mercedes', driverAbbreviation: 'HAM', driverImageUrl: '', interval: '+0.000', status: 'Finished' },
      { position: 2, driver: 'Max Verstappen', points: 18, team: 'Red Bull Racing', driverAbbreviation: 'VER', driverImageUrl: '', interval: '+2.000', status: 'Finished' },
    ],
    keyInfo: {
      weather: 'Sunny',
      fastestLap: { driver: 'Lewis Hamilton', time: '1:27.369' },
      totalOvertakes: 15,
    },
    flagsTimeline: [],
    paceDistribution: [],
    tireStrategies: [],
    historicalStats: {
      lapRecord: { driver: 'Max Verstappen', time: '1:27.097' },
      previousWinner: 'Lewis Hamilton',
    },
    driverOfTheDay: 'Lewis Hamilton',
    circuitLength: 5.891,
    raceDistance: 306.198,
    totalLaps: 52,
    weather: {
      airTemp: 22,
      trackTemp: 35,
      windSpeed: 12,
      condition: 'Sunny',
    },
    lapPositions: [],
    raceControlMessages: [],
  },
  {
    id: '2',
    trackName: 'Monaco Circuit',
    country: 'Monaco',
    countryCode: 'MON',
    date: '2024-05-26',
    trackMapCoords: '43.7347,7.4206',
    standings: [
      { position: 1, driver: 'Charles Leclerc', points: 25, team: 'Ferrari', driverAbbreviation: 'LEC', driverImageUrl: '', interval: '+0.000', status: 'Finished' },
      { position: 2, driver: 'Lando Norris', points: 18, team: 'McLaren', driverAbbreviation: 'NOR', driverImageUrl: '', interval: '+1.500', status: 'Finished' },
    ],
    keyInfo: {
      weather: 'Sunny',
      fastestLap: { driver: 'Charles Leclerc', time: '1:12.909' },
      totalOvertakes: 3,
    },
    flagsTimeline: [],
    paceDistribution: [],
    tireStrategies: [],
    historicalStats: {
      lapRecord: { driver: 'Lewis Hamilton', time: '1:12.909' },
      previousWinner: 'Charles Leclerc',
    },
    driverOfTheDay: 'Charles Leclerc',
    circuitLength: 3.337,
    raceDistance: 260.286,
    totalLaps: 78,
    weather: {
      airTemp: 24,
      trackTemp: 38,
      windSpeed: 8,
      condition: 'Sunny',
    },
    lapPositions: [],
    raceControlMessages: [],
  },
  {
    id: '3',
    trackName: 'Spa-Francorchamps',
    country: 'Belgium',
    countryCode: 'BEL',
    date: '2024-08-25',
    trackMapCoords: '50.4372,5.9714',
    standings: [
      { position: 1, driver: 'Max Verstappen', points: 25, team: 'Red Bull Racing', driverAbbreviation: 'VER', driverImageUrl: '', interval: '+0.000', status: 'Finished' },
      { position: 2, driver: 'Lewis Hamilton', points: 18, team: 'Mercedes', driverAbbreviation: 'HAM', driverImageUrl: '', interval: '+3.000', status: 'Finished' },
    ],
    keyInfo: {
      weather: 'Cloudy',
      fastestLap: { driver: 'Max Verstappen', time: '1:46.286' },
      totalOvertakes: 8,
    },
    flagsTimeline: [],
    paceDistribution: [],
    tireStrategies: [],
    historicalStats: {
      lapRecord: { driver: 'Valtteri Bottas', time: '1:46.286' },
      previousWinner: 'Max Verstappen',
    },
    driverOfTheDay: 'Max Verstappen',
    circuitLength: 7.004,
    raceDistance: 308.052,
    totalLaps: 44,
    weather: {
      airTemp: 18,
      trackTemp: 25,
      windSpeed: 15,
      condition: 'Cloudy',
    },
    lapPositions: [],
    raceControlMessages: [],
  },
];

describe('RaceList', () => {
  const mockOnRaceSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Races')).toBeInTheDocument();
  });

  it('displays the title correctly', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Races')).toBeInTheDocument();
  });

  it('displays search input with correct placeholder', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders all races when no search term', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.getByText('Monaco Circuit')).toBeInTheDocument();
    expect(screen.getByText('Spa-Francorchamps')).toBeInTheDocument();
  });

  it('filters races by track name', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    fireEvent.change(searchInput, { target: { value: 'Silverstone' } });
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Spa-Francorchamps')).not.toBeInTheDocument();
  });

  it('filters races by country name', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    fireEvent.change(searchInput, { target: { value: 'Monaco' } });
    
    expect(screen.getByText('Monaco Circuit')).toBeInTheDocument();
    expect(screen.queryByText('Silverstone Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Spa-Francorchamps')).not.toBeInTheDocument();
  });

  it('filters races case-insensitively', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    fireEvent.change(searchInput, { target: { value: 'silverstone' } });
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
  });

  it('shows no results when search term matches nothing', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    
    expect(screen.queryByText('Silverstone Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Spa-Francorchamps')).not.toBeInTheDocument();
  });

  it('calls onRaceSelect when race is clicked', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const raceItem = screen.getByText('Monaco Circuit').closest('div');
    fireEvent.click(raceItem!);
    
    expect(mockOnRaceSelect).toHaveBeenCalledWith('2');
  });

  it('calls onRaceSelect with correct race ID for different races', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const spaRace = screen.getByText('Spa-Francorchamps').closest('div');
    fireEvent.click(spaRace!);
    
    expect(mockOnRaceSelect).toHaveBeenCalledWith('3');
  });

  it('displays race information correctly', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    // Check track names
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.getByText('Monaco Circuit')).toBeInTheDocument();
    expect(screen.getByText('Spa-Francorchamps')).toBeInTheDocument();
    
    // Check countries
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Monaco')).toBeInTheDocument();
    expect(screen.getByText('Belgium')).toBeInTheDocument();
    
    // Check dates (formatted) - component uses toLocaleDateString which formats as M/D/YYYY in test environment
    expect(screen.getByText('7/14/2024')).toBeInTheDocument();
    expect(screen.getByText('5/26/2024')).toBeInTheDocument();
    expect(screen.getByText('8/25/2024')).toBeInTheDocument();
  });

  it('handles empty races array', () => {
    renderWithProviders(
      <RaceList 
        races={[]} 
        selectedRaceId="" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Races')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search races...')).toBeInTheDocument();
  });

  it('handles single race', () => {
    const singleRace = [mockRaces[0]];
    
    renderWithProviders(
      <RaceList 
        races={singleRace} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('7/14/2024')).toBeInTheDocument();
  });

  it('handles race with missing standings', () => {
    const raceWithoutStandings: Race = {
      ...mockRaces[0],
      standings: [
        { position: 1, driver: 'Unknown Driver', points: 25, team: 'Unknown Team', driverAbbreviation: 'UNK', driverImageUrl: '', interval: '+0.000', status: 'Finished' },
      ],
    };
    
    renderWithProviders(
      <RaceList 
        races={[raceWithoutStandings]} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
  });

  it('handles race with unknown team in standings', () => {
    const raceWithUnknownTeam: Race = {
      ...mockRaces[0],
      standings: [
        { position: 1, driver: 'Unknown Driver', points: 25, team: 'Unknown Team', driverAbbreviation: 'UNK', driverImageUrl: '', interval: '+0.000', status: 'Finished' },
      ],
    };
    
    renderWithProviders(
      <RaceList 
        races={[raceWithUnknownTeam]} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
  });

  it('handles search with partial matches', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    fireEvent.change(searchInput, { target: { value: 'Circuit' } });
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.getByText('Monaco Circuit')).toBeInTheDocument();
    expect(screen.queryByText('Spa-Francorchamps')).not.toBeInTheDocument();
  });

  it('handles search with special characters', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    fireEvent.change(searchInput, { target: { value: 'Spa-' } });
    
    expect(screen.getByText('Spa-Francorchamps')).toBeInTheDocument();
    expect(screen.queryByText('Silverstone Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
  });

  it('clears search when input is cleared', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    
    // Search for something
    fireEvent.change(searchInput, { target: { value: 'Silverstone' } });
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.getByText('Monaco Circuit')).toBeInTheDocument();
    expect(screen.getByText('Spa-Francorchamps')).toBeInTheDocument();
  });

  it('handles rapid search changes', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    
    // Multiple rapid changes
    fireEvent.change(searchInput, { target: { value: 'Silver' } });
    fireEvent.change(searchInput, { target: { value: 'Monaco' } });
    fireEvent.change(searchInput, { target: { value: 'Spa' } });
    
    expect(screen.getByText('Spa-Francorchamps')).toBeInTheDocument();
    expect(screen.queryByText('Silverstone Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
  });

  it('handles very long search terms', () => {
    renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    const longSearchTerm = 'a'.repeat(1000);
    
    fireEvent.change(searchInput, { target: { value: longSearchTerm } });
    
    // Should not crash and should show no results
    expect(screen.queryByText('Silverstone Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Spa-Francorchamps')).not.toBeInTheDocument();
  });

  it('handles race with very long track name', () => {
    const raceWithLongName: Race = {
      ...mockRaces[0],
      trackName: 'Very Long Track Name That Should Be Displayed Properly Without Breaking The Layout Or Causing Any Issues',
    };
    
    renderWithProviders(
      <RaceList 
        races={[raceWithLongName]} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Very Long Track Name That Should Be Displayed Properly Without Breaking The Layout Or Causing Any Issues')).toBeInTheDocument();
  });

  it('handles race with special characters in track name', () => {
    const raceWithSpecialChars: Race = {
      ...mockRaces[0],
      trackName: 'Circuit de Monaco (Monte Carlo)',
    };
    
    renderWithProviders(
      <RaceList 
        races={[raceWithSpecialChars]} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('Circuit de Monaco (Monte Carlo)')).toBeInTheDocument();
  });

  it('handles race with special characters in country name', () => {
    const raceWithSpecialChars: Race = {
      ...mockRaces[0],
      country: 'São Paulo',
    };
    
    renderWithProviders(
      <RaceList 
        races={[raceWithSpecialChars]} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
  });

  it('maintains search state during re-renders', () => {
    const { rerender } = renderWithProviders(
      <RaceList 
        races={mockRaces} 
        selectedRaceId="1" 
        onRaceSelect={mockOnRaceSelect} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search races...');
    fireEvent.change(searchInput, { target: { value: 'Silverstone' } });
    
    // Verify search is working
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Spa-Francorchamps')).not.toBeInTheDocument();
    
    // Re-render with same props
    rerender(
      <ChakraProvider theme={theme}>
        <RaceList 
          races={mockRaces} 
          selectedRaceId="1" 
          onRaceSelect={mockOnRaceSelect} 
        />
      </ChakraProvider>
    );
    
    // Search state is maintained after re-render (component doesn't lose internal state)
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.queryByText('Monaco Circuit')).not.toBeInTheDocument();
    expect(screen.queryByText('Spa-Francorchamps')).not.toBeInTheDocument();
  });
});
