import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import LapByLapChart from './LapByLapChart';

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, data, className }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} className={className}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, strokeWidth, dot, activeDot, className }: any) => (
    <div 
      data-testid="line"
      data-data-key={dataKey}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-dot={JSON.stringify(dot)}
      data-active-dot={JSON.stringify(activeDot)}
      className={className}
    />
  ),
  XAxis: ({ dataKey, className, tick }: any) => (
    <div data-testid="x-axis" data-data-key={dataKey} className={className} data-tick={JSON.stringify(tick)} />
  ),
  YAxis: ({ className, tick, reversed }: any) => (
    <div data-testid="y-axis" className={className} data-tick={JSON.stringify(tick)} data-reversed={reversed} />
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

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('LapByLapChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = [
    { lap: 1, position: 3 },
    { lap: 2, position: 2 },
    { lap: 3, position: 1 },
    { lap: 4, position: 1 },
    { lap: 5, position: 2 },
    { lap: 6, position: 3 }
  ];

  it('renders without crashing', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    expect(screen.getByText('Race Position')).toBeInTheDocument();
  });

  it('renders the chart title correctly', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    expect(screen.getByText('Race Position')).toBeInTheDocument();
  });

  it('renders ResponsiveContainer with correct dimensions', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const responsiveContainer = screen.getByTestId('responsive-container');
    expect(responsiveContainer).toHaveAttribute('data-width', '100%');
    expect(responsiveContainer).toHaveAttribute('data-height', '300');
  });

  it('renders LineChart with correct data', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(mockData));
  });

  it('renders XAxis with correct dataKey', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const xAxis = screen.getByTestId('x-axis');
    expect(xAxis).toHaveAttribute('data-data-key', 'lap');
  });

  it('renders YAxis with reversed prop', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const yAxis = screen.getByTestId('y-axis');
    expect(yAxis).toHaveAttribute('data-reversed', 'true');
  });

  it('renders Line with correct dataKey and default color', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-data-key', 'position');
    expect(line).toHaveAttribute('data-stroke', 'var(--color-primary-red)');
    expect(line).toHaveAttribute('data-stroke-width', '3');
  });

  it('renders Line with custom team color', () => {
    const teamColor = '#FF0000';
    renderWithChakra(<LapByLapChart data={mockData} teamColor={teamColor} />);
    
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-stroke', teamColor);
  });

  it('renders Line with correct dot configuration', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const line = screen.getByTestId('line');
    const expectedDot = {
      fill: 'var(--color-primary-red)',
      strokeWidth: 2,
      r: 4
    };
    expect(line).toHaveAttribute('data-dot', JSON.stringify(expectedDot));
  });

  it('renders Line with correct activeDot configuration', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const line = screen.getByTestId('line');
    const expectedActiveDot = {
      r: 6,
      stroke: 'var(--color-primary-red)',
      strokeWidth: 2
    };
    expect(line).toHaveAttribute('data-active-dot', JSON.stringify(expectedActiveDot));
  });

  it('renders Line with custom team color in dot and activeDot', () => {
    const teamColor = '#00FF00';
    renderWithChakra(<LapByLapChart data={mockData} teamColor={teamColor} />);
    
    const line = screen.getByTestId('line');
    const expectedDot = {
      fill: teamColor,
      strokeWidth: 2,
      r: 4
    };
    const expectedActiveDot = {
      r: 6,
      stroke: teamColor,
      strokeWidth: 2
    };
    expect(line).toHaveAttribute('data-dot', JSON.stringify(expectedDot));
    expect(line).toHaveAttribute('data-active-dot', JSON.stringify(expectedActiveDot));
  });

  it('renders Tooltip with custom content', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('data-content', 'custom');
  });

  it('handles empty data array', () => {
    renderWithChakra(<LapByLapChart data={[]} />);
    
    expect(screen.getByText('Race Position')).toBeInTheDocument();
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', '[]');
  });

  it('handles single data point', () => {
    const singleData = [{ lap: 1, position: 1 }];
    renderWithChakra(<LapByLapChart data={singleData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(singleData));
  });

  it('handles large datasets', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      lap: i + 1,
      position: Math.floor(Math.random() * 20) + 1
    }));
    
    renderWithChakra(<LapByLapChart data={largeData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(largeData));
  });

  it('handles data with negative positions', () => {
    const negativeData = [
      { lap: 1, position: -1 },
      { lap: 2, position: 0 },
      { lap: 3, position: 1 }
    ];
    
    renderWithChakra(<LapByLapChart data={negativeData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(negativeData));
  });

  it('handles data with decimal positions', () => {
    const decimalData = [
      { lap: 1, position: 1.5 },
      { lap: 2, position: 2.3 },
      { lap: 3, position: 1.8 }
    ];
    
    renderWithChakra(<LapByLapChart data={decimalData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(decimalData));
  });

  it('handles missing teamColor prop', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-stroke', 'var(--color-primary-red)');
  });

  it('handles undefined teamColor', () => {
    renderWithChakra(<LapByLapChart data={mockData} teamColor={undefined} />);
    
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-stroke', 'var(--color-primary-red)');
  });

  it('handles null teamColor', () => {
    renderWithChakra(<LapByLapChart data={mockData} teamColor={null as any} />);
    
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-stroke', 'var(--color-primary-red)');
  });

  it('handles different team colors', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    
    colors.forEach(color => {
      const { unmount } = renderWithChakra(<LapByLapChart data={mockData} teamColor={color} />);
      
      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-stroke', color);
      
      unmount();
    });
  });

  it('handles data with zero lap numbers', () => {
    const zeroLapData = [
      { lap: 0, position: 1 },
      { lap: 1, position: 2 },
      { lap: 2, position: 3 }
    ];
    
    renderWithChakra(<LapByLapChart data={zeroLapData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(zeroLapData));
  });

  it('handles data with very high lap numbers', () => {
    const highLapData = [
      { lap: 1000, position: 1 },
      { lap: 1001, position: 2 },
      { lap: 1002, position: 3 }
    ];
    
    renderWithChakra(<LapByLapChart data={highLapData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(highLapData));
  });

  it('handles data with very high position numbers', () => {
    const highPositionData = [
      { lap: 1, position: 50 },
      { lap: 2, position: 100 },
      { lap: 3, position: 200 }
    ];
    
    renderWithChakra(<LapByLapChart data={highPositionData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(highPositionData));
  });

  it('maintains proper component structure', () => {
    const { container } = renderWithChakra(<LapByLapChart data={mockData} />);
    
    // Check main container exists
    const mainContainer = container.firstChild;
    expect(mainContainer).toBeInTheDocument();
    
    // Check title exists
    expect(screen.getByText('Race Position')).toBeInTheDocument();
    
    // Check chart components exist
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<LapByLapChart data={mockData} />);
    
    expect(screen.getByText('Race Position')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    
    rerender(<LapByLapChart data={mockData} />);
    
    expect(screen.getByText('Race Position')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = renderWithChakra(<LapByLapChart data={mockData} />);
    
    expect(screen.getByText('Race Position')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Race Position')).not.toBeInTheDocument();
  });

  it('handles data with mixed data types', () => {
    const mixedData = [
      { lap: 1, position: 1 },
      { lap: 2, position: 2.5 },
      { lap: 3, position: 1 }
    ];
    
    renderWithChakra(<LapByLapChart data={mixedData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(mixedData));
  });

  it('handles data with duplicate lap numbers', () => {
    const duplicateLapData = [
      { lap: 1, position: 1 },
      { lap: 1, position: 2 },
      { lap: 2, position: 3 }
    ];
    
    renderWithChakra(<LapByLapChart data={duplicateLapData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(duplicateLapData));
  });

  it('handles data with duplicate position numbers', () => {
    const duplicatePositionData = [
      { lap: 1, position: 1 },
      { lap: 2, position: 1 },
      { lap: 3, position: 2 }
    ];
    
    renderWithChakra(<LapByLapChart data={duplicatePositionData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(duplicatePositionData));
  });

  it('handles edge case with minimal data', () => {
    const minimalData = [{ lap: 1, position: 1 }];
    
    renderWithChakra(<LapByLapChart data={minimalData} />);
    
    expect(screen.getByText('Race Position')).toBeInTheDocument();
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(minimalData));
  });

  it('handles data with special characters in numeric values', () => {
    const specialData = [
      { lap: 1, position: 1 },
      { lap: 2, position: Infinity },
      { lap: 3, position: -Infinity }
    ];
    
    renderWithChakra(<LapByLapChart data={specialData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(specialData));
  });

  it('handles data with NaN values', () => {
    const nanData = [
      { lap: 1, position: 1 },
      { lap: 2, position: NaN },
      { lap: 3, position: 2 }
    ];
    
    renderWithChakra(<LapByLapChart data={nanData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(nanData));
  });

  it('handles very long datasets', () => {
    const longData = Array.from({ length: 1000 }, (_, i) => ({
      lap: i + 1,
      position: (i % 20) + 1
    }));
    
    renderWithChakra(<LapByLapChart data={longData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(longData));
  });

  it('handles data updates correctly', () => {
    const initialData = [{ lap: 1, position: 1 }];
    const updatedData = [
      { lap: 1, position: 1 },
      { lap: 2, position: 2 }
    ];
    
    const { rerender } = renderWithChakra(<LapByLapChart data={initialData} />);
    
    let lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(initialData));
    
    rerender(<LapByLapChart data={updatedData} />);
    
    lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(updatedData));
  });

  it('handles team color changes correctly', () => {
    const initialColor = '#FF0000';
    const updatedColor = '#00FF00';
    
    const { rerender } = renderWithChakra(<LapByLapChart data={mockData} teamColor={initialColor} />);
    
    let line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-stroke', initialColor);
    
    rerender(<LapByLapChart data={mockData} teamColor={updatedColor} />);
    
    line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-stroke', updatedColor);
  });

  it('renders all required chart components', () => {
    renderWithChakra(<LapByLapChart data={mockData} />);
    
    // Check all chart components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('handles data with extreme values', () => {
    const extremeData = [
      { lap: Number.MIN_SAFE_INTEGER, position: Number.MAX_SAFE_INTEGER },
      { lap: 0, position: 0 },
      { lap: Number.MAX_SAFE_INTEGER, position: Number.MIN_SAFE_INTEGER }
    ];
    
    renderWithChakra(<LapByLapChart data={extremeData} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(extremeData));
  });
});
