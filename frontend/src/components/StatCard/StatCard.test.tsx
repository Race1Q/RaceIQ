import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import StatCard from './StatCard';

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

// Mock icon component for testing
const MockIcon = () => <div data-testid="mock-icon">Icon</div>;

describe('StatCard', () => {
  const defaultProps = {
    icon: <MockIcon />,
    label: 'Test Label',
    value: '42',
    description: 'Test description',
  };

  it('renders without crashing', () => {
    renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders all required props', () => {
    renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders with custom team color', () => {
    const teamColor = '#FF0000';
    renderWithChakra(<StatCard {...defaultProps} teamColor={teamColor} />);
    
    const iconContainer = document.querySelector('[class*="iconContainer"]');
    expect(iconContainer).toHaveStyle(`background-color: ${teamColor}`);
  });

  it('renders with default team color when not provided', () => {
    renderWithChakra(<StatCard {...defaultProps} />);
    
    const iconContainer = document.querySelector('[class*="iconContainer"]');
    expect(iconContainer).toHaveStyle('background-color: var(--color-primary-red)');
  });

  it('renders with different icon types', () => {
    const iconVariants = [
      <div key="1">Icon 1</div>,
      <span key="2">Icon 2</span>,
      <MockIcon key="3" />,
    ];

    iconVariants.forEach((icon, index) => {
      const { unmount } = renderWithChakra(
        <StatCard {...defaultProps} icon={icon} />
      );
      
      // Check that the icon content is rendered
      if (index === 2) {
        // MockIcon renders "Icon"
        expect(screen.getByText('Icon')).toBeInTheDocument();
      } else {
        expect(screen.getByText(`Icon ${index + 1}`)).toBeInTheDocument();
      }
      unmount();
    });
  });

  it('renders with different label values', () => {
    const labels = ['Wins', 'Podiums', 'Points', 'Fastest Laps'];
    
    labels.forEach((label) => {
      const { unmount } = renderWithChakra(
        <StatCard {...defaultProps} label={label} />
      );
      
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with different value types', () => {
    const values = ['1', '25', '100', '1.5', '∞'];
    
    values.forEach((value) => {
      const { unmount } = renderWithChakra(
        <StatCard {...defaultProps} value={value} />
      );
      
      expect(screen.getByText(value)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with different descriptions', () => {
    const descriptions = [
      'Total wins this season',
      'Number of podium finishes',
      'Championship points',
      'Average lap time',
    ];
    
    descriptions.forEach((description) => {
      const { unmount } = renderWithChakra(
        <StatCard {...defaultProps} description={description} />
      );
      
      expect(screen.getByText(description)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct CSS classes', () => {
    renderWithChakra(<StatCard {...defaultProps} />);
    
    const card = document.querySelector('[class*="card"]');
    const cardBody = document.querySelector('[class*="cardBody"]');
    const iconContainer = document.querySelector('[class*="iconContainer"]');
    const stat = document.querySelector('[class*="stat"]');
    
    expect(card).toBeInTheDocument();
    expect(cardBody).toBeInTheDocument();
    expect(iconContainer).toBeInTheDocument();
    expect(stat).toBeInTheDocument();
  });

  it('renders with long text content', () => {
    const longProps = {
      ...defaultProps,
      label: 'Very Long Label That Should Still Display Correctly',
      value: '999,999',
      description: 'This is a very long description that should wrap properly and not break the layout of the stat card component.',
    };
    
    renderWithChakra(<StatCard {...longProps} />);
    
    expect(screen.getByText(longProps.label)).toBeInTheDocument();
    expect(screen.getByText(longProps.value)).toBeInTheDocument();
    expect(screen.getByText(longProps.description)).toBeInTheDocument();
  });

  it('renders with special characters', () => {
    const specialProps = {
      ...defaultProps,
      label: 'Wins & Podiums',
      value: '1st',
      description: 'Ranking: #1 (100%)',
    };
    
    renderWithChakra(<StatCard {...specialProps} />);
    
    expect(screen.getByText('Wins & Podiums')).toBeInTheDocument();
    expect(screen.getByText('1st')).toBeInTheDocument();
    expect(screen.getByText('Ranking: #1 (100%)')).toBeInTheDocument();
  });

  it('renders with unicode characters', () => {
    const unicodeProps = {
      ...defaultProps,
      label: '🏆 Wins',
      value: '🥇',
      description: 'First place finishes',
    };
    
    renderWithChakra(<StatCard {...unicodeProps} />);
    
    expect(screen.getByText('🏆 Wins')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('First place finishes')).toBeInTheDocument();
  });

  it('handles empty strings gracefully', () => {
    const emptyProps = {
      ...defaultProps,
      label: '',
      value: '',
      description: '',
    };
    
    renderWithChakra(<StatCard {...emptyProps} />);
    
    // Should render without crashing even with empty strings
    const card = document.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('renders with numeric values as strings', () => {
    const numericProps = {
      ...defaultProps,
      value: '123',
    };
    
    renderWithChakra(<StatCard {...numericProps} />);
    
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders with decimal values', () => {
    const decimalProps = {
      ...defaultProps,
      value: '1.234',
    };
    
    renderWithChakra(<StatCard {...decimalProps} />);
    
    expect(screen.getByText('1.234')).toBeInTheDocument();
  });

  it('renders with percentage values', () => {
    const percentageProps = {
      ...defaultProps,
      value: '95%',
    };
    
    renderWithChakra(<StatCard {...percentageProps} />);
    
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders with time values', () => {
    const timeProps = {
      ...defaultProps,
      value: '1:23.456',
    };
    
    renderWithChakra(<StatCard {...timeProps} />);
    
    expect(screen.getByText('1:23.456')).toBeInTheDocument();
  });

  it('handles multiple instances', () => {
    const stats = [
      { label: 'Wins', value: '5', description: 'Race wins' },
      { label: 'Podiums', value: '12', description: 'Podium finishes' },
      { label: 'Points', value: '250', description: 'Championship points' },
    ];
    
    renderWithChakra(
      <div>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={<MockIcon />}
            label={stat.label}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>
    );
    
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('Podiums')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(
      <ChakraProvider>
        <StatCard {...defaultProps} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    // Re-render with different props
    rerender(
      <ChakraProvider>
        <StatCard {...defaultProps} label="Different Label" />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Different Label')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    
    // Re-mount
    renderWithChakra(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with different team colors', () => {
    const teamColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    
    teamColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <StatCard {...defaultProps} teamColor={color} />
      );
      
      const iconContainer = document.querySelector('[class*="iconContainer"]');
      expect(iconContainer).toHaveStyle(`background-color: ${color}`);
      unmount();
    });
  });

  it('renders with complex icon components', () => {
    const ComplexIcon = () => (
      <div data-testid="complex-icon">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
        </svg>
      </div>
    );
    
    renderWithChakra(<StatCard {...defaultProps} icon={<ComplexIcon />} />);
    
    expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
  });

  it('renders with conditional content', () => {
    const showDetails = true;
    renderWithChakra(
      <StatCard
        {...defaultProps}
        description={showDetails ? 'Detailed description' : 'Basic description'}
      />
    );
    
    expect(screen.getByText('Detailed description')).toBeInTheDocument();
  });

  it('maintains structure with different content lengths', () => {
    const testCases = [
      { label: 'A', value: '1', description: 'Short' },
      { label: 'Very Long Label That Might Cause Layout Issues', value: '999,999,999', description: 'This is a very long description that should not break the layout' },
    ];

    testCases.forEach((testCase) => {
      const { unmount } = renderWithChakra(
        <StatCard
          icon={<MockIcon />}
          label={testCase.label}
          value={testCase.value}
          description={testCase.description}
        />
      );
      
      expect(screen.getByText(testCase.label)).toBeInTheDocument();
      expect(screen.getByText(testCase.value)).toBeInTheDocument();
      expect(screen.getByText(testCase.description)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with HTML entities in text', () => {
    const htmlProps = {
      ...defaultProps,
      label: 'Wins &amp; Podiums',
      value: '1&lt;2',
      description: 'Ranking: #1 (&gt; 50%)',
    };
    
    renderWithChakra(<StatCard {...htmlProps} />);
    
    // HTML entities are rendered as encoded in the DOM
    expect(screen.getByText('Wins &amp; Podiums')).toBeInTheDocument();
    expect(screen.getByText('1&lt;2')).toBeInTheDocument();
    expect(screen.getByText('Ranking: #1 (&gt; 50%)')).toBeInTheDocument();
  });

  it('renders with zero values', () => {
    const zeroProps = {
      ...defaultProps,
      value: '0',
    };
    
    renderWithChakra(<StatCard {...zeroProps} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders with negative values', () => {
    const negativeProps = {
      ...defaultProps,
      value: '-5',
    };
    
    renderWithChakra(<StatCard {...negativeProps} />);
    
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('renders with scientific notation', () => {
    const scientificProps = {
      ...defaultProps,
      value: '1.23e+6',
    };
    
    renderWithChakra(<StatCard {...scientificProps} />);
    
    expect(screen.getByText('1.23e+6')).toBeInTheDocument();
  });

  it('maintains performance with many instances', () => {
    const startTime = performance.now();
    
    renderWithChakra(
      <div>
        {Array.from({ length: 20 }, (_, i) => (
          <StatCard
            key={i}
            icon={<MockIcon />}
            label={`Stat ${i}`}
            value={`${i * 10}`}
            description={`Description ${i}`}
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render quickly (less than 5 seconds for 20 instances in test environment)
    expect(renderTime).toBeLessThan(5000);
    
    // All instances should be rendered
    for (let i = 0; i < 20; i++) {
      expect(screen.getByText(`Stat ${i}`)).toBeInTheDocument();
    }
  });

  it('renders with different icon sizes', () => {
    const SmallIcon = () => <div data-testid="small-icon">S</div>;
    const LargeIcon = () => <div data-testid="large-icon">L</div>;
    
    const { rerender } = renderWithChakra(
      <StatCard {...defaultProps} icon={<SmallIcon />} />
    );
    
    expect(screen.getByTestId('small-icon')).toBeInTheDocument();
    
    rerender(
      <ChakraProvider>
        <StatCard {...defaultProps} icon={<LargeIcon />} />
      </ChakraProvider>
    );
    
    expect(screen.getByTestId('large-icon')).toBeInTheDocument();
  });

  it('handles undefined team color gracefully', () => {
    renderWithChakra(<StatCard {...defaultProps} teamColor={undefined} />);
    
    const iconContainer = document.querySelector('[class*="iconContainer"]');
    expect(iconContainer).toHaveStyle('background-color: var(--color-primary-red)');
  });

  it('renders with null team color', () => {
    renderWithChakra(<StatCard {...defaultProps} teamColor={null as any} />);
    
    const iconContainer = document.querySelector('[class*="iconContainer"]');
    expect(iconContainer).toHaveStyle('background-color: var(--color-primary-red)');
  });

  it('renders with empty string team color', () => {
    renderWithChakra(<StatCard {...defaultProps} teamColor="" />);
    
    const iconContainer = document.querySelector('[class*="iconContainer"]');
    expect(iconContainer).toHaveStyle('background-color: var(--color-primary-red)');
  });
});
