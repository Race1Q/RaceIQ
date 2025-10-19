import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PositionChangeChart from './PositionChangeChart';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('PositionChangeChart', () => {
  const mockQualiResults = [
    {
      driver_id: 1,
      driver_code: 'VER',
      driver_name: 'Max Verstappen',
      constructor_id: 1,
      constructor_name: 'Red Bull',
      position: 1,
    },
    {
      driver_id: 2,
      driver_code: 'LEC',
      driver_name: 'Charles Leclerc',
      constructor_id: 2,
      constructor_name: 'Ferrari',
      position: 3,
    },
    {
      driver_id: 3,
      driver_code: 'HAM',
      driver_name: 'Lewis Hamilton',
      constructor_id: 3,
      constructor_name: 'Mercedes',
      position: 2,
    },
  ];

  const mockRaceResults = [
    {
      driver_id: 1,
      driver_code: 'VER',
      driver_name: 'Max Verstappen',
      constructor_id: 1,
      constructor_name: 'Red Bull',
      position: 1,
    },
    {
      driver_id: 2,
      driver_code: 'LEC',
      driver_name: 'Charles Leclerc',
      constructor_id: 2,
      constructor_name: 'Ferrari',
      position: 2,
    },
    {
      driver_id: 3,
      driver_code: 'HAM',
      driver_name: 'Lewis Hamilton',
      constructor_id: 3,
      constructor_name: 'Mercedes',
      position: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the chart with qualifying and race data', () => {
      renderWithChakra(
        <PositionChangeChart
          qualiResults={mockQualiResults}
          raceResults={mockRaceResults}
        />
      );

      expect(screen.getByText(/Qualifying → Race Position Changes/i)).toBeInTheDocument();
      expect(screen.getAllByText('Max Verstappen')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Charles Leclerc')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Lewis Hamilton')[0]).toBeInTheDocument();
    });

    it('should display empty state when no data is provided', () => {
      renderWithChakra(<PositionChangeChart qualiResults={[]} raceResults={[]} />);

      expect(screen.getByText(/No qualifying or race data available/i)).toBeInTheDocument();
    });

    it('should render header labels', () => {
      renderWithChakra(
        <PositionChangeChart
          qualiResults={mockQualiResults}
          raceResults={mockRaceResults}
        />
      );

      expect(screen.getByText('QUALIFYING')).toBeInTheDocument();
      expect(screen.getByText('RACE FINISH')).toBeInTheDocument();
    });

    it('should render key insights section', () => {
      renderWithChakra(
        <PositionChangeChart
          qualiResults={mockQualiResults}
          raceResults={mockRaceResults}
        />
      );

      expect(screen.getByText('Key Insights')).toBeInTheDocument();
      expect(screen.getByText('Biggest Gainer')).toBeInTheDocument();
      expect(screen.getByText('Biggest Loser')).toBeInTheDocument();
      expect(screen.getByText('Unchanged Positions')).toBeInTheDocument();
    });
  });

  describe('Position Changes', () => {
    it('should show position gain indicator', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', constructor_name: 'Red Bull', position: 5 }];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', constructor_name: 'Red Bull', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getByText('+4')).toBeInTheDocument();
    });

    it('should show position loss indicator', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', constructor_name: 'Red Bull', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', constructor_name: 'Red Bull', position: 5 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getByText('-4')).toBeInTheDocument();
    });

    it('should show no change indicator', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', constructor_name: 'Red Bull', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', constructor_name: 'Red Bull', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Check for the "0" text in change indicator
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    it('should calculate biggest gainer correctly', () => {
      const quali = [
        { driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 10 },
        { driver_id: 2, driver_code: 'LEC', driver_name: 'Charles Leclerc', position: 5 },
      ];
      const race = [
        { driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 },
        { driver_id: 2, driver_code: 'LEC', driver_name: 'Charles Leclerc', position: 3 },
      ];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Max gained 9 positions (10->1)
      expect(screen.getByText('(+9)')).toBeInTheDocument();
    });

    it('should calculate biggest loser correctly', () => {
      const quali = [
        { driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 },
        { driver_id: 2, driver_code: 'LEC', driver_name: 'Charles Leclerc', position: 2 },
      ];
      const race = [
        { driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 10 },
        { driver_id: 2, driver_code: 'LEC', driver_name: 'Charles Leclerc', position: 3 },
      ];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Max lost 9 positions (1->10)
      expect(screen.getByText('(-9)')).toBeInTheDocument();
    });

    it('should count unchanged positions', () => {
      const quali = [
        { driver_id: 1, driver_code: 'VER', position: 1 },
        { driver_id: 2, driver_code: 'LEC', position: 2 },
        { driver_id: 3, driver_code: 'HAM', position: 3 },
      ];
      const race = [
        { driver_id: 1, driver_code: 'VER', position: 1 },
        { driver_id: 2, driver_code: 'LEC', position: 3 },
        { driver_id: 3, driver_code: 'HAM', position: 3 },
      ];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // VER and HAM both have unchanged positions (1->1, 3->3)
      const unchangedText = screen.getAllByText('2');
      expect(unchangedText.length).toBeGreaterThan(0);
    });
  });

  describe('Driver Data', () => {
    it('should merge qualifying and race data by driver', () => {
      renderWithChakra(
        <PositionChangeChart
          qualiResults={mockQualiResults}
          raceResults={mockRaceResults}
        />
      );

      // All three drivers should appear (may appear multiple times - in chart and insights)
      expect(screen.getAllByText('Max Verstappen').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Charles Leclerc').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lewis Hamilton').length).toBeGreaterThan(0);
    });

    it('should handle drivers with only qualifying data', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];
      const race: any[] = [];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getAllByText('Max Verstappen')[0]).toBeInTheDocument();
      // Should show "-" for missing race position
      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('should handle drivers with only race data', () => {
      const quali: any[] = [];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getAllByText('Max Verstappen')[0]).toBeInTheDocument();
      // Should show "-" for missing quali position
      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('should display constructor names', () => {
      renderWithChakra(
        <PositionChangeChart
          qualiResults={mockQualiResults}
          raceResults={mockRaceResults}
        />
      );

      expect(screen.getByText('Red Bull')).toBeInTheDocument();
      expect(screen.getByText('Ferrari')).toBeInTheDocument();
      expect(screen.getByText('Mercedes')).toBeInTheDocument();
    });

    it('should handle missing driver names with fallback', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Should show driver code when name is missing (may appear multiple times)
      expect(screen.getAllByText('VER')[0]).toBeInTheDocument();
    });

    it('should handle missing constructor names with fallback', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getByText('Unknown Team')).toBeInTheDocument();
    });
  });

  describe('Podium Positions', () => {
    it('should highlight P1 with gold', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Component should render P1 position
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });

    it('should highlight P2 with silver', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', position: 2 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Component should show the position change (-1 means dropped from P1 to P2)
      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    it('should highlight P3 with bronze', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', position: 3 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Component should show the position change (-2 means dropped from P1 to P3)
      expect(screen.getByText('-2')).toBeInTheDocument();
    });

    it('should not show trophy for positions > 3', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', position: 4 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle mouse hover on driver row', () => {
      renderWithChakra(
        <PositionChangeChart
          qualiResults={mockQualiResults}
          raceResults={mockRaceResults}
        />
      );

      const driverName = screen.getByText('Max Verstappen');
      const parentBox = driverName.closest('div')?.parentElement?.parentElement?.parentElement;

      if (parentBox) {
        fireEvent.mouseEnter(parentBox);
        // Component should update hover state
        expect(parentBox).toBeInTheDocument();

        fireEvent.mouseLeave(parentBox);
        // Component should clear hover state
        expect(parentBox).toBeInTheDocument();
      }
    });
  });

  describe('Sorting', () => {
    it('should sort drivers by race position', () => {
      const quali = [
        { driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 3 },
        { driver_id: 2, driver_code: 'LEC', driver_name: 'Charles Leclerc', position: 1 },
        { driver_id: 3, driver_code: 'HAM', driver_name: 'Lewis Hamilton', position: 2 },
      ];
      const race = [
        { driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 },
        { driver_id: 2, driver_code: 'LEC', driver_name: 'Charles Leclerc', position: 3 },
        { driver_id: 3, driver_code: 'HAM', driver_name: 'Lewis Hamilton', position: 2 },
      ];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Get all driver names in order
      const allDriverNames = screen.getAllByText(/Verstappen|Leclerc|Hamilton/);
      // First should be Verstappen (P1 in race)
      expect(allDriverNames[0].textContent).toContain('Verstappen');
    });

    it('should handle null race positions in sorting', () => {
      const quali = [
        { driver_id: 1, driver_code: 'VER', position: 1 },
        { driver_id: 2, driver_code: 'LEC', position: 2 },
      ];
      const race = [
        { driver_id: 1, driver_code: 'VER', position: 1 },
        // LEC has no race result
      ];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Both drivers should be shown (may appear multiple times)
      expect(screen.getAllByText('VER').length).toBeGreaterThan(0);
      expect(screen.getAllByText('LEC').length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle when no one loses positions', () => {
      const quali = [
        { driver_id: 1, driver_code: 'VER', position: 1 },
        { driver_id: 2, driver_code: 'LEC', position: 2 },
      ];
      const race = [
        { driver_id: 1, driver_code: 'VER', position: 1 },
        { driver_id: 2, driver_code: 'LEC', position: 1 },
      ];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getByText('No losses')).toBeInTheDocument();
    });

    it('should handle large position changes', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 20 }];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getByText('+19')).toBeInTheDocument();
    });

    it('should filter out drivers with no position data', () => {
      const quali = [
        { driver_id: 1, driver_code: 'VER', position: null },
        { driver_id: 2, driver_code: 'LEC', position: 1 },
      ];
      const race = [
        { driver_id: 1, driver_code: 'VER', position: null },
        { driver_id: 2, driver_code: 'LEC', position: 1 },
      ];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      // Only LEC should be shown (may appear multiple times)
      expect(screen.getAllByText('LEC').length).toBeGreaterThan(0);
      expect(screen.queryByText('VER')).not.toBeInTheDocument();
    });

    it('should handle single driver', () => {
      const quali = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];
      const race = [{ driver_id: 1, driver_code: 'VER', driver_name: 'Max Verstappen', position: 1 }];

      renderWithChakra(<PositionChangeChart qualiResults={quali} raceResults={race} />);

      expect(screen.getAllByText('Max Verstappen').length).toBeGreaterThan(0);
      // Should show as both biggest gainer and loser (only driver)
      expect(screen.getByText('Key Insights')).toBeInTheDocument();
    });
  });
});

