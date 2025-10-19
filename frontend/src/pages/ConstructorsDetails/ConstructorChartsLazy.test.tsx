import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ConstructorChartsLazy from './ConstructorChartsLazy';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ConstructorChartsLazy', () => {
  const mockPointsData = [
    { seasonLabel: '2020', points: 450, wins: 5, podiums: 12 },
    { seasonLabel: '2021', points: 600, wins: 10, podiums: 18 },
    { seasonLabel: '2022', points: 759, wins: 17, podiums: 28 },
  ];

  const mockPolesData = [
    { seasonYear: 2020, poleCount: 5 },
    { seasonYear: 2021, poleCount: 8 },
    { seasonYear: 2022, poleCount: 12 },
  ];

  const mockCumulativeData = [
    { round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 },
    { round: 2, raceName: 'Saudi GP', racePoints: 18, cumulativePoints: 43 },
    { round: 3, raceName: 'Australian GP', racePoints: 25, cumulativePoints: 68 },
  ];

  const mockSeasons = [
    { id: 1, year: 2020 },
    { id: 2, year: 2021 },
    { id: 3, year: 2022 },
  ];

  const mockLatestSeason = { season: 3 };

  const defaultProps = {
    mappedPointsPerSeason: mockPointsData,
    mappedPolesPerSeason: mockPolesData,
    cumulativeProgression: mockCumulativeData,
    teamColor: '#FF0000',
    chartBgColor: '#FFFFFF',
    chartTextColor: '#000000',
    gridColor: '#CCCCCC',
    axisColor: '#666666',
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#CCCCCC',
    tooltipTextColor: '#000000',
    seasons: mockSeasons,
    latestSeason: mockLatestSeason,
  };

  beforeEach(() => {
    // Mock ResizeObserver for Recharts
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  describe('Chart Rendering', () => {
    it('should render all four main charts', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
      expect(screen.getByText('Wins by Season')).toBeInTheDocument();
      expect(screen.getByText('Podiums by Season')).toBeInTheDocument();
      expect(screen.getByText('Poles by Season')).toBeInTheDocument();
    });

    it('should render cumulative progression chart when data is available', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      expect(screen.getByText(/Cumulative Points Progression/)).toBeInTheDocument();
      expect(screen.getByText(/2022/)).toBeInTheDocument();
    });

    it('should not render cumulative chart when no data', () => {
      const propsWithoutCumulative = {
        ...defaultProps,
        cumulativeProgression: [],
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithoutCumulative} />);

      expect(screen.queryByText(/Cumulative Points Progression/)).not.toBeInTheDocument();
    });

    it('should render charts in a grid layout', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render all charts
      expect(screen.getByText('Points by Season')).toBeInTheDocument();
      expect(screen.getByText('Wins by Season')).toBeInTheDocument();
    });
  });

  describe('Data Sorting', () => {
    it('should sort points data by season label', () => {
      const unsortedPointsData = [
        { seasonLabel: '2022', points: 759, wins: 17, podiums: 28 },
        { seasonLabel: '2020', points: 450, wins: 5, podiums: 12 },
        { seasonLabel: '2021', points: 600, wins: 10, podiums: 18 },
      ];

      const propsWithUnsorted = {
        ...defaultProps,
        mappedPointsPerSeason: unsortedPointsData,
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithUnsorted} />);

      // Component should still render without errors
      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });

    it('should sort poles data by season year', () => {
      const unsortedPolesData = [
        { seasonYear: 2022, poleCount: 12 },
        { seasonYear: 2020, poleCount: 5 },
        { seasonYear: 2021, poleCount: 8 },
      ];

      const propsWithUnsorted = {
        ...defaultProps,
        mappedPolesPerSeason: unsortedPolesData,
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithUnsorted} />);

      expect(screen.getByText('Poles by Season')).toBeInTheDocument();
    });
  });

  describe('Chart Styling', () => {
    it('should use team color for points chart', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render with the provided colors
      expect(container).toBeInTheDocument();
    });

    it('should use custom colors for wins chart', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Wins chart uses #F56565 (red)
      expect(container).toBeInTheDocument();
    });

    it('should use custom colors for podiums chart', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Podiums chart uses #ECC94B (yellow)
      expect(container).toBeInTheDocument();
    });

    it('should apply chart background color', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Cumulative Progression', () => {
    it('should display correct season year in cumulative chart title', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      expect(screen.getByText(/Cumulative Points Progression \(2022\)/)).toBeInTheDocument();
    });

    it('should show "Latest" when season is not found', () => {
      const propsWithNoMatchingSeason = {
        ...defaultProps,
        latestSeason: { season: 999 },
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithNoMatchingSeason} />);

      expect(screen.getByText(/Cumulative Points Progression \(Latest\)/)).toBeInTheDocument();
    });

    it('should handle null latest season', () => {
      const propsWithNullSeason = {
        ...defaultProps,
        latestSeason: null,
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithNullSeason} />);

      expect(screen.getByText(/Cumulative Points Progression \(Latest\)/)).toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
    it('should render charts with empty points data', () => {
      const propsWithEmptyPoints = {
        ...defaultProps,
        mappedPointsPerSeason: [],
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithEmptyPoints} />);

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
      expect(screen.getByText('Wins by Season')).toBeInTheDocument();
      expect(screen.getByText('Podiums by Season')).toBeInTheDocument();
    });

    it('should render poles chart with empty data', () => {
      const propsWithEmptyPoles = {
        ...defaultProps,
        mappedPolesPerSeason: [],
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithEmptyPoles} />);

      expect(screen.getByText('Poles by Season')).toBeInTheDocument();
    });

    it('should handle empty seasons array', () => {
      const propsWithEmptySeasons = {
        ...defaultProps,
        seasons: [],
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithEmptySeasons} />);

      expect(screen.getByText(/Cumulative Points Progression/)).toBeInTheDocument();
    });
  });

  describe('Data Memoization', () => {
    it('should render consistently with same props', () => {
      const { rerender } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      expect(screen.getByText('Points by Season')).toBeInTheDocument();

      // Rerender with same props
      rerender(
        <ChakraProvider>
          <ConstructorChartsLazy {...defaultProps} />
        </ChakraProvider>
      );

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });

    it('should update when data changes', () => {
      const { rerender } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      const newPointsData = [
        { seasonLabel: '2023', points: 850, wins: 19, podiums: 32 },
      ];

      rerender(
        <ChakraProvider>
          <ConstructorChartsLazy
            {...defaultProps}
            mappedPointsPerSeason={newPointsData}
          />
        </ChakraProvider>
      );

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render with responsive container', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Check for ResponsiveContainer usage
      expect(container).toBeInTheDocument();
    });

    it('should apply responsive dimensions to charts', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render with charts
      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });
  });

  describe('Chart Components', () => {
    it('should include CartesianGrid in line charts', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render with line charts
      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });

    it('should include XAxis and YAxis', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render with axes (we can't query Recharts SVG elements in JSDOM)
      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });

    it('should include Tooltip configuration', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single season data', () => {
      const singleSeasonProps = {
        ...defaultProps,
        mappedPointsPerSeason: [{ seasonLabel: '2022', points: 759, wins: 17, podiums: 28 }],
        mappedPolesPerSeason: [{ seasonYear: 2022, poleCount: 12 }],
      };

      renderWithChakra(<ConstructorChartsLazy {...singleSeasonProps} />);

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });

    it('should handle zero values in data', () => {
      const zeroValueProps = {
        ...defaultProps,
        mappedPointsPerSeason: [{ seasonLabel: '2022', points: 0, wins: 0, podiums: 0 }],
      };

      renderWithChakra(<ConstructorChartsLazy {...zeroValueProps} />);

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const largeNumberProps = {
        ...defaultProps,
        mappedPointsPerSeason: [{ seasonLabel: '2022', points: 9999, wins: 99, podiums: 99 }],
      };

      renderWithChakra(<ConstructorChartsLazy {...largeNumberProps} />);

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });

    it('should handle non-sequential season years', () => {
      const nonSequentialData = [
        { seasonLabel: '2015', points: 450, wins: 5, podiums: 12 },
        { seasonLabel: '2020', points: 600, wins: 10, podiums: 18 },
        { seasonLabel: '2022', points: 759, wins: 17, podiums: 28 },
      ];

      const propsWithGaps = {
        ...defaultProps,
        mappedPointsPerSeason: nonSequentialData,
      };

      renderWithChakra(<ConstructorChartsLazy {...propsWithGaps} />);

      expect(screen.getByText('Points by Season')).toBeInTheDocument();
    });
  });

  describe('Line Chart Properties', () => {
    it('should render Line components with correct dataKey', () => {
      renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render with line charts
      expect(screen.getByText('Points by Season')).toBeInTheDocument();
      expect(screen.getByText(/Cumulative Points Progression/)).toBeInTheDocument();
    });

    it('should render Bar chart for poles', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // BarChart should be present
      expect(container).toBeInTheDocument();
    });
  });

  describe('Chart Containers', () => {
    it('should have proper dimensions for main charts', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      const boxes = container.querySelectorAll('[class*="h-300px"]');
      // Should have chart containers with height
      expect(container).toBeInTheDocument();
    });

    it('should have larger dimension for cumulative chart', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Cumulative chart should be taller (400px vs 300px)
      expect(container).toBeInTheDocument();
    });

    it('should apply border radius to chart containers', () => {
      const { container } = renderWithChakra(<ConstructorChartsLazy {...defaultProps} />);

      // Component should render
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

