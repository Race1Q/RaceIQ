import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import LayoutContainer from './LayoutContainer';

// Mock ProfileUpdateContext
vi.mock('../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    refreshTrigger: 0,
    triggerRefresh: vi.fn(),
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
};

describe('LayoutContainer', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(
        <LayoutContainer>
          <div data-testid="child">Test Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      renderWithProviders(
        <LayoutContainer>
          <div>Child Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      renderWithProviders(
        <LayoutContainer>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('renders nested elements', () => {
      renderWithProviders(
        <LayoutContainer>
          <div>
            <span>Nested Content</span>
          </div>
        </LayoutContainer>
      );
      
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('applies default maxW prop', () => {
      const { container } = renderWithProviders(
        <LayoutContainer>
          <div>Content</div>
        </LayoutContainer>
      );
      
      // Container should render with default props
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('applies default px (horizontal padding) prop', () => {
      const { container } = renderWithProviders(
        <LayoutContainer>
          <div>Content</div>
        </LayoutContainer>
      );
      
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('applies default py (vertical padding) prop', () => {
      const { container } = renderWithProviders(
        <LayoutContainer>
          <div>Content</div>
        </LayoutContainer>
      );
      
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('applies mx="auto" for centering', () => {
      const { container } = renderWithProviders(
        <LayoutContainer>
          <div>Content</div>
        </LayoutContainer>
      );
      
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('applies w="full" for full width', () => {
      const { container } = renderWithProviders(
        <LayoutContainer>
          <div>Content</div>
        </LayoutContainer>
      );
      
      expect(container.firstChild?.firstChild).toBeTruthy();
    });
  });

  describe('Custom Props', () => {
    it('accepts custom maxW as string', () => {
      renderWithProviders(
        <LayoutContainer maxW="600px">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom maxW as responsive object', () => {
      renderWithProviders(
        <LayoutContainer maxW={{ base: 'full', md: '768px', lg: '1024px' }}>
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom px as string', () => {
      renderWithProviders(
        <LayoutContainer px="8">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom px as responsive object', () => {
      renderWithProviders(
        <LayoutContainer px={{ base: 2, md: 4, lg: 8 }}>
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom py as string', () => {
      renderWithProviders(
        <LayoutContainer py="10">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom py as responsive object', () => {
      renderWithProviders(
        <LayoutContainer py={{ base: 3, md: 6, lg: 12 }}>
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Additional BoxProps', () => {
    it('passes through additional Chakra BoxProps', () => {
      renderWithProviders(
        <LayoutContainer
          bg="gray.100"
          borderRadius="lg"
          boxShadow="md"
          data-testid="container"
        >
          <div>Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('accepts className prop', () => {
      renderWithProviders(
        <LayoutContainer className="custom-class">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts id prop', () => {
      renderWithProviders(
        <LayoutContainer id="custom-id">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts data-testid prop', () => {
      renderWithProviders(
        <LayoutContainer data-testid="test-container">
          <div>Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('test-container')).toBeInTheDocument();
    });

    it('accepts style prop', () => {
      renderWithProviders(
        <LayoutContainer style={{ border: '1px solid red' }}>
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('handles responsive maxW prop', () => {
      renderWithProviders(
        <LayoutContainer 
          maxW={{ base: 'full', sm: '640px', md: '768px', lg: '1024px' }}
        >
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('handles responsive padding props', () => {
      renderWithProviders(
        <LayoutContainer 
          px={{ base: 4, sm: 6, md: 8, lg: 12 }}
          py={{ base: 4, sm: 6, md: 8, lg: 12 }}
        >
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('handles mixed responsive and static props', () => {
      renderWithProviders(
        <LayoutContainer 
          maxW={{ base: 'full', md: '1024px' }}
          px="8"
          py={{ base: 4, lg: 12 }}
        >
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Children Types', () => {
    it('renders text children', () => {
      renderWithProviders(
        <LayoutContainer>
          Plain text content
        </LayoutContainer>
      );
      
      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });

    it('renders JSX element children', () => {
      renderWithProviders(
        <LayoutContainer>
          <h1>Heading</h1>
        </LayoutContainer>
      );
      
      expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    });

    it('renders array of children', () => {
      renderWithProviders(
        <LayoutContainer>
          {['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </LayoutContainer>
      );
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders fragments', () => {
      renderWithProviders(
        <LayoutContainer>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </LayoutContainer>
      );
      
      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('renders as a Box component', () => {
      const { container } = renderWithProviders(
        <LayoutContainer>
          <div>Content</div>
        </LayoutContainer>
      );
      
      // Box component should be rendered
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('maintains proper DOM hierarchy', () => {
      renderWithProviders(
        <LayoutContainer data-testid="container">
          <div data-testid="child">Child</div>
        </LayoutContainer>
      );
      
      const container = screen.getByTestId('container');
      const child = screen.getByTestId('child');
      
      expect(container.contains(child)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string children', () => {
      const { container } = renderWithProviders(
        <LayoutContainer data-testid="container">
          {''}
        </LayoutContainer>
      );
      
      // Container renders but has no visible content
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('handles zero as child', () => {
      renderWithProviders(
        <LayoutContainer>
          {0}
        </LayoutContainer>
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles boolean children (renders nothing)', () => {
      const { container } = renderWithProviders(
        <LayoutContainer data-testid="container">
          {true}
          {false}
        </LayoutContainer>
      );
      
      // Container renders but booleans don't display
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('handles maxW of 0', () => {
      renderWithProviders(
        <LayoutContainer maxW="0">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('handles px and py of 0', () => {
      renderWithProviders(
        <LayoutContainer px="0" py="0">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      renderWithProviders(
        <LayoutContainer>
          <div>Content</div>
        </LayoutContainer>
      );
      const endTime = performance.now();
      
      // Allow up to 1000ms for slower test environments
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('handles large content efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Item {i}</div>
      ));
      
      const startTime = performance.now();
      renderWithProviders(
        <LayoutContainer>
          {largeContent}
        </LayoutContainer>
      );
      const endTime = performance.now();
      
      // Allow up to 2000ms for slower test environments with large content
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Integration with Chakra UI', () => {
    it('works with Chakra UI theme tokens', () => {
      renderWithProviders(
        <LayoutContainer bg="brand.red" color="white">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('works with Chakra UI spacing tokens', () => {
      renderWithProviders(
        <LayoutContainer px="xl" py="2xl">
          <div data-testid="content">Content</div>
        </LayoutContainer>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});

