import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import AnalyticsStandingsSkeleton from './AnalyticsStandingsSkeleton';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock SpeedometerMini
vi.mock('../../components/loaders/SpeedometerMini', () => ({
  default: ({ size }: { size: number }) => (
    <div data-testid="speedometer-mini" data-size={size}>
      Loading...
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

describe('AnalyticsStandingsSkeleton', () => {
  it('renders without crashing', () => {
    renderWithProviders(<AnalyticsStandingsSkeleton />);
    expect(screen.getByText('Loading Analytics...')).toBeInTheDocument();
  });

  it('displays speedometer loader', () => {
    renderWithProviders(<AnalyticsStandingsSkeleton />);
    
    const speedometer = screen.getByTestId('speedometer-mini');
    expect(speedometer).toBeInTheDocument();
    expect(speedometer).toHaveAttribute('data-size', '260');
  });

  it('displays loading text', () => {
    renderWithProviders(<AnalyticsStandingsSkeleton />);
    expect(screen.getByText('Loading Analytics...')).toBeInTheDocument();
  });

  it('renders skeleton chart containers', () => {
    const { container } = renderWithProviders(<AnalyticsStandingsSkeleton />);
    
    // Should have skeleton elements (any Box or Flex components)
    const boxes = container.querySelectorAll('[class*="css-"]');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('renders with proper structure', () => {
    const { container } = renderWithProviders(<AnalyticsStandingsSkeleton />);
    
    // Skeleton should render with container
    expect(container.firstChild).toBeTruthy();
  });
});

