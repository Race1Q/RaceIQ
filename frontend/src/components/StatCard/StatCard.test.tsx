import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import StatCard from './StatCard';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useUserProfile
vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    favoriteDriver: null,
    favoriteConstructor: null,
    loading: false,
    error: null,
  }),
}));

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
}

// Mock icon component for testing
const MockIcon = () => <div data-testid="mock-icon">Icon</div>;

describe('StatCard', () => {
  const defaultProps = {
    icon: MockIcon,
    label: 'Test Label',
    value: '42',
  };

  it('renders without crashing', () => {
    renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders all required props', () => {
    renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    const color = '#FF0000';
    renderWithChakra(<StatCard {...defaultProps} color={color} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with default color when not provided', () => {
    renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with different icon types', () => {
    const AnotherIcon = () => <div data-testid="another-icon">Another Icon</div>;
    renderWithChakra(<StatCard {...defaultProps} icon={AnotherIcon} />);
    
    expect(screen.getByTestId('another-icon')).toBeInTheDocument();
  });

  it('renders with different label values', () => {
    const labels = ['Wins', 'Podiums', 'Poles', 'Championship'];
    
    labels.forEach((label) => {
      const { unmount } = renderWithChakra(<StatCard {...defaultProps} label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with different value types - strings', () => {
    const values = ['100', 'N/A', '1st', '42'];
    
    values.forEach((value) => {
      const { unmount } = renderWithChakra(<StatCard {...defaultProps} value={value} />);
      expect(screen.getByText(value)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with different value types - numbers', () => {
    const values = [0, 1, 42, 100, 999];
    
    values.forEach((value) => {
      const { unmount } = renderWithChakra(<StatCard {...defaultProps} value={value} />);
      expect(screen.getByText(value.toString())).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with long text content', () => {
    const longLabel = 'This is a very long label that should still render correctly';
    const longValue = 'Very Long Value Text';
    
    renderWithChakra(<StatCard {...defaultProps} label={longLabel} value={longValue} />);
    
    expect(screen.getByText(longLabel)).toBeInTheDocument();
    expect(screen.getByText(longValue)).toBeInTheDocument();
  });

  it('renders with special characters', () => {
    const specialLabel = 'Wins & Losses';
    const specialValue = '42 / 100';
    
    renderWithChakra(<StatCard {...defaultProps} label={specialLabel} value={specialValue} />);
    
    expect(screen.getByText(specialLabel)).toBeInTheDocument();
    expect(screen.getByText(specialValue)).toBeInTheDocument();
  });

  it('renders with unicode characters', () => {
    const unicodeLabel = 'Victóires';
    const unicodeValue = '№ 1';
    
    renderWithChakra(<StatCard {...defaultProps} label={unicodeLabel} value={unicodeValue} />);
    
    expect(screen.getByText(unicodeLabel)).toBeInTheDocument();
    expect(screen.getByText(unicodeValue)).toBeInTheDocument();
  });

  it('handles empty strings gracefully', () => {
    renderWithChakra(<StatCard {...defaultProps} label="" value="" />);
    
    // Component should render even with empty strings
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders with numeric values as strings', () => {
    renderWithChakra(<StatCard {...defaultProps} value="123" />);
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders with decimal values', () => {
    renderWithChakra(<StatCard {...defaultProps} value="42.5" />);
    expect(screen.getByText('42.5')).toBeInTheDocument();
  });

  it('renders with percentage values', () => {
    renderWithChakra(<StatCard {...defaultProps} value="95%" />);
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders with time values', () => {
    renderWithChakra(<StatCard {...defaultProps} value="1:23.456" />);
    expect(screen.getByText('1:23.456')).toBeInTheDocument();
  });

  it('handles multiple instances', () => {
    renderWithChakra(
      <div>
        <StatCard {...defaultProps} label="Stat 1" value="10" />
        <StatCard {...defaultProps} label="Stat 2" value="20" />
        <StatCard {...defaultProps} label="Stat 3" value="30" />
      </div>
    );
    
    expect(screen.getByText('Stat 1')).toBeInTheDocument();
    expect(screen.getByText('Stat 2')).toBeInTheDocument();
    expect(screen.getByText('Stat 3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <StatCard {...defaultProps} />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    unmount();
    
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    
    renderWithChakra(<StatCard {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with different colors', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500'];
    
    colors.forEach((color) => {
      const { unmount } = renderWithChakra(<StatCard {...defaultProps} color={color} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with complex icon components', () => {
    const ComplexIcon = () => (
      <div data-testid="complex-icon">
        <span>Complex</span>
      </div>
    );
    
    renderWithChakra(<StatCard {...defaultProps} icon={ComplexIcon} />);
    expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
  });

  it('renders with HTML entities in text', () => {
    renderWithChakra(<StatCard {...defaultProps} label="Wins & Losses" value="10 > 5" />);
    
    expect(screen.getByText('Wins & Losses')).toBeInTheDocument();
    expect(screen.getByText('10 > 5')).toBeInTheDocument();
  });

  it('renders with zero values', () => {
    renderWithChakra(<StatCard {...defaultProps} value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders with negative values', () => {
    renderWithChakra(<StatCard {...defaultProps} value="-5" />);
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('renders with very large numbers', () => {
    renderWithChakra(<StatCard {...defaultProps} value="9999999" />);
    expect(screen.getByText('9999999')).toBeInTheDocument();
  });

  it('maintains performance with many instances', () => {
    const startTime = performance.now();
    
    renderWithChakra(
      <div>
        {Array.from({ length: 20 }, (_, i) => (
          <StatCard key={i} {...defaultProps} label={`Stat ${i}`} value={i.toString()} />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render reasonably quickly (less than 2000ms for 20 instances)
    expect(renderTime).toBeLessThan(6000);
  });

  it('renders with different prop combinations', () => {
    const combinations = [
      { label: 'Wins', value: '10', color: '#FF0000' },
      { label: 'Podiums', value: '25', color: '#00FF00' },
      { label: 'Poles', value: '5' },
    ];
    
    combinations.forEach(({ label, value, color }) => {
      const { unmount } = renderWithChakra(
        <StatCard icon={MockIcon} label={label} value={value} color={color} />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders without crashing with minimal props', () => {
    renderWithChakra(<StatCard icon={MockIcon} label="Label" value="Value" />);
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('handles undefined color gracefully', () => {
    renderWithChakra(<StatCard {...defaultProps} color={undefined} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });
});
