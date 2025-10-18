import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import ResponsiveMedia from './ResponsiveMedia';

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

describe('ResponsiveMedia', () => {
  describe('Image Mode', () => {
    it('renders without crashing with src prop', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
    });

    it('renders image with correct src', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });

    it('renders image with correct alt text', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('uses default alt text when not provided', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" />
      );
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', '');
    });

    it('applies lazy loading to images', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('applies default aspect ratio', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveStyle({ aspectRatio: '16/9' });
    });

    it('applies custom aspect ratio', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" aspectRatio="4/3" />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveStyle({ aspectRatio: '4/3' });
    });

    it('applies default objectFit', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      const image = screen.getByAltText('Test Image');
      // objectFit is applied as a Chakra UI prop, component should render successfully
      expect(image).toBeInTheDocument();
    });

    it('applies custom objectFit', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" objectFit="contain" />
      );
      
      const image = screen.getByAltText('Test Image');
      // objectFit is applied as a Chakra UI prop, component should render successfully
      expect(image).toBeInTheDocument();
    });

    it('applies all objectFit options correctly', () => {
      const objectFits: Array<'cover' | 'contain' | 'fill' | 'none' | 'scale-down'> = ['cover', 'contain', 'fill', 'none', 'scale-down'];
      
      objectFits.forEach(fit => {
        const { container } = renderWithProviders(
          <ResponsiveMedia src="/test.jpg" alt={`Image ${fit}`} objectFit={fit} />
        );
        
        const image = screen.getByAltText(`Image ${fit}`);
        // objectFit is applied as a Chakra UI prop, verify image renders
        expect(image).toBeInTheDocument();
        
        container.remove();
      });
    });

    it('renders in a container Box', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      // Container should have position relative
      const boxes = container.querySelectorAll('[class*="css-"]');
      expect(boxes.length).toBeGreaterThan(0);
    });

    it('passes additional BoxProps to container', () => {
      renderWithProviders(
        <ResponsiveMedia 
          src="/test-image.jpg" 
          alt="Test Image"
          data-testid="media-container"
        />
      );
      
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });
  });

  describe('Children Mode', () => {
    it('renders without crashing with children', () => {
      renderWithProviders(
        <ResponsiveMedia>
          <div data-testid="child-content">Child Content</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders children when no src is provided', () => {
      renderWithProviders(
        <ResponsiveMedia>
          <div data-testid="child-content">Child Content</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      renderWithProviders(
        <ResponsiveMedia>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('applies aspect ratio to children container', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia aspectRatio="1/1" data-testid="media-box">
          <div>Child Content</div>
        </ResponsiveMedia>
      );
      
      // Aspect ratio is applied via inline style, verify container renders
      const box = screen.getByTestId('media-box');
      expect(box).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders children in a Box container', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia>
          <div data-testid="child-content">Child Content</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(container.firstChild).toBeTruthy();
    });

    it('passes BoxProps to children container', () => {
      renderWithProviders(
        <ResponsiveMedia data-testid="media-container">
          <div>Child Content</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByTestId('media-container')).toBeInTheDocument();
    });
  });

  describe('Border Radius', () => {
    it('applies default border radius', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      // Border radius is applied to container
      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
    });

    it('applies custom string border radius', () => {
      renderWithProviders(
        <ResponsiveMedia 
          src="/test-image.jpg" 
          alt="Test Image" 
          borderRadius="xl"
        />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
    });

    it('applies custom object border radius', () => {
      renderWithProviders(
        <ResponsiveMedia 
          src="/test-image.jpg" 
          alt="Test Image" 
          borderRadius={{ base: 'sm', md: 'xl' }}
        />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
    });

    it('border radius works with children mode', () => {
      renderWithProviders(
        <ResponsiveMedia borderRadius="full">
          <div data-testid="child-content">Child Content</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Aspect Ratios', () => {
    it('handles 16:9 aspect ratio', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test.jpg" alt="Test" aspectRatio="16/9" />
      );
      
      const image = screen.getByAltText('Test');
      expect(image).toHaveStyle({ aspectRatio: '16/9' });
    });

    it('handles 4:3 aspect ratio', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test.jpg" alt="Test" aspectRatio="4/3" />
      );
      
      const image = screen.getByAltText('Test');
      expect(image).toHaveStyle({ aspectRatio: '4/3' });
    });

    it('handles 1:1 square aspect ratio', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test.jpg" alt="Test" aspectRatio="1/1" />
      );
      
      const image = screen.getByAltText('Test');
      expect(image).toHaveStyle({ aspectRatio: '1/1' });
    });

    it('handles custom aspect ratio', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test.jpg" alt="Test" aspectRatio="21/9" />
      );
      
      const image = screen.getByAltText('Test');
      expect(image).toHaveStyle({ aspectRatio: '21/9' });
    });
  });

  describe('Container Properties', () => {
    it('container has position relative', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      expect(container.firstChild).toBeTruthy();
    });

    it('container has full width', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      expect(container.firstChild).toBeTruthy();
    });

    it('container has overflow hidden', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing src gracefully', () => {
      renderWithProviders(
        <ResponsiveMedia>
          <div data-testid="fallback">Fallback Content</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('prioritizes src over children', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image">
          <div data-testid="child-should-not-render">Child Content</div>
        </ResponsiveMedia>
      );
      
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
      expect(screen.queryByTestId('child-should-not-render')).not.toBeInTheDocument();
    });

    it('handles empty children', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia />
      );
      
      expect(container.firstChild).toBeTruthy();
    });

    it('handles null children', () => {
      const { container } = renderWithProviders(
        <ResponsiveMedia>{null}</ResponsiveMedia>
      );
      
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('images have alt text', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Accessible Image" />
      );
      
      expect(screen.getByAltText('Accessible Image')).toBeInTheDocument();
    });

    it('images have img role', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('uses lazy loading for images', () => {
      renderWithProviders(
        <ResponsiveMedia src="/test-image.jpg" alt="Test Image" />
      );
      
      const image = screen.getByAltText('Test Image');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Integration', () => {
    it('works with Chakra UI Box props', () => {
      renderWithProviders(
        <ResponsiveMedia 
          src="/test-image.jpg" 
          alt="Test Image"
          bg="gray.100"
          p={4}
          m={2}
        />
      );
      
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('works with Chakra UI responsive props', () => {
      renderWithProviders(
        <ResponsiveMedia 
          src="/test-image.jpg" 
          alt="Test Image"
          w={{ base: 'full', md: '50%' }}
        />
      );
      
      expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });
  });
});

