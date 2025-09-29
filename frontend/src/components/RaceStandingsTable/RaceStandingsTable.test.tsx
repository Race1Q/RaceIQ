import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the assets
vi.mock('../../lib/assets', () => ({
  driverAbbreviations: {
    'Max Verstappen': 'VER',
    'Lewis Hamilton': 'HAM',
    'Charles Leclerc': 'LEC',
    'Lando Norris': 'NOR',
    'Carlos Sainz': 'SAI',
    'George Russell': 'RUS',
    'Fernando Alonso': 'ALO',
    'Oscar Piastri': 'PIA',
    'Lance Stroll': 'STR',
    'Pierre Gasly': 'GAS',
    'Esteban Ocon': 'OCO',
    'Alexander Albon': 'ALB',
    'Yuki Tsunoda': 'TSU',
    'Valtteri Bottas': 'BOT',
    'Nico Hulkenberg': 'HUL',
    'Sergio Perez': 'PER',
    'Daniel Ricciardo': 'RIC',
    'Zhou Guanyu': 'ZHO',
    'Kevin Magnussen': 'MAG',
    'Logan Sargeant': 'SAR',
  },
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

import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import RaceStandingsTable from './RaceStandingsTable';
import type { Race, RaceStanding } from '../../data/types';

// Create a minimal theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  semanticTokens: {
    colors: {
      'bg-surface': { _light: 'white', _dark: 'gray.800' },
      'bg-surface-raised': { _light: 'gray.50', _dark: 'gray.700' },
      'border-primary': { _light: 'gray.200', _dark: 'gray.600' },
      'text-primary': { _light: 'gray.900', _dark: 'white' },
      'text-secondary': { _light: 'gray.600', _dark: 'gray.400' },
      'brand.red': { _light: 'red.500', _dark: 'red.400' },
    },
  },
});

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
}

// Mock race standings data
const mockStandings: RaceStanding[] = [
  {
    position: 1,
    driver: 'Max Verstappen',
    points: 25,
    team: 'Red Bull Racing',
    driverAbbreviation: 'VER',
    driverImageUrl: '/assets/verstappen.png',
    interval: '+0.000',
    status: 'Finished',
  },
  {
    position: 2,
    driver: 'Lewis Hamilton',
    points: 18,
    team: 'Mercedes',
    driverAbbreviation: 'HAM',
    driverImageUrl: '/assets/hamilton.png',
    interval: '+12.345',
    status: 'Finished',
  },
  {
    position: 3,
    driver: 'Charles Leclerc',
    points: 15,
    team: 'Ferrari',
    driverAbbreviation: 'LEC',
    driverImageUrl: '/assets/leclerc.png',
    interval: '+23.456',
    status: 'Finished',
  },
  {
    position: 4,
    driver: 'Lando Norris',
    points: 12,
    team: 'McLaren',
    driverAbbreviation: 'NOR',
    driverImageUrl: '/assets/norris.png',
    interval: '+34.567',
    status: 'Finished',
  },
  {
    position: 5,
    driver: 'Fernando Alonso',
    points: 10,
    team: 'Aston Martin',
    driverAbbreviation: 'ALO',
    driverImageUrl: '/assets/alonso.png',
    interval: '+45.678',
    status: 'Finished',
  },
  {
    position: 6,
    driver: 'George Russell',
    points: 8,
    team: 'Mercedes',
    driverAbbreviation: 'RUS',
    driverImageUrl: '/assets/russell.png',
    interval: '+56.789',
    status: 'Finished',
  },
  {
    position: 7,
    driver: 'Carlos Sainz',
    points: 6,
    team: 'Ferrari',
    driverAbbreviation: 'SAI',
    driverImageUrl: '/assets/sainz.png',
    interval: '+67.890',
    status: 'Finished',
  },
  {
    position: 8,
    driver: 'Oscar Piastri',
    points: 4,
    team: 'McLaren',
    driverAbbreviation: 'PIA',
    driverImageUrl: '/assets/piastri.png',
    interval: '+78.901',
    status: 'Finished',
  },
  {
    position: 9,
    driver: 'Pierre Gasly',
    points: 2,
    team: 'Alpine',
    driverAbbreviation: 'GAS',
    driverImageUrl: '/assets/gasly.png',
    interval: '+89.012',
    status: 'Finished',
  },
  {
    position: 10,
    driver: 'Alexander Albon',
    points: 1,
    team: 'Williams',
    driverAbbreviation: 'ALB',
    driverImageUrl: '/assets/albon.png',
    interval: '+90.123',
    status: 'Finished',
  },
];

// Mock race data
const mockRace: Race = {
  id: 'race-1',
  trackName: 'Bahrain Grand Prix',
  country: 'Bahrain',
  countryCode: 'BHR',
  date: '2024-03-02',
  trackMapCoords: '50.512,26.0325',
  standings: mockStandings,
  keyInfo: {
    weather: 'Sunny',
    fastestLap: { driver: 'Max Verstappen', time: '1:23.456' },
    totalOvertakes: 15,
  },
  flagsTimeline: [],
  paceDistribution: [],
  tireStrategies: [],
  historicalStats: {
    lapRecord: { driver: 'Lewis Hamilton', time: '1:23.456' },
    previousWinner: 'Max Verstappen',
  },
  driverOfTheDay: 'Max Verstappen',
  circuitLength: 5.412,
  raceDistance: 308.238,
  totalLaps: 57,
  weather: {
    airTemp: 25,
    trackTemp: 35,
    windSpeed: 5,
    condition: 'Sunny',
  },
  lapPositions: [],
  raceControlMessages: [],
};

const mockAllRaces: Race[] = [
  mockRace,
  {
    ...mockRace,
    id: 'race-2',
    trackName: 'Saudi Arabian Grand Prix',
    country: 'Saudi Arabia',
    countryCode: 'SAU',
    date: '2024-03-09',
  },
  {
    ...mockRace,
    id: 'race-3',
    trackName: 'Australian Grand Prix',
    country: 'Australia',
    countryCode: 'AUS',
    date: '2024-03-24',
  },
];

describe('RaceStandingsTable', () => {
  const mockOnSelectRace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Race Results')).toBeInTheDocument();
  });

  it('displays the title correctly', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Race Results')).toBeInTheDocument();
  });

  it('displays race selector with all races', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    const raceSelector = screen.getByDisplayValue('Bahrain Grand Prix');
    expect(raceSelector).toBeInTheDocument();
    
    // Check that all races are available as options
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    expect(screen.getByText('Saudi Arabian Grand Prix')).toBeInTheDocument();
    expect(screen.getByText('Australian Grand Prix')).toBeInTheDocument();
  });

  it('displays time selector with correct options', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    const timeSelector = screen.getByDisplayValue('Interval');
    expect(timeSelector).toBeInTheDocument();
    
    // Check that time options are available - use getAllByText to handle multiple instances
    expect(screen.getAllByText('Interval')).toHaveLength(1);
    expect(screen.getAllByText('Time')).toHaveLength(2); // One in select option, one in table header
  });

  it('displays table headers correctly', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Pos')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
    // Use getAllByText to handle multiple "Time" instances
    expect(screen.getAllByText('Time')).toHaveLength(2); // One in select option, one in table header
  });

  it('displays top 5 standings by default', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Should show first 5 drivers
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Lando Norris')).toBeInTheDocument();
    expect(screen.getByText('Fernando Alonso')).toBeInTheDocument();
    
    // Should not show drivers beyond position 5
    expect(screen.queryByText('George Russell')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Sainz')).not.toBeInTheDocument();
  });

  it('displays driver abbreviations correctly', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('VER')).toBeInTheDocument();
    expect(screen.getByText('HAM')).toBeInTheDocument();
    expect(screen.getByText('LEC')).toBeInTheDocument();
    expect(screen.getByText('NOR')).toBeInTheDocument();
    expect(screen.getByText('ALO')).toBeInTheDocument();
  });

  it('displays intervals correctly', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('+0.000')).toBeInTheDocument();
    expect(screen.getByText('+12.345')).toBeInTheDocument();
    expect(screen.getByText('+23.456')).toBeInTheDocument();
    expect(screen.getByText('+34.567')).toBeInTheDocument();
    expect(screen.getByText('+45.678')).toBeInTheDocument();
  });

  it('displays position numbers correctly', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows "Show Top 10" button by default', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Show Top 10')).toBeInTheDocument();
  });

  it('toggles between top 5 and top 10 when button is clicked', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Initially shows top 5
    expect(screen.queryByText('George Russell')).not.toBeInTheDocument();
    
    // Click to show top 10
    const showAllButton = screen.getByText('Show Top 10');
    fireEvent.click(showAllButton);
    
    // Should now show top 10
    expect(screen.getByText('George Russell')).toBeInTheDocument();
    expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
    expect(screen.getByText('Oscar Piastri')).toBeInTheDocument();
    expect(screen.getByText('Pierre Gasly')).toBeInTheDocument();
    expect(screen.getByText('Alexander Albon')).toBeInTheDocument();
    
    // Button text should change
    expect(screen.getByText('Show Top 5')).toBeInTheDocument();
    
    // Click to show top 5 again
    const showTop5Button = screen.getByText('Show Top 5');
    fireEvent.click(showTop5Button);
    
    // Should show top 5 again
    expect(screen.queryByText('George Russell')).not.toBeInTheDocument();
    expect(screen.getByText('Show Top 10')).toBeInTheDocument();
  });

  it('calls onSelectRace when race selector changes', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    const raceSelector = screen.getByDisplayValue('Bahrain Grand Prix');
    fireEvent.change(raceSelector, { target: { value: 'race-2' } });
    
    expect(mockOnSelectRace).toHaveBeenCalledWith('race-2');
  });

  it('handles missing onSelectRace callback', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} />
    );
    
    const raceSelector = screen.getByDisplayValue('Bahrain Grand Prix');
    fireEvent.change(raceSelector, { target: { value: 'race-2' } });
    
    // Should not throw error when onSelectRace is not provided
    expect(mockOnSelectRace).not.toHaveBeenCalled();
  });

  it('handles empty standings array', () => {
    const raceWithNoStandings = { ...mockRace, standings: [] };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithNoStandings} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Race Results')).toBeInTheDocument();
    expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
  });

  it('handles standings with missing intervals', () => {
    const standingsWithMissingIntervals = mockStandings.map(s => ({ ...s, interval: undefined }));
    const raceWithMissingIntervals = { ...mockRace, standings: standingsWithMissingIntervals };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithMissingIntervals} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Should show dashes for missing intervals
    expect(screen.getAllByText('-')).toHaveLength(5); // Top 5 standings
  });

  it('handles standings with DNF intervals', () => {
    const standingsWithDNF = [
      ...mockStandings.slice(0, 4),
      { ...mockStandings[4], interval: 'DNF' },
    ];
    const raceWithDNF = { ...mockRace, standings: standingsWithDNF };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithDNF} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('DNF')).toBeInTheDocument();
  });

  it('handles drivers with unknown abbreviations', () => {
    const standingsWithUnknownDriver = [
      ...mockStandings.slice(0, 4),
      { ...mockStandings[4], driver: 'Unknown Driver', driverAbbreviation: 'UNK' },
    ];
    const raceWithUnknownDriver = { ...mockRace, standings: standingsWithUnknownDriver };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithUnknownDriver} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Should fallback to driverAbbreviation when driver name is not in abbreviations map
    expect(screen.getByText('UNK')).toBeInTheDocument();
  });

  it('handles teams with unknown colors', () => {
    const standingsWithUnknownTeam = [
      ...mockStandings.slice(0, 4),
      { ...mockStandings[4], team: 'Unknown Team' },
    ];
    const raceWithUnknownTeam = { ...mockRace, standings: standingsWithUnknownTeam };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithUnknownTeam} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Should still render the component even with unknown team
    expect(screen.getByText('Fernando Alonso')).toBeInTheDocument();
  });

  it('handles single race in allRaces array', () => {
    const singleRaceArray = [mockRace];
    
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={singleRaceArray} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    expect(screen.getByText('Race Results')).toBeInTheDocument();
  });

  it('handles empty allRaces array', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={[]} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Race Results')).toBeInTheDocument();
    // Race selector should still be present but with no options - check for the select element instead
    const raceSelectors = screen.getAllByRole('combobox');
    expect(raceSelectors).toHaveLength(2); // Race selector and time selector
  });

  it('displays correct number of rows when showing top 5', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Should have 5 data rows (excluding header)
    const tableRows = screen.getAllByRole('row');
    expect(tableRows).toHaveLength(6); // 1 header + 5 data rows
  });

  it('displays correct number of rows when showing top 10', () => {
    renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Click to show top 10
    const showAllButton = screen.getByText('Show Top 10');
    fireEvent.click(showAllButton);
    
    // Should have 10 data rows (excluding header)
    const tableRows = screen.getAllByRole('row');
    expect(tableRows).toHaveLength(11); // 1 header + 10 data rows
  });

  it('handles standings with special characters in driver names', () => {
    const standingsWithSpecialChars = [
      ...mockStandings.slice(0, 4),
      { ...mockStandings[4], driver: 'José María López' },
    ];
    const raceWithSpecialChars = { ...mockRace, standings: standingsWithSpecialChars };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithSpecialChars} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('José María López')).toBeInTheDocument();
  });

  it('handles very long driver names', () => {
    const standingsWithLongName = [
      ...mockStandings.slice(0, 4),
      { ...mockStandings[4], driver: 'Very Long Driver Name That Should Be Displayed Properly Without Breaking The Layout' },
    ];
    const raceWithLongName = { ...mockRace, standings: standingsWithLongName };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithLongName} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('Very Long Driver Name That Should Be Displayed Properly Without Breaking The Layout')).toBeInTheDocument();
  });

  it('handles standings with different position ranges', () => {
    const standingsWithVariousPositions = mockStandings.map((s, index) => ({ ...s, position: index + 10 }));
    const raceWithVariousPositions = { ...mockRace, standings: standingsWithVariousPositions };
    
    renderWithProviders(
      <RaceStandingsTable race={raceWithVariousPositions} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('maintains correct state when switching between races', () => {
    const { rerender } = renderWithProviders(
      <RaceStandingsTable race={mockRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Initially shows top 5
    expect(screen.queryByText('George Russell')).not.toBeInTheDocument();
    
    // Click to show top 10
    const showAllButton = screen.getByText('Show Top 10');
    fireEvent.click(showAllButton);
    
    // Should show top 10
    expect(screen.getByText('George Russell')).toBeInTheDocument();
    
    // Switch to different race
    const differentRace = { ...mockAllRaces[1], standings: mockStandings.slice(0, 3) };
    rerender(
      <RaceStandingsTable race={differentRace} allRaces={mockAllRaces} onSelectRace={mockOnSelectRace} />
    );
    
    // Should reset to showing top 5 (or fewer if race has fewer standings)
    expect(screen.queryByText('George Russell')).not.toBeInTheDocument();
    expect(screen.getByText('Show Top 10')).toBeInTheDocument();
  });
});
