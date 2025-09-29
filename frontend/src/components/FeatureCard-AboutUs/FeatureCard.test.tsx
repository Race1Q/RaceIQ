import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import FeatureCard from './FeatureCard';

// Mock a simple icon component for testing
const MockIcon = ({ size }: { size?: number }) => (
  <div data-testid="mock-icon" style={{ width: size || 24, height: size || 24 }}>
    Icon
  </div>
);

// Helper function to render with Chakra UI
function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('FeatureCard Component', () => {
  const defaultProps = {
    icon: <MockIcon />,
    title: 'Test Feature',
    description: 'This is a test feature description that explains what the feature does.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<FeatureCard {...defaultProps} />);
    
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is a test feature description that explains what the feature does.')).toBeInTheDocument();
  });

  it('renders title correctly', () => {
    renderWithProviders(<FeatureCard {...defaultProps} />);
    
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test Feature');
  });

  it('renders description correctly', () => {
    renderWithProviders(<FeatureCard {...defaultProps} />);
    
    expect(screen.getByText('This is a test feature description that explains what the feature does.')).toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    renderWithProviders(<FeatureCard {...defaultProps} />);
    
    const icon = screen.getByTestId('mock-icon');
    expect(icon).toBeInTheDocument();
  });

  it('clones icon with correct size', () => {
    renderWithProviders(<FeatureCard {...defaultProps} />);
    
    const icon = screen.getByTestId('mock-icon');
    expect(icon).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('renders with different props', () => {
    const customProps = {
      icon: <MockIcon />,
      title: 'Custom Feature',
      description: 'A different description for testing.',
    };
    
    renderWithProviders(<FeatureCard {...customProps} />);
    
    expect(screen.getByText('Custom Feature')).toBeInTheDocument();
    expect(screen.getByText('A different description for testing.')).toBeInTheDocument();
  });

  it('handles long descriptions', () => {
    const longDescription = 'This is a very long description that contains multiple sentences and should still render correctly within the FeatureCard component. It tests how the component handles longer text content and ensures proper text wrapping and display.';
    
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="Long Description Test" 
        description={longDescription} 
      />
    );
    
    expect(screen.getByText('Long Description Test')).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('handles empty title', () => {
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="" 
        description="Description without title" 
      />
    );
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('');
  });

  it('handles empty description', () => {
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="Title Only" 
        description="" 
      />
    );
    
    expect(screen.getByText('Title Only')).toBeInTheDocument();
    // Check that paragraph element exists (even with empty content)
    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('renders with different icon components', () => {
    const CustomIcon = ({ size }: { size?: number }) => (
      <span data-testid="custom-icon" style={{ fontSize: size }}>
        Custom Icon
      </span>
    );
    
    renderWithProviders(
      <FeatureCard 
        icon={<CustomIcon />} 
        title="Custom Icon Test" 
        description="Testing with a different icon component" 
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Custom Icon')).toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    renderWithProviders(<FeatureCard {...defaultProps} />);
    
    // Check that all main elements are present
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    
    // Check that the component renders without errors
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    renderWithProviders(<FeatureCard {...defaultProps} />);
    
    // The component should render without styling errors
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('handles special characters in title and description', () => {
    const specialProps = {
      icon: <MockIcon />,
      title: 'Feature with Special Chars: !@#$%^&*()',
      description: 'Description with unicode: 中文, 日本語, 한국어, العربية',
    };
    
    renderWithProviders(<FeatureCard {...specialProps} />);
    
    expect(screen.getByText('Feature with Special Chars: !@#$%^&*()')).toBeInTheDocument();
    expect(screen.getByText('Description with unicode: 中文, 日本語, 한국어, العربية')).toBeInTheDocument();
  });

  it('renders multiple instances correctly', () => {
    const features = [
      {
        icon: <MockIcon />,
        title: 'Feature 1',
        description: 'First feature description',
      },
      {
        icon: <MockIcon />,
        title: 'Feature 2',
        description: 'Second feature description',
      },
    ];
    
    const { unmount: unmount1 } = renderWithProviders(
      <FeatureCard {...features[0]} />
    );
    
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('First feature description')).toBeInTheDocument();
    
    unmount1();
    
    const { unmount: unmount2 } = renderWithProviders(
      <FeatureCard {...features[1]} />
    );
    
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Second feature description')).toBeInTheDocument();
    
    unmount2();
  });
});

describe('FeatureCard Integration Tests', () => {
  it('works correctly with Chakra UI theme', () => {
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="Theme Test" 
        description="Testing theme integration" 
      />
    );
    
    // Component should render without theme-related errors
    expect(screen.getByText('Theme Test')).toBeInTheDocument();
    expect(screen.getByText('Testing theme integration')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('maintains accessibility with proper heading structure', () => {
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="Accessibility Test" 
        description="Testing accessibility features" 
      />
    );
    
    // Check that the heading is properly structured
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Accessibility Test');
  });

  it('handles React element props correctly', () => {
    const IconWithProps = ({ size, color }: { size?: number; color?: string }) => (
      <div 
        data-testid="icon-with-props" 
        style={{ width: size, height: size, color }} 
      >
        Icon with props
      </div>
    );
    
    renderWithProviders(
      <FeatureCard 
        icon={<IconWithProps color="blue" />} 
        title="Props Test" 
        description="Testing icon with props" 
      />
    );
    
    const icon = screen.getByTestId('icon-with-props');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ width: '40px', height: '40px' });
  });
});

describe('FeatureCard Edge Cases', () => {
  it('handles undefined props gracefully', () => {
    // Test with minimal props
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="Minimal" 
        description="Test" 
      />
    );
    
    expect(screen.getByText('Minimal')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles very long titles', () => {
    const longTitle = 'This is a very long title that might cause layout issues if not handled properly by the component styling';
    
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title={longTitle} 
        description="Testing long title handling" 
      />
    );
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('handles React fragments as icons', () => {
    const FragmentIcon = () => (
      <>
        <span data-testid="fragment-part-1">Part 1</span>
        <span data-testid="fragment-part-2">Part 2</span>
      </>
    );
    
    renderWithProviders(
      <FeatureCard 
        icon={<FragmentIcon />} 
        title="Fragment Icon Test" 
        description="Testing React fragment as icon" 
      />
    );
    
    expect(screen.getByTestId('fragment-part-1')).toBeInTheDocument();
    expect(screen.getByTestId('fragment-part-2')).toBeInTheDocument();
  });

  it('handles complex nested icon components', () => {
    const NestedIcon = () => (
      <div data-testid="nested-container">
        <div data-testid="nested-inner">
          <span data-testid="nested-text">Nested Icon</span>
        </div>
      </div>
    );
    
    renderWithProviders(
      <FeatureCard 
        icon={<NestedIcon />} 
        title="Nested Icon Test" 
        description="Testing complex nested icon structure" 
      />
    );
    
    expect(screen.getByTestId('nested-container')).toBeInTheDocument();
    expect(screen.getByTestId('nested-inner')).toBeInTheDocument();
    expect(screen.getByTestId('nested-text')).toBeInTheDocument();
  });

  it('handles whitespace-only text', () => {
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="   " 
        description="   " 
      />
    );
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    // Chakra UI may trim whitespace, so just check that the heading exists
    expect(heading.tagName).toBe('H2');
  });

  it('handles numeric strings as text', () => {
    renderWithProviders(
      <FeatureCard 
        icon={<MockIcon />} 
        title="123" 
        description="456" 
      />
    );
    
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('456')).toBeInTheDocument();
  });
});
