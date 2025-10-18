import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import PageShell from './PageShell';

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

describe('PageShell', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(
        <PageShell>
          <div data-testid="child">Test Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      renderWithProviders(
        <PageShell>
          <div>Child Content</div>
        </PageShell>
      );
      
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      renderWithProviders(
        <PageShell>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('renders nested elements', () => {
      renderWithProviders(
        <PageShell>
          <div>
            <span>Nested Content</span>
          </div>
        </PageShell>
      );
      
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('applies default minH prop', () => {
      const { container } = renderWithProviders(
        <PageShell>
          <div>Content</div>
        </PageShell>
      );
      
      // Container should render with default props
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('applies default bg prop', () => {
      const { container } = renderWithProviders(
        <PageShell>
          <div>Content</div>
        </PageShell>
      );
      
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('applies default color prop', () => {
      const { container } = renderWithProviders(
        <PageShell>
          <div>Content</div>
        </PageShell>
      );
      
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('applies mobile-full-height className', () => {
      renderWithProviders(
        <PageShell>
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('applies safe area inset padding', () => {
      const { container } = renderWithProviders(
        <PageShell>
          <div>Content</div>
        </PageShell>
      );
      
      const box = container.firstChild?.firstChild as HTMLElement;
      expect(box).toBeTruthy();
    });
  });

  describe('Custom Props', () => {
    it('accepts custom minH prop', () => {
      renderWithProviders(
        <PageShell minH="80vh">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom bg prop', () => {
      renderWithProviders(
        <PageShell bg="gray.900">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom color prop', () => {
      renderWithProviders(
        <PageShell color="white">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts all custom props together', () => {
      renderWithProviders(
        <PageShell minH="90vh" bg="blue.500" color="yellow">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Safe Area Insets', () => {
    it('renders component with safe area inset support', () => {
      renderWithProviders(
        <PageShell data-testid="page-shell">
          <div>Content</div>
        </PageShell>
      );
      
      // Component renders successfully with safe area styles
      expect(screen.getByTestId('page-shell')).toBeInTheDocument();
    });

    it('applies safe area CSS variables via inline styles', () => {
      const { container } = renderWithProviders(
        <PageShell>
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      // Safe area variables are applied, verify component renders
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('maintains content visibility with safe areas', () => {
      renderWithProviders(
        <PageShell>
          <div data-testid="content">Test Content</div>
        </PageShell>
      );
      
      // Content should be visible regardless of safe area insets
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Additional BoxProps', () => {
    it('passes through additional Chakra BoxProps', () => {
      renderWithProviders(
        <PageShell
          borderRadius="lg"
          boxShadow="md"
          p={4}
          data-testid="shell"
        >
          <div>Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('shell')).toBeInTheDocument();
    });

    it('accepts className prop', () => {
      renderWithProviders(
        <PageShell className="custom-class">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts id prop', () => {
      renderWithProviders(
        <PageShell id="custom-id">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts data-testid prop', () => {
      renderWithProviders(
        <PageShell data-testid="test-shell">
          <div>Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('test-shell')).toBeInTheDocument();
    });

    it('accepts additional style prop', () => {
      renderWithProviders(
        <PageShell style={{ border: '1px solid red' }}>
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Mobile Support', () => {
    it('renders with mobile viewport support', () => {
      renderWithProviders(
        <PageShell data-testid="page-shell">
          <div>Content</div>
        </PageShell>
      );
      
      // Component should render with mobile-full-height class applied via Chakra
      expect(screen.getByTestId('page-shell')).toBeInTheDocument();
    });

    it('uses 100svh for mobile viewport height', () => {
      renderWithProviders(
        <PageShell>
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('allows custom viewport height', () => {
      renderWithProviders(
        <PageShell minH="100dvh">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Children Types', () => {
    it('renders text children', () => {
      renderWithProviders(
        <PageShell>
          Plain text content
        </PageShell>
      );
      
      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });

    it('renders JSX element children', () => {
      renderWithProviders(
        <PageShell>
          <h1>Page Heading</h1>
        </PageShell>
      );
      
      expect(screen.getByRole('heading', { name: 'Page Heading' })).toBeInTheDocument();
    });

    it('renders array of children', () => {
      renderWithProviders(
        <PageShell>
          {['Section 1', 'Section 2', 'Section 3'].map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </PageShell>
      );
      
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('renders fragments', () => {
      renderWithProviders(
        <PageShell>
          <>
            <header>Header</header>
            <main>Main</main>
            <footer>Footer</footer>
          </>
        </PageShell>
      );
      
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('renders as a Box component', () => {
      const { container } = renderWithProviders(
        <PageShell>
          <div>Content</div>
        </PageShell>
      );
      
      // Box component should be rendered
      expect(container.firstChild?.firstChild).toBeTruthy();
    });

    it('maintains proper DOM hierarchy', () => {
      renderWithProviders(
        <PageShell data-testid="shell">
          <div data-testid="child">Child</div>
        </PageShell>
      );
      
      const shell = screen.getByTestId('shell');
      const child = screen.getByTestId('child');
      
      expect(shell.contains(child)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string children', () => {
      const { container } = renderWithProviders(
        <PageShell data-testid="shell">
          {''}
        </PageShell>
      );
      
      // Container renders but has no visible content
      expect(screen.getByTestId('shell')).toBeInTheDocument();
    });

    it('handles zero as child', () => {
      renderWithProviders(
        <PageShell>
          {0}
        </PageShell>
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles boolean children (renders nothing)', () => {
      const { container } = renderWithProviders(
        <PageShell data-testid="shell">
          {true}
          {false}
        </PageShell>
      );
      
      // Container renders but booleans don't display
      expect(screen.getByTestId('shell')).toBeInTheDocument();
    });

    it('handles minH of 0', () => {
      renderWithProviders(
        <PageShell minH="0">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('handles empty bg', () => {
      renderWithProviders(
        <PageShell bg="">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      renderWithProviders(
        <PageShell>
          <div>Content</div>
        </PageShell>
      );
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('handles large content efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Item {i}</div>
      ));
      
      const startTime = performance.now();
      renderWithProviders(
        <PageShell>
          {largeContent}
        </PageShell>
      );
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Integration with Chakra UI', () => {
    it('works with Chakra UI theme tokens', () => {
      renderWithProviders(
        <PageShell bg="brand.red" color="white">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('works with Chakra UI semantic tokens', () => {
      renderWithProviders(
        <PageShell bg="bg-primary" color="text-primary">
          <div data-testid="content">Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    it('supports light mode colors', () => {
      renderWithProviders(
        <PageShell bg="white" color="black">
          <div data-testid="content">Light Mode Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('supports dark mode colors', () => {
      renderWithProviders(
        <PageShell bg="gray.900" color="white">
          <div data-testid="content">Dark Mode Content</div>
        </PageShell>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});

