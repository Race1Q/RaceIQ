import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Trophy: ({ size, className }: any) => (
    <div data-testid="trophy-icon" data-size={size} className={className}>
      Trophy
    </div>
  ),
  Medal: ({ size, className }: any) => (
    <div data-testid="medal-icon" data-size={size} className={className}>
      Medal
    </div>
  ),
  Award: ({ size, className }: any) => (
    <div data-testid="award-icon" data-size={size} className={className}>
      Award
    </div>
  ),
}));

// Mock teamLogoMap
vi.mock('../../lib/teamAssets', () => ({
  teamLogoMap: {
    'Red Bull': '/assets/Red_Bull_Racing_logo.svg.png',
    'Mercedes': '/assets/Mercedes_F1_Logo.svg.png',
    'Ferrari': '/assets/Ferrari-Logo.png',
    'McLaren': '/assets/McLaren_Racing_logo.svg.png',
    'Aston Martin': '/assets/aston-martin-f1-seeklogo.png',
    'Alpine F1 Team': '/assets/Alpine_F1_Team_Logo.svg.png',
    'Williams': '/assets/Williams_Racing_logo.svg.png',
    'Haas F1 Team': '/assets/Haas_F1_Team_Logo.svg.png',
    'RB F1 Team': '/assets/Logotipo_da_RB_F1_Team.png',
    'Sauber': '/assets/Sauber_F1_Team_logo.svg.png',
    'Default': '/assets/default-team-logo.png',
  },
}));

import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import RaceStandings from './RaceStandings';
import type { RaceStanding } from '../../data/types';

// Create a minimal theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
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
    team: 'Red Bull',
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
];

describe('RaceStandings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByText('Race Results')).toBeInTheDocument();
  });

  it('displays the title correctly', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByText('Race Results')).toBeInTheDocument();
  });

  it('renders all standings entries', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    // Check that all driver names are displayed
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Lando Norris')).toBeInTheDocument();
    expect(screen.getByText('Fernando Alonso')).toBeInTheDocument();
  });

  it('displays driver abbreviations correctly', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByText('VER')).toBeInTheDocument();
    expect(screen.getByText('HAM')).toBeInTheDocument();
    expect(screen.getByText('LEC')).toBeInTheDocument();
    expect(screen.getByText('NOR')).toBeInTheDocument();
    expect(screen.getByText('ALO')).toBeInTheDocument();
  });

  it('displays intervals correctly', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByText('+0.000')).toBeInTheDocument();
    expect(screen.getByText('+12.345')).toBeInTheDocument();
    expect(screen.getByText('+23.456')).toBeInTheDocument();
    expect(screen.getByText('+34.567')).toBeInTheDocument();
    expect(screen.getByText('+45.678')).toBeInTheDocument();
  });

  it('displays position numbers correctly', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows trophy icon for first position', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
  });

  it('shows medal icon for second position', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByTestId('medal-icon')).toBeInTheDocument();
  });

  it('shows award icon for third position', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    expect(screen.getByTestId('award-icon')).toBeInTheDocument();
  });

  it('renders team logos correctly', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    // Check that team logos are rendered
    const teamLogos = screen.getAllByRole('img');
    expect(teamLogos).toHaveLength(5); // One logo per driver
    
    // Check specific team logos - the component uses fallback for unknown teams
    expect(teamLogos[0]).toHaveAttribute('alt', 'Red Bull logo');
    expect(teamLogos[0]).toHaveAttribute('src', '/assets/default-team-logo.png');
    expect(teamLogos[1]).toHaveAttribute('alt', 'Mercedes logo');
    expect(teamLogos[1]).toHaveAttribute('src', '/assets/default-team-logo.png');
  });

  it('handles empty standings array', () => {
    renderWithProviders(<RaceStandings standings={[]} />);
    
    expect(screen.getByText('Race Results')).toBeInTheDocument();
    // Should not render any driver names
    expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
  });

  it('handles standings with missing optional fields', () => {
    const standingsWithMissingFields: RaceStanding[] = [
      {
        position: 1,
        driver: 'Test Driver',
        points: 25,
        team: 'Test Team',
        driverAbbreviation: 'TST',
        driverImageUrl: '/assets/test.png',
        // Missing interval and status
      },
    ];
    
    renderWithProviders(<RaceStandings standings={standingsWithMissingFields} />);
    
    expect(screen.getByText('Test Driver')).toBeInTheDocument();
    expect(screen.getByText('TST')).toBeInTheDocument();
  });

  it('handles unknown team names with fallback logo', () => {
    const standingsWithUnknownTeam: RaceStanding[] = [
      {
        position: 1,
        driver: 'Unknown Driver',
        points: 25,
        team: 'Unknown Team',
        driverAbbreviation: 'UNK',
        driverImageUrl: '/assets/unknown.png',
        interval: '+0.000',
      },
    ];
    
    renderWithProviders(<RaceStandings standings={standingsWithUnknownTeam} />);
    
    expect(screen.getByText('Unknown Driver')).toBeInTheDocument();
    
    // Should use fallback logo for unknown team
    const teamLogos = screen.getAllByRole('img');
    expect(teamLogos[0]).toHaveAttribute('alt', 'Unknown Team logo');
    expect(teamLogos[0]).toHaveAttribute('src', '/assets/default-team-logo.png');
  });

  it('handles standings with different position ranges', () => {
    const standingsWithVariousPositions: RaceStanding[] = [
      { ...mockStandings[0], position: 10 },
      { ...mockStandings[1], position: 15 },
      { ...mockStandings[2], position: 20 },
    ];
    
    renderWithProviders(<RaceStandings standings={standingsWithVariousPositions} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    
    // Should not show position icons for positions > 3
    expect(screen.queryByTestId('trophy-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('medal-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('award-icon')).not.toBeInTheDocument();
  });

  it('handles standings with special characters in names', () => {
    const standingsWithSpecialChars: RaceStanding[] = [
      {
        position: 1,
        driver: 'José María López',
        points: 25,
        team: 'Team Ñoño',
        driverAbbreviation: 'LOP',
        driverImageUrl: '/assets/lopez.png',
        interval: '+0.000',
      },
    ];
    
    renderWithProviders(<RaceStandings standings={standingsWithSpecialChars} />);
    
    expect(screen.getByText('José María López')).toBeInTheDocument();
    expect(screen.getByText('LOP')).toBeInTheDocument();
  });

  it('handles standings with very long driver names', () => {
    const standingsWithLongName: RaceStanding[] = [
      {
        position: 1,
        driver: 'Very Long Driver Name That Should Be Displayed Properly Without Breaking The Layout',
        points: 25,
        team: 'Long Team Name That Should Also Be Handled Correctly',
        driverAbbreviation: 'LNG',
        driverImageUrl: '/assets/long.png',
        interval: '+0.000',
      },
    ];
    
    renderWithProviders(<RaceStandings standings={standingsWithLongName} />);
    
    expect(screen.getByText('Very Long Driver Name That Should Be Displayed Properly Without Breaking The Layout')).toBeInTheDocument();
    expect(screen.getByText('LNG')).toBeInTheDocument();
  });

  it('handles standings with zero or negative intervals', () => {
    const standingsWithSpecialIntervals: RaceStanding[] = [
      {
        position: 1,
        driver: 'Leader',
        points: 25,
        team: 'Leading Team',
        driverAbbreviation: 'LED',
        driverImageUrl: '/assets/leader.png',
        interval: '+0.000',
      },
      {
        position: 2,
        driver: 'Lapped',
        points: 18,
        team: 'Lapped Team',
        driverAbbreviation: 'LAP',
        driverImageUrl: '/assets/lapped.png',
        interval: '+1 LAP',
      },
    ];
    
    renderWithProviders(<RaceStandings standings={standingsWithSpecialIntervals} />);
    
    expect(screen.getByText('+0.000')).toBeInTheDocument();
    expect(screen.getByText('+1 LAP')).toBeInTheDocument();
  });

  it('handles standings with DNF status', () => {
    const standingsWithDNF: RaceStanding[] = [
      {
        position: 1,
        driver: 'Finisher',
        points: 25,
        team: 'Finishing Team',
        driverAbbreviation: 'FIN',
        driverImageUrl: '/assets/finisher.png',
        interval: '+0.000',
        status: 'Finished',
      },
      {
        position: 20,
        driver: 'DNF Driver',
        points: 0,
        team: 'DNF Team',
        driverAbbreviation: 'DNF',
        driverImageUrl: '/assets/dnf.png',
        interval: 'DNF',
        status: 'DNF',
      },
    ];
    
    renderWithProviders(<RaceStandings standings={standingsWithDNF} />);
    
    expect(screen.getByText('Finisher')).toBeInTheDocument();
    expect(screen.getByText('DNF Driver')).toBeInTheDocument();
    // Check that both DNF texts exist (abbreviation and interval)
    expect(screen.getAllByText('DNF')).toHaveLength(2);
  });

  it('renders correct number of standings items', () => {
    renderWithProviders(<RaceStandings standings={mockStandings} />);
    
    // Should render exactly 5 standings items
    const positionNumbers = screen.getAllByText(/^[1-5]$/);
    expect(positionNumbers).toHaveLength(5);
  });

  it('handles single standing entry', () => {
    const singleStanding = [mockStandings[0]];
    
    renderWithProviders(<RaceStandings standings={singleStanding} />);
    
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('VER')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
  });
});
