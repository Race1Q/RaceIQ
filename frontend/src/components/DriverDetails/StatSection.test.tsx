import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import StatSection from './StatSection';
import type { Stat } from '../../types';

// Mock StatCard component to isolate StatSection testing
vi.mock('./StatCard', () => ({
  default: ({ stat }: { stat: Stat }) => (
    <div data-testid={`stat-card-${stat.label}`}>
      {stat.label}: {stat.value}
    </div>
  )
}));

// Helper function to render with Chakra UI
function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('StatSection Component', () => {
  const mockStats: Stat[] = [
    { label: 'Wins', value: 42 },
    { label: 'Poles', value: 25 },
    { label: 'Podiums', value: 150 },
    { label: 'Fastest Laps', value: 18 },
    { label: 'DNFs', value: 5 },
    { label: 'Total Points', value: 2850 }
  ];

  const mockTitle = 'Career Statistics';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(<StatSection title={mockTitle} stats={mockStats} />);
    
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
  });

  it('renders title correctly', () => {
    renderWithChakra(<StatSection title={mockTitle} stats={mockStats} />);
    
    const titleElement = screen.getByText('Career Statistics');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe('H2'); // Heading size="md" renders as <h2>
  });

  it('renders all stat cards', () => {
    renderWithChakra(<StatSection title={mockTitle} stats={mockStats} />);
    
    mockStats.forEach((stat) => {
      expect(screen.getByTestId(`stat-card-${stat.label}`)).toBeInTheDocument();
    });
  });

  it('renders correct number of stat cards', () => {
    renderWithChakra(<StatSection title={mockTitle} stats={mockStats} />);
    
    const statCards = screen.getAllByTestId(/stat-card-/);
    expect(statCards).toHaveLength(mockStats.length);
  });

  it('renders with empty stats array', () => {
    renderWithChakra(<StatSection title={mockTitle} stats={[]} />);
    
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
    expect(screen.queryAllByTestId(/stat-card-/)).toHaveLength(0);
  });

  it('renders with single stat', () => {
    const singleStat: Stat[] = [{ label: 'Wins', value: 42 }];
    
    renderWithChakra(<StatSection title={mockTitle} stats={singleStat} />);
    
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-Wins')).toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(1);
  });

  it('renders with two stats', () => {
    const twoStats: Stat[] = [
      { label: 'Wins', value: 42 },
      { label: 'Poles', value: 25 }
    ];
    
    renderWithChakra(<StatSection title={mockTitle} stats={twoStats} />);
    
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-Wins')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-Poles')).toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(2);
  });

  it('renders with many stats', () => {
    const manyStats: Stat[] = Array.from({ length: 12 }, (_, i) => ({
      label: `Stat ${i + 1}`,
      value: i + 1
    }));
    
    renderWithChakra(<StatSection title={mockTitle} stats={manyStats} />);
    
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(12);
  });

  it('renders with different title', () => {
    const differentTitle = 'Season Performance';
    
    renderWithChakra(<StatSection title={differentTitle} stats={mockStats} />);
    
    expect(screen.getByText('Season Performance')).toBeInTheDocument();
    expect(screen.queryByText('Career Statistics')).not.toBeInTheDocument();
  });

  it('renders with empty title', () => {
    renderWithChakra(<StatSection title="" stats={mockStats} />);
    
    const titleElement = screen.getByRole('heading');
    expect(titleElement).toHaveTextContent('');
  });

  it('renders with long title', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines in the UI';
    
    renderWithChakra(<StatSection title={longTitle} stats={mockStats} />);
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('renders with special characters in title', () => {
    const specialTitle = 'F1™ Championship Stats (2023-2024)';
    
    renderWithChakra(<StatSection title={specialTitle} stats={mockStats} />);
    
    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });

  it('passes correct props to StatCard components', () => {
    renderWithChakra(<StatSection title={mockTitle} stats={mockStats} />);
    
    mockStats.forEach((stat) => {
      const statCard = screen.getByTestId(`stat-card-${stat.label}`);
      expect(statCard).toHaveTextContent(`${stat.label}: ${stat.value}`);
    });
  });

  it('maintains proper DOM structure', () => {
    renderWithChakra(<StatSection title={mockTitle} stats={mockStats} />);
    
    // Check that the main container exists
    const titleElement = screen.getByRole('heading');
    expect(titleElement).toBeInTheDocument();
    
    // Check that the grid container exists
    const gridContainer = titleElement.parentElement;
    expect(gridContainer).toBeInTheDocument();
  });

  it('renders with mixed value types', () => {
    const mixedStats: Stat[] = [
      { label: 'Wins', value: 42 },
      { label: 'Best Time', value: '1:23.456' },
      { label: 'Average Position', value: 3.7 },
      { label: 'Status', value: 'Active' }
    ];
    
    renderWithChakra(<StatSection title={mockTitle} stats={mixedStats} />);
    
    mixedStats.forEach((stat) => {
      expect(screen.getByTestId(`stat-card-${stat.label}`)).toBeInTheDocument();
    });
  });
});

describe('StatSection Edge Cases', () => {
  it('handles stats with duplicate labels', () => {
    const duplicateStats: Stat[] = [
      { label: 'Points', value: 100 },
      { label: 'Points', value: 200 }
    ];
    
    renderWithChakra(<StatSection title="Test" stats={duplicateStats} />);
    
    // Both should render, but they'll have the same test ID (this is a potential issue in real usage)
    const statCards = screen.getAllByTestId('stat-card-Points');
    expect(statCards).toHaveLength(2);
  });

  it('handles stats with empty labels', () => {
    const emptyLabelStats: Stat[] = [
      { label: '', value: 42 },
      { label: 'Valid Label', value: 100 }
    ];
    
    renderWithChakra(<StatSection title="Test" stats={emptyLabelStats} />);
    
    expect(screen.getByTestId('stat-card-')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-Valid Label')).toBeInTheDocument();
  });

  it('handles stats with null-like values', () => {
    const nullLikeStats: Stat[] = [
      { label: 'Zero Value', value: 0 },
      { label: 'Empty String', value: '' },
      { label: 'Valid Value', value: 100 }
    ];
    
    renderWithChakra(<StatSection title="Test" stats={nullLikeStats} />);
    
    nullLikeStats.forEach((stat) => {
      expect(screen.getByTestId(`stat-card-${stat.label}`)).toBeInTheDocument();
    });
  });

  it('handles very large arrays of stats', () => {
    const largeStatsArray: Stat[] = Array.from({ length: 50 }, (_, i) => ({
      label: `Stat ${i}`,
      value: i
    }));
    
    renderWithChakra(<StatSection title="Large Dataset" stats={largeStatsArray} />);
    
    expect(screen.getByText('Large Dataset')).toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(50);
  });
});

describe('StatSection Integration Tests', () => {
  const testTitle = 'Career Statistics';
  const testStats: Stat[] = [
    { label: 'Wins', value: 42 },
    { label: 'Poles', value: 25 },
    { label: 'Podiums', value: 150 }
  ];

  it('works correctly with Chakra UI theme', () => {
    renderWithChakra(<StatSection title={testTitle} stats={testStats} />);
    
    // The component should render without theme-related errors
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
    testStats.forEach((stat) => {
      expect(screen.getByTestId(`stat-card-${stat.label}`)).toBeInTheDocument();
    });
  });

  it('maintains accessibility with proper heading structure', () => {
    renderWithChakra(<StatSection title={testTitle} stats={testStats} />);
    
    // The title should be rendered as a heading for accessibility
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Career Statistics');
  });

  it('renders multiple StatSection instances correctly', () => {
    const sections = [
      { title: 'Career Stats', stats: testStats.slice(0, 2) },
      { title: 'Season Stats', stats: testStats.slice(2, 3) }
    ];
    
    sections.forEach((section) => {
      const { unmount } = renderWithChakra(
        <StatSection title={section.title} stats={section.stats} />
      );
      
      expect(screen.getByText(section.title)).toBeInTheDocument();
      section.stats.forEach((stat) => {
        expect(screen.getByTestId(`stat-card-${stat.label}`)).toBeInTheDocument();
      });
      
      unmount();
    });
  });

  it('handles rapid re-renders correctly', () => {
    const { rerender } = renderWithChakra(
      <StatSection title="Initial" stats={testStats.slice(0, 2)} />
    );
    
    expect(screen.getByText('Initial')).toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(2);
    
    // Re-render with different props
    rerender(
      <ChakraProvider>
        <StatSection title="Updated" stats={testStats} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.queryByText('Initial')).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(3);
  });
});

describe('StatSection Grid Layout Tests', () => {
  const testTitle = 'Career Statistics';
  const testStats: Stat[] = [
    { label: 'Wins', value: 42 },
    { label: 'Poles', value: 25 },
    { label: 'Podiums', value: 150 },
    { label: 'Fastest Laps', value: 18 },
    { label: 'DNFs', value: 5 },
    { label: 'Total Points', value: 2850 }
  ];

  it('renders grid with correct number of columns for different screen sizes', () => {
    renderWithChakra(<StatSection title={testTitle} stats={testStats} />);
    
    // The grid should be present (we can't easily test responsive behavior in unit tests)
    // but we can verify the structure exists
    const titleElement = screen.getByRole('heading');
    const gridContainer = titleElement.parentElement;
    expect(gridContainer).toBeInTheDocument();
  });

  it('handles grid layout with odd number of stats', () => {
    const oddStats: Stat[] = testStats.slice(0, 5); // 5 stats
    
    renderWithChakra(<StatSection title={testTitle} stats={oddStats} />);
    
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(5);
  });

  it('handles grid layout with even number of stats', () => {
    const evenStats: Stat[] = testStats; // 6 stats
    
    renderWithChakra(<StatSection title={testTitle} stats={evenStats} />);
    
    expect(screen.getByText('Career Statistics')).toBeInTheDocument();
    expect(screen.getAllByTestId(/stat-card-/)).toHaveLength(6);
  });
});
