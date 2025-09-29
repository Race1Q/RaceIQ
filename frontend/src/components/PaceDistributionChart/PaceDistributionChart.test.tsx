import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PaceDistributionChart from './PaceDistributionChart';

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children, data, margin }: any) => (
    <div 
      data-testid="bar-chart"
      data-chart-data={JSON.stringify(data)}
      data-margin={JSON.stringify(margin)}
    >
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, radius }: any) => (
    <div 
      data-testid="bar"
      data-data-key={dataKey}
      data-fill={fill}
      data-radius={JSON.stringify(radius)}
    />
  ),
  XAxis: ({ dataKey, tick, fontSize }: any) => (
    <div 
      data-testid="x-axis"
      data-data-key={dataKey}
      data-tick={JSON.stringify(tick)}
      data-font-size={fontSize}
    />
  ),
  YAxis: ({ tick, fontSize }: any) => (
    <div 
      data-testid="y-axis"
      data-tick={JSON.stringify(tick)}
      data-font-size={fontSize}
    />
  ),
  CartesianGrid: ({ strokeDasharray, stroke }: any) => (
    <div 
      data-testid="cartesian-grid"
      data-stroke-dasharray={strokeDasharray}
      data-stroke={stroke}
    />
  ),
  Tooltip: ({ content }: any) => (
    <div data-testid="tooltip" data-content={content ? 'custom' : 'default'} />
  ),
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div 
      data-testid="responsive-container"
      data-width={width}
      data-height={height}
    >
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

describe('PaceDistributionChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const testData = [1.25, 1.30, 1.28, 1.32, 1.27];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    expect(screen.getByText('Pace Distribution')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders with correct title', () => {
    const testData = [1.25, 1.30, 1.28];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const title = screen.getByText('Pace Distribution');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
  });

  it('renders chart components correctly', () => {
    const testData = [1.25, 1.30, 1.28];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('transforms data correctly', () => {
    const testData = [1.25, 1.30, 1.28];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(3);
    expect(chartData[0]).toEqual({
      lap: 1,
      time: 1.25,
      formattedTime: '1:15.000'
    });
    expect(chartData[1]).toEqual({
      lap: 2,
      time: 1.30,
      formattedTime: '1:18.000'
    });
    expect(chartData[2]).toEqual({
      lap: 3,
      time: 1.28,
      formattedTime: '1:16.800'
    });
  });

  it('handles empty data array', () => {
    renderWithChakra(<PaceDistributionChart data={[]} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(0);
  });

  it('handles single data point', () => {
    const testData = [1.25];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(1);
    expect(chartData[0]).toEqual({
      lap: 1,
      time: 1.25,
      formattedTime: '1:15.000'
    });
  });

  it('handles large dataset', () => {
    const testData = Array.from({ length: 50 }, (_, i) => 1.25 + (i * 0.01));
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(50);
    expect(chartData[0].lap).toBe(1);
    expect(chartData[49].lap).toBe(50);
  });

  it('formats time correctly for different values', () => {
    const testData = [1.0, 1.5, 2.25, 0.75];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData[0].formattedTime).toBe('1:00.000');
    expect(chartData[1].formattedTime).toBe('1:30.000');
    expect(chartData[2].formattedTime).toBe('2:15.000');
    expect(chartData[3].formattedTime).toBe('0:45.000');
  });

  it('sets correct chart properties', () => {
    const testData = [1.25, 1.30];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const margin = JSON.parse(barChart.getAttribute('data-margin') || '{}');
    
    expect(margin).toEqual({
      top: 20,
      right: 30,
      left: 20,
      bottom: 5
    });
  });

  it('configures bar properties correctly', () => {
    const testData = [1.25, 1.30];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const bar = screen.getByTestId('bar');
    
    expect(bar.getAttribute('data-data-key')).toBe('time');
    expect(bar.getAttribute('data-fill')).toBe('brand.red');
    expect(bar.getAttribute('data-radius')).toBe('[4,4,0,0]');
  });

  it('configures axes correctly', () => {
    const testData = [1.25, 1.30];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const xAxis = screen.getByTestId('x-axis');
    const yAxis = screen.getByTestId('y-axis');
    
    expect(xAxis.getAttribute('data-data-key')).toBe('lap');
    expect(xAxis.getAttribute('data-font-size')).toBe('12');
    
    expect(yAxis.getAttribute('data-font-size')).toBe('12');
  });

  it('configures grid correctly', () => {
    const testData = [1.25, 1.30];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const grid = screen.getByTestId('cartesian-grid');
    
    expect(grid.getAttribute('data-stroke-dasharray')).toBe('3 3');
    expect(grid.getAttribute('data-stroke')).toBe('border-primary');
  });

  it('uses custom tooltip', () => {
    const testData = [1.25, 1.30];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const tooltip = screen.getByTestId('tooltip');
    
    expect(tooltip.getAttribute('data-content')).toBe('custom');
  });

  it('configures responsive container correctly', () => {
    const testData = [1.25, 1.30];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const container = screen.getByTestId('responsive-container');
    
    expect(container.getAttribute('data-width')).toBe('100%');
    expect(container.getAttribute('data-height')).toBe('100%');
  });

  it('handles decimal time values correctly', () => {
    const testData = [1.123456, 1.987654];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData[0].formattedTime).toBe('1:07.407');
    expect(chartData[1].formattedTime).toBe('1:59.259');
  });

  it('handles zero time values', () => {
    const testData = [0, 0.5, 1.0];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData[0].formattedTime).toBe('0:00.000');
    expect(chartData[1].formattedTime).toBe('0:30.000');
    expect(chartData[2].formattedTime).toBe('1:00.000');
  });

  it('handles very large time values', () => {
    const testData = [10.5, 15.75, 20.0];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    expect(chartData[0].formattedTime).toBe('10:30.000');
    expect(chartData[1].formattedTime).toBe('15:45.000');
    expect(chartData[2].formattedTime).toBe('20:00.000');
  });

  it('maintains data integrity through transformation', () => {
    const testData = [1.25, 1.30, 1.28, 1.32, 1.27];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    // Check that original time values are preserved
    expect(chartData[0].time).toBe(1.25);
    expect(chartData[1].time).toBe(1.30);
    expect(chartData[2].time).toBe(1.28);
    expect(chartData[3].time).toBe(1.32);
    expect(chartData[4].time).toBe(1.27);
    
    // Check that lap numbers are sequential
    expect(chartData[0].lap).toBe(1);
    expect(chartData[1].lap).toBe(2);
    expect(chartData[2].lap).toBe(3);
    expect(chartData[3].lap).toBe(4);
    expect(chartData[4].lap).toBe(5);
  });

  it('renders with proper styling classes', () => {
    const testData = [1.25, 1.30];
    const { container } = renderWithChakra(<PaceDistributionChart data={testData} />);
    
    // Check for VStack container
    const vStack = container.querySelector('[data-testid="responsive-container"]')?.parentElement;
    expect(vStack).toBeInTheDocument();
  });

  it('handles negative time values', () => {
    const testData = [-1.25, 0, 1.25];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    // The component's formatting logic: Math.floor(-1.25) = -2, (-1.25 % 1) * 60 = -15
    expect(chartData[0].formattedTime).toBe('-2:-15.000');
    expect(chartData[1].formattedTime).toBe('0:00.000');
    expect(chartData[2].formattedTime).toBe('1:15.000');
  });

  it('handles very small decimal values', () => {
    const testData = [0.001, 0.01, 0.1];
    renderWithChakra(<PaceDistributionChart data={testData} />);
    
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
    
    // The component's formatting logic: (0.001 % 1) * 60 = 0.001 * 60 = 0.06
    expect(chartData[0].formattedTime).toBe('0:00.060');
    expect(chartData[1].formattedTime).toBe('0:00.600');
    expect(chartData[2].formattedTime).toBe('0:06.000');
  });
});
