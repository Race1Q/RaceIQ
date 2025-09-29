import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import StatCard from './StatCard';
import type { Stat } from '../../types';

// Helper function to render with Chakra UI
function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('StatCard Component', () => {
  const mockStat: Stat = {
    label: 'Wins',
    value: 42
  };

  const mockStringStat: Stat = {
    label: 'Fastest Lap',
    value: '1:23.456'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(<StatCard stat={mockStat} />);
    
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders stat label correctly', () => {
    renderWithChakra(<StatCard stat={mockStat} />);
    
    const labelElement = screen.getByText('Wins');
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName).toBe('P'); // Text component renders as <p>
  });

  it('renders stat value correctly', () => {
    renderWithChakra(<StatCard stat={mockStat} />);
    
    const valueElement = screen.getByText('42');
    expect(valueElement).toBeInTheDocument();
    expect(valueElement.tagName).toBe('H2'); // Heading component renders as <h2>
  });

  it('renders string values correctly', () => {
    renderWithChakra(<StatCard stat={mockStringStat} />);
    
    expect(screen.getByText('Fastest Lap')).toBeInTheDocument();
    expect(screen.getByText('1:23.456')).toBeInTheDocument();
  });

  it('renders number values correctly', () => {
    const numberStat: Stat = {
      label: 'Podiums',
      value: 150
    };
    
    renderWithChakra(<StatCard stat={numberStat} />);
    
    expect(screen.getByText('Podiums')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders zero values correctly', () => {
    const zeroStat: Stat = {
      label: 'DNFs',
      value: 0
    };
    
    renderWithChakra(<StatCard stat={zeroStat} />);
    
    expect(screen.getByText('DNFs')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders negative values correctly', () => {
    const negativeStat: Stat = {
      label: 'Points',
      value: -5
    };
    
    renderWithChakra(<StatCard stat={negativeStat} />);
    
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('renders decimal values correctly', () => {
    const decimalStat: Stat = {
      label: 'Average Position',
      value: 3.7
    };
    
    renderWithChakra(<StatCard stat={decimalStat} />);
    
    expect(screen.getByText('Average Position')).toBeInTheDocument();
    expect(screen.getByText('3.7')).toBeInTheDocument();
  });

  it('renders empty string values correctly', () => {
    const emptyStringStat: Stat = {
      label: 'Status',
      value: ''
    };
    
    renderWithChakra(<StatCard stat={emptyStringStat} />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    // Check that the heading element exists but has no text content
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('');
  });

  it('renders long label text correctly', () => {
    const longLabelStat: Stat = {
      label: 'Fastest Lap Time in Qualifying',
      value: 123
    };
    
    renderWithChakra(<StatCard stat={longLabelStat} />);
    
    expect(screen.getByText('Fastest Lap Time in Qualifying')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders long value text correctly', () => {
    const longValueStat: Stat = {
      label: 'Description',
      value: 'This is a very long description that might wrap to multiple lines'
    };
    
    renderWithChakra(<StatCard stat={longValueStat} />);
    
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('This is a very long description that might wrap to multiple lines')).toBeInTheDocument();
  });

  it('renders with special characters in label', () => {
    const specialCharStat: Stat = {
      label: 'Points (2023)',
      value: 456
    };
    
    renderWithChakra(<StatCard stat={specialCharStat} />);
    
    expect(screen.getByText('Points (2023)')).toBeInTheDocument();
    expect(screen.getByText('456')).toBeInTheDocument();
  });

  it('renders with special characters in value', () => {
    const specialCharValueStat: Stat = {
      label: 'Time',
      value: '1:23.456'
    };
    
    renderWithChakra(<StatCard stat={specialCharValueStat} />);
    
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('1:23.456')).toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    renderWithChakra(<StatCard stat={mockStat} />);
    
    // Check that the main container exists
    const container = screen.getByText('Wins').closest('div');
    expect(container).toBeInTheDocument();
    
    // Check that both label and value are present
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('handles different stat objects correctly', () => {
    const stats: Stat[] = [
      { label: 'Wins', value: 42 },
      { label: 'Poles', value: '25' },
      { label: 'Fastest Laps', value: 18 },
      { label: 'DNFs', value: 0 },
      { label: 'Average Finish', value: 3.5 }
    ];
    
    stats.forEach((stat) => {
      const { unmount } = renderWithChakra(<StatCard stat={stat} />);
      
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(String(stat.value))).toBeInTheDocument();
      
      unmount();
    });
  });
});

describe('StatCard Edge Cases', () => {
  it('renders with null-like values', () => {
    const nullValueStat: Stat = {
      label: 'Test',
      value: 0
    };
    
    renderWithChakra(<StatCard stat={nullValueStat} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders with very large numbers', () => {
    const largeNumberStat: Stat = {
      label: 'Total Points',
      value: 999999
    };
    
    renderWithChakra(<StatCard stat={largeNumberStat} />);
    
    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('999999')).toBeInTheDocument();
  });

  it('renders with very small decimal numbers', () => {
    const smallDecimalStat: Stat = {
      label: 'Efficiency',
      value: 0.001
    };
    
    renderWithChakra(<StatCard stat={smallDecimalStat} />);
    
    expect(screen.getByText('Efficiency')).toBeInTheDocument();
    expect(screen.getByText('0.001')).toBeInTheDocument();
  });

  it('renders with unicode characters', () => {
    const unicodeStat: Stat = {
      label: 'F1™ Championship',
      value: '1st'
    };
    
    renderWithChakra(<StatCard stat={unicodeStat} />);
    
    expect(screen.getByText('F1™ Championship')).toBeInTheDocument();
    expect(screen.getByText('1st')).toBeInTheDocument();
  });
});

describe('StatCard Integration Tests', () => {
  const testStat: Stat = {
    label: 'Wins',
    value: 42
  };

  it('works correctly with Chakra UI theme', () => {
    renderWithChakra(<StatCard stat={testStat} />);
    
    // The component should render without theme-related errors
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('maintains accessibility with proper heading structure', () => {
    renderWithChakra(<StatCard stat={testStat} />);
    
    // The value should be rendered as a heading for accessibility
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('42');
  });

  it('renders multiple instances correctly', () => {
    const stats: Stat[] = [
      { label: 'Wins', value: 42 },
      { label: 'Poles', value: 25 },
      { label: 'Podiums', value: 150 }
    ];
    
    stats.forEach((stat) => {
      const { unmount } = renderWithChakra(<StatCard stat={stat} />);
      
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(String(stat.value))).toBeInTheDocument();
      
      unmount();
    });
  });
});
