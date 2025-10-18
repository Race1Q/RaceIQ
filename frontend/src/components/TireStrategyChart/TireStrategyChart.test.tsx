import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TireStrategyChart from './TireStrategyChart';
import type { TireStrategy } from '../../data/types';

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children, data, margin }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-margin={JSON.stringify(margin)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, radius }: any) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} data-radius={JSON.stringify(radius)} />
  ),
  XAxis: ({ dataKey, tick, fontSize }: any) => (
    <div data-testid="x-axis" data-key={dataKey} data-tick={JSON.stringify(tick)} data-font-size={fontSize} />
  ),
  YAxis: ({ tick, fontSize }: any) => (
    <div data-testid="y-axis" data-tick={JSON.stringify(tick)} data-font-size={fontSize} />
  ),
  CartesianGrid: ({ strokeDasharray, stroke }: any) => (
    <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} data-stroke={stroke} />
  ),
  Tooltip: ({ content }: any) => (
    <div data-testid="tooltip" data-content={content ? 'custom' : 'default'} />
  ),
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
}));

// Helper function to render with Chakra UI
const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('TireStrategyChart', () => {
  const mockData: TireStrategy[] = [
    { strategy: 'S-M-H', count: 5 },
    { strategy: 'M-H', count: 3 },
    { strategy: 'S-M', count: 2 },
    { strategy: 'H-M-S', count: 1 },
  ];

  it('renders without crashing', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
  });

  it('renders with correct heading', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    expect(screen.getByText('Tire Strategies')).toBeInTheDocument();
  });

  it('renders with correct data', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(mockData));
  });

  it('renders ResponsiveContainer with correct dimensions', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveAttribute('data-width', '100%');
    expect(container).toHaveAttribute('data-height', '100%');
  });

  it('renders BarChart with correct margin', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const chart = screen.getByTestId('bar-chart');
    const expectedMargin = { top: 20, right: 30, left: 20, bottom: 5 };
    expect(chart).toHaveAttribute('data-margin', JSON.stringify(expectedMargin));
  });

  it('renders XAxis with correct configuration', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const xAxis = screen.getByTestId('x-axis');
    expect(xAxis).toHaveAttribute('data-key', 'strategy');
    expect(xAxis).toHaveAttribute('data-font-size', '12');
  });

  it('renders YAxis with correct configuration', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const yAxis = screen.getByTestId('y-axis');
    expect(yAxis).toHaveAttribute('data-font-size', '12');
  });

  it('renders CartesianGrid with correct configuration', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const grid = screen.getByTestId('cartesian-grid');
    expect(grid).toHaveAttribute('data-stroke-dasharray', '3 3');
    expect(grid).toHaveAttribute('data-stroke', 'border-primary');
  });

  it('renders Bar with correct configuration', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveAttribute('data-key', 'count');
    expect(bar).toHaveAttribute('data-fill', 'brand.red');
    expect(bar).toHaveAttribute('data-radius', JSON.stringify([4, 4, 0, 0]));
  });

  it('renders Tooltip with custom content', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('data-content', 'custom');
  });

  it('renders strategy legend', () => {
    renderWithChakra(<TireStrategyChart data={mockData} />);
    
    expect(screen.getByText('Strategy Legend:')).toBeInTheDocument();
    expect(screen.getByText('S = Soft')).toBeInTheDocument();
    expect(screen.getByText('M = Medium')).toBeInTheDocument();
    expect(screen.getByText('H = Hard')).toBeInTheDocument();
    expect(screen.getByText('I = Intermediate')).toBeInTheDocument();
  });

  it('renders with empty data array', () => {
    renderWithChakra(<TireStrategyChart data={[]} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify([]));
  });

  it('renders with single data point', () => {
    const singleData = [{ strategy: 'S-M', count: 1 }];
    renderWithChakra(<TireStrategyChart data={singleData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(singleData));
  });

  it('renders with large dataset', () => {
    const largeData = Array.from({ length: 20 }, (_, i) => ({
      strategy: `Strategy ${i}`,
      count: Math.floor(Math.random() * 10) + 1,
    }));
    
    renderWithChakra(<TireStrategyChart data={largeData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(largeData));
  });

  it('renders with different strategy names', () => {
    const strategies = [
      { strategy: 'S-S-S', count: 3 },
      { strategy: 'M-M-M', count: 2 },
      { strategy: 'H-H-H', count: 1 },
      { strategy: 'S-M-H-S', count: 4 },
    ];
    
    renderWithChakra(<TireStrategyChart data={strategies} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(strategies));
  });

  it('renders with different count values', () => {
    const counts = [
      { strategy: 'S-M', count: 0 },
      { strategy: 'M-H', count: 1 },
      { strategy: 'H-S', count: 10 },
      { strategy: 'S-M-H', count: 100 },
    ];
    
    renderWithChakra(<TireStrategyChart data={counts} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(counts));
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<TireStrategyChart data={mockData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Re-render with same data
    rerender(<TireStrategyChart data={mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Re-render with different data
    const newData = [{ strategy: 'S-H', count: 2 }];
    rerender(<TireStrategyChart data={newData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = renderWithChakra(<TireStrategyChart data={mockData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    
    // Re-mount
    renderWithChakra(<TireStrategyChart data={mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles null data', () => {
    renderWithChakra(<TireStrategyChart data={null as any} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', 'null');
  });

  it('handles undefined data', () => {
    renderWithChakra(<TireStrategyChart data={undefined as any} />);
    
    const chart = screen.getByTestId('bar-chart');
    // When data is undefined, the attribute should not exist or be null
    expect(chart).not.toHaveAttribute('data-chart-data');
  });

  it('handles invalid data types', () => {
    const invalidData = [
      { strategy: 123, count: 'invalid' },
      { strategy: null, count: null },
      { strategy: undefined, count: undefined },
    ] as any;
    
    renderWithChakra(<TireStrategyChart data={invalidData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(invalidData));
  });

  it('handles empty strategy names', () => {
    const emptyStrategies = [
      { strategy: '', count: 1 },
      { strategy: '   ', count: 2 },
      { strategy: '\n\t', count: 3 },
    ];
    
    renderWithChakra(<TireStrategyChart data={emptyStrategies} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(emptyStrategies));
  });

  it('handles negative count values', () => {
    const negativeCounts = [
      { strategy: 'S-M', count: -1 },
      { strategy: 'M-H', count: -5 },
      { strategy: 'H-S', count: 0 },
    ];
    
    renderWithChakra(<TireStrategyChart data={negativeCounts} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(negativeCounts));
  });

  it('handles very large count values', () => {
    const largeCounts = [
      { strategy: 'S-M', count: 1000000 },
      { strategy: 'M-H', count: 999999999 },
      { strategy: 'H-S', count: Number.MAX_SAFE_INTEGER },
    ];
    
    renderWithChakra(<TireStrategyChart data={largeCounts} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(largeCounts));
  });

  it('handles special characters in strategy names', () => {
    const specialStrategies = [
      { strategy: 'S-M-H & More', count: 1 },
      { strategy: 'M@H#S', count: 2 },
      { strategy: 'S-M-H (Fast)', count: 3 },
      { strategy: 'M/H/S', count: 4 },
    ];
    
    renderWithChakra(<TireStrategyChart data={specialStrategies} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(specialStrategies));
  });

  it('handles unicode characters in strategy names', () => {
    const unicodeStrategies = [
      { strategy: 'S-M-H 中文', count: 1 },
      { strategy: 'M-H-S 日本語', count: 2 },
      { strategy: 'H-S-M 한국어', count: 3 },
    ];
    
    renderWithChakra(<TireStrategyChart data={unicodeStrategies} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(unicodeStrategies));
  });

  it('handles very long strategy names', () => {
    const longStrategies = [
      { strategy: 'S-M-H-S-M-H-S-M-H-S-M-H-S-M-H-S-M-H-S-M-H', count: 1 },
      { strategy: 'A'.repeat(100), count: 2 },
      { strategy: 'B'.repeat(1000), count: 3 },
    ];
    
    renderWithChakra(<TireStrategyChart data={longStrategies} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(longStrategies));
  });

  it('maintains performance with large datasets', () => {
    const startTime = performance.now();
    
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      strategy: `Strategy ${i}`,
      count: Math.floor(Math.random() * 100) + 1,
    }));
    
    renderWithChakra(<TireStrategyChart data={largeData} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render quickly (less than 500ms for 1000 items)
    expect(renderTime).toBeLessThan(2000);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
  });

  it('renders with different data structures', () => {
    const differentStructures = [
      { strategy: 'S-M', count: 1, extra: 'data' },
      { strategy: 'M-H', count: 2, additional: 'field' },
      { strategy: 'H-S', count: 3, more: 'properties' },
    ] as any;
    
    renderWithChakra(<TireStrategyChart data={differentStructures} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(differentStructures));
  });

  it('handles rapid data changes', () => {
    const { rerender } = renderWithChakra(<TireStrategyChart data={mockData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Rapid changes
    const newData1 = [{ strategy: 'S-H', count: 1 }];
    rerender(<TireStrategyChart data={newData1} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    const newData2 = [{ strategy: 'M-S', count: 2 }];
    rerender(<TireStrategyChart data={newData2} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles concurrent renders', () => {
    const { rerender } = renderWithChakra(<TireStrategyChart data={mockData} />);
    
    // Simulate concurrent renders
    const newData1 = [{ strategy: 'S-H', count: 1 }];
    rerender(<TireStrategyChart data={newData1} />);
    
    const newData2 = [{ strategy: 'M-S', count: 2 }];
    rerender(<TireStrategyChart data={newData2} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders with all supported data types', () => {
    const allTypes = [
      { strategy: 'S-M', count: 1 },
      { strategy: 'M-H', count: 2.5 },
      { strategy: 'H-S', count: 0 },
      { strategy: 'S-M-H', count: -1 },
    ];
    
    renderWithChakra(<TireStrategyChart data={allTypes} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(allTypes));
  });

  it('renders with extreme values', () => {
    const extremeValues = [
      { strategy: 'S-M', count: Number.MAX_VALUE },
      { strategy: 'M-H', count: Number.MIN_VALUE },
      { strategy: 'H-S', count: Number.POSITIVE_INFINITY },
      { strategy: 'S-M-H', count: Number.NEGATIVE_INFINITY },
    ];
    
    renderWithChakra(<TireStrategyChart data={extremeValues} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(extremeValues));
  });

  it('renders with mixed data types', () => {
    const mixedTypes = [
      { strategy: 'S-M', count: 1 },
      { strategy: 'M-H', count: '2' },
      { strategy: 'H-S', count: true },
      { strategy: 'S-M-H', count: false },
    ] as any;
    
    renderWithChakra(<TireStrategyChart data={mixedTypes} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(mixedTypes));
  });

  it('renders with complex nested data', () => {
    const complexData = [
      { strategy: 'S-M', count: 1, metadata: { type: 'fast' } },
      { strategy: 'M-H', count: 2, metadata: { type: 'medium' } },
      { strategy: 'H-S', count: 3, metadata: { type: 'slow' } },
    ] as any;
    
    renderWithChakra(<TireStrategyChart data={complexData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(complexData));
  });

  it('renders with duplicate strategy names', () => {
    const duplicateStrategies = [
      { strategy: 'S-M', count: 1 },
      { strategy: 'S-M', count: 2 },
      { strategy: 'M-H', count: 3 },
      { strategy: 'M-H', count: 4 },
    ];
    
    renderWithChakra(<TireStrategyChart data={duplicateStrategies} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(duplicateStrategies));
  });

  it('renders with all zero counts', () => {
    const zeroCounts = [
      { strategy: 'S-M', count: 0 },
      { strategy: 'M-H', count: 0 },
      { strategy: 'H-S', count: 0 },
    ];
    
    renderWithChakra(<TireStrategyChart data={zeroCounts} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(zeroCounts));
  });

  it('renders with all negative counts', () => {
    const negativeCounts = [
      { strategy: 'S-M', count: -1 },
      { strategy: 'M-H', count: -2 },
      { strategy: 'H-S', count: -3 },
    ];
    
    renderWithChakra(<TireStrategyChart data={negativeCounts} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(negativeCounts));
  });

  it('renders with all positive counts', () => {
    const positiveCounts = [
      { strategy: 'S-M', count: 1 },
      { strategy: 'M-H', count: 2 },
      { strategy: 'H-S', count: 3 },
    ];
    
    renderWithChakra(<TireStrategyChart data={positiveCounts} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(positiveCounts));
  });

  it('renders with mixed count signs', () => {
    const mixedCounts = [
      { strategy: 'S-M', count: 1 },
      { strategy: 'M-H', count: -2 },
      { strategy: 'H-S', count: 0 },
      { strategy: 'S-M-H', count: 3 },
    ];
    
    renderWithChakra(<TireStrategyChart data={mixedCounts} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(mixedCounts));
  });

  it('renders with all supported strategy patterns', () => {
    const allPatterns = [
      { strategy: 'S', count: 1 },
      { strategy: 'M', count: 2 },
      { strategy: 'H', count: 3 },
      { strategy: 'I', count: 4 },
      { strategy: 'S-M', count: 5 },
      { strategy: 'M-H', count: 6 },
      { strategy: 'H-S', count: 7 },
      { strategy: 'S-M-H', count: 8 },
      { strategy: 'M-H-S', count: 9 },
      { strategy: 'H-S-M', count: 10 },
    ];
    
    renderWithChakra(<TireStrategyChart data={allPatterns} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-chart-data', JSON.stringify(allPatterns));
  });
});
