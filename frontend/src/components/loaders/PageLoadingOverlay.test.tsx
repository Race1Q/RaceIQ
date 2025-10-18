import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import PageLoadingOverlay from './PageLoadingOverlay';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock SpeedometerMini
vi.mock('./SpeedometerMini', () => ({
  default: ({ size }: { size: number }) => (
    <div data-testid="speedometer-mini" data-size={size}>
      Speedometer
    </div>
  ),
}));

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
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('PageLoadingOverlay', () => {
  it('renders without crashing', () => {
    renderWithProviders(<PageLoadingOverlay />);
    expect(screen.getByTestId('speedometer-mini')).toBeInTheDocument();
  });

  it('displays speedometer with default size', () => {
    renderWithProviders(<PageLoadingOverlay />);
    
    const speedometer = screen.getByTestId('speedometer-mini');
    expect(speedometer).toHaveAttribute('data-size', '260');
  });

  it('displays speedometer with custom size', () => {
    renderWithProviders(<PageLoadingOverlay speedometerSize={300} />);
    
    const speedometer = screen.getByTestId('speedometer-mini');
    expect(speedometer).toHaveAttribute('data-size', '300');
  });

  it('displays custom text when provided', () => {
    renderWithProviders(<PageLoadingOverlay text="Loading Race Data..." />);
    
    expect(screen.getByText('Loading Race Data...')).toBeInTheDocument();
  });

  it('hides text when not provided', () => {
    renderWithProviders(<PageLoadingOverlay />);
    
    // Should not have any text element
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
  });

  it('renders skeleton lines', () => {
    const { container } = renderWithProviders(<PageLoadingOverlay />);
    
    // Should have multiple skeleton line elements
    const skeletonBoxes = container.querySelectorAll('[class*="css-"]');
    expect(skeletonBoxes.length).toBeGreaterThan(0);
  });

  it('renders with custom minHeight', () => {
    const { container } = renderWithProviders(<PageLoadingOverlay minHeight="500px" />);
    
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with responsive minHeight', () => {
    const { container } = renderWithProviders(
      <PageLoadingOverlay minHeight={{ base: '50vh', md: '80vh' }} />
    );
    
    expect(container.firstChild).toBeTruthy();
  });

  it('has loading-spinner test id', () => {
    renderWithProviders(<PageLoadingOverlay />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders skeleton cards grid', () => {
    const { container } = renderWithProviders(<PageLoadingOverlay />);
    
    // Should render a grid layout for skeleton cards
    const grids = container.querySelectorAll('[class*="css-"]');
    expect(grids.length).toBeGreaterThan(5);
  });
});

