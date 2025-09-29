import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import KeyInfoBar from './KeyInfoBar';

// Mock TeamLogo component
vi.mock('../TeamLogo/TeamLogo', () => ({
  default: ({ teamName }: { teamName: string }) => (
    <div data-testid={`team-logo-${teamName.toLowerCase().replace(/\s+/g, '-')}`}>
      {teamName} Logo
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Trophy: (props: any) => <div data-testid="trophy-icon" {...props}>Trophy</div>,
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props}>TrendingUp</div>,
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props}>Calendar</div>,
  Medal: (props: any) => <div data-testid="medal-icon" {...props}>Medal</div>,
}));

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('KeyInfoBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDriver = {
    teamName: 'Red Bull Racing',
    championshipStanding: '1st',
    points: 454,
    wins: 19,
    podiums: 22,
    firstRace: {
      year: '2015',
      event: 'Australian Grand Prix'
    }
  };

  it('renders without crashing', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    expect(screen.getByText('Career Stats')).toBeInTheDocument();
  });

  it('renders team logo with correct team name', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    expect(screen.getByTestId('team-logo-red-bull-racing')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing Logo')).toBeInTheDocument();
  });

  it('renders all career stats with correct values', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    // Check all stat labels
    expect(screen.getByText('First Race')).toBeInTheDocument();
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('Podiums')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('Standing')).toBeInTheDocument();
    
    // Check all stat values
    expect(screen.getByText('2015')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('454')).toBeInTheDocument();
    expect(screen.getByText('1st')).toBeInTheDocument();
  });

  it('renders first race sub-value correctly', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    expect(screen.getByText('Australian Grand Prix')).toBeInTheDocument();
  });

  it('renders all icons correctly', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('trophy-icon')).toHaveLength(2); // One for wins, one for standing
    expect(screen.getByTestId('medal-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('handles different driver data correctly', () => {
    const differentDriver = {
      teamName: 'Ferrari',
      championshipStanding: '2nd',
      points: 312,
      wins: 3,
      podiums: 15,
      firstRace: {
        year: '2021',
        event: 'Bahrain Grand Prix'
      }
    };

    renderWithChakra(<KeyInfoBar driver={differentDriver} />);
    
    expect(screen.getByTestId('team-logo-ferrari')).toBeInTheDocument();
    expect(screen.getByText('Ferrari Logo')).toBeInTheDocument();
    expect(screen.getByText('2nd')).toBeInTheDocument();
    expect(screen.getByText('312')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const driverWithZeros = {
      teamName: 'Williams',
      championshipStanding: '10th',
      points: 0,
      wins: 0,
      podiums: 0,
      firstRace: {
        year: '2023',
        event: 'Bahrain Grand Prix'
      }
    };

    renderWithChakra(<KeyInfoBar driver={driverWithZeros} />);
    
    expect(screen.getAllByText('0')).toHaveLength(3); // points, wins, podiums
  });

  it('handles long team names correctly', () => {
    const driverWithLongTeamName = {
      teamName: 'Aston Martin Aramco Cognizant F1 Team',
      championshipStanding: '5th',
      points: 206,
      wins: 0,
      podiums: 8,
      firstRace: {
        year: '2021',
        event: 'Bahrain Grand Prix'
      }
    };

    renderWithChakra(<KeyInfoBar driver={driverWithLongTeamName} />);
    
    expect(screen.getByTestId('team-logo-aston-martin-aramco-cognizant-f1-team')).toBeInTheDocument();
    expect(screen.getByText('Aston Martin Aramco Cognizant F1 Team Logo')).toBeInTheDocument();
  });

  it('handles long first race event names correctly', () => {
    const driverWithLongEventName = {
      teamName: 'McLaren',
      championshipStanding: '4th',
      points: 302,
      wins: 1,
      podiums: 9,
      firstRace: {
        year: '2023',
        event: 'Formula 1 Rolex Australian Grand Prix 2023'
      }
    };

    renderWithChakra(<KeyInfoBar driver={driverWithLongEventName} />);
    
    expect(screen.getByText('Formula 1 Rolex Australian Grand Prix 2023')).toBeInTheDocument();
  });

  it('handles different championship standings correctly', () => {
    const standings = ['1st', '2nd', '3rd', '4th', '5th', '10th', '20th'];
    
    standings.forEach(standing => {
      const driver = {
        ...mockDriver,
        championshipStanding: standing
      };
      
      const { unmount } = renderWithChakra(<KeyInfoBar driver={driver} />);
      expect(screen.getByText(standing)).toBeInTheDocument();
      unmount();
    });
  });

  it('maintains proper component structure', () => {
    const { container } = renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    // Check main container exists
    const mainContainer = container.firstChild;
    expect(mainContainer).toBeInTheDocument();
    
    // Check team logo section exists
    expect(screen.getByTestId('team-logo-red-bull-racing')).toBeInTheDocument();
    
    // Check stats section exists
    expect(screen.getByText('Career Stats')).toBeInTheDocument();
  });

  it('renders all InfoBlock components with correct structure', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    // Each InfoBlock should have an icon and text content
    const icons = screen.getAllByTestId(/icon$/);
    expect(icons).toHaveLength(5); // Calendar, Trophy, Medal, Trophy (for standing), TrendingUp
    
    // Check that all values are displayed
    const values = ['2015', '19', '22', '454', '1st'];
    values.forEach(value => {
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });

  it('handles edge case with minimal data', () => {
    const minimalDriver = {
      teamName: 'Haas',
      championshipStanding: '0',
      points: 0,
      wins: 0,
      podiums: 0,
      firstRace: {
        year: '0',
        event: 'Test Event'
      }
    };

    renderWithChakra(<KeyInfoBar driver={minimalDriver} />);
    
    expect(screen.getByTestId('team-logo-haas')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(5); // year, points, wins, podiums, standing
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('handles special characters in team names', () => {
    const driverWithSpecialChars = {
      teamName: 'RB F1 Team (AlphaTauri)',
      championshipStanding: '8th',
      points: 25,
      wins: 0,
      podiums: 1,
      firstRace: {
        year: '2020',
        event: 'Austrian Grand Prix'
      }
    };

    renderWithChakra(<KeyInfoBar driver={driverWithSpecialChars} />);
    
    expect(screen.getByTestId('team-logo-rb-f1-team-(alphatauri)')).toBeInTheDocument();
    expect(screen.getByText('RB F1 Team (AlphaTauri) Logo')).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    expect(screen.getByText('Red Bull Racing Logo')).toBeInTheDocument();
    expect(screen.getByText('454')).toBeInTheDocument();
    
    rerender(<KeyInfoBar driver={mockDriver} />);
    
    expect(screen.getByText('Red Bull Racing Logo')).toBeInTheDocument();
    expect(screen.getByText('454')).toBeInTheDocument();
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    expect(screen.getByText('Career Stats')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Career Stats')).not.toBeInTheDocument();
  });

  it('displays correct number of stat blocks', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    // Should have exactly 5 stat blocks: First Race, Wins, Podiums, Points, Standing
    const statLabels = ['First Race', 'Wins', 'Podiums', 'Points', 'Standing'];
    statLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('handles large numbers correctly', () => {
    const driverWithLargeNumbers = {
      teamName: 'Mercedes',
      championshipStanding: '1st',
      points: 7654321,
      wins: 999,
      podiums: 1500,
      firstRace: {
        year: '1950',
        event: 'British Grand Prix'
      }
    };

    renderWithChakra(<KeyInfoBar driver={driverWithLargeNumbers} />);
    
    expect(screen.getByText('7654321')).toBeInTheDocument();
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('1950')).toBeInTheDocument();
  });

  it('renders all required icons for each stat', () => {
    renderWithChakra(<KeyInfoBar driver={mockDriver} />);
    
    // First Race should have Calendar icon
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    
    // Wins should have Trophy icon
    const trophyIcons = screen.getAllByTestId('trophy-icon');
    expect(trophyIcons.length).toBeGreaterThanOrEqual(1);
    
    // Podiums should have Medal icon
    expect(screen.getByTestId('medal-icon')).toBeInTheDocument();
    
    // Points should have TrendingUp icon
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    
    // Standing should have Trophy icon (second trophy)
    expect(trophyIcons).toHaveLength(2); // One for wins, one for standing
  });
});
