import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DashboardPage from './DashboardPage';

// Mock react-grid-layout
vi.mock('react-grid-layout', () => ({
  Responsive: ({ children, onLayoutChange }: any) => (
    <div data-testid="responsive-grid-layout" onClick={() => onLayoutChange && onLayoutChange([], {})}>
      {children}
    </div>
  ),
  WidthProvider: (Component: any) => Component,
}));

// Mock useDashboardData hook
const mockUseDashboardData = vi.fn();
vi.mock('../../hooks/useDashboardData', () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

// Mock all widget components
vi.mock('./components/DashboardHeader', () => ({
  default: ({ onCustomizeClick }: { onCustomizeClick: () => void }) => (
    <div data-testid="dashboard-header">
      <button onClick={onCustomizeClick} data-testid="customize-button">
        Customize Dashboard
      </button>
    </div>
  ),
}));

vi.mock('./components/CustomizeDashboardModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="customize-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <button onClick={onClose} data-testid="close-modal">Close</button>
    </div>
  ),
}));

vi.mock('./widgets/NextRaceWidget', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="next-race-widget">
      Next Race Widget {data ? '(with data)' : '(no data)'}
    </div>
  ),
}));

vi.mock('./widgets/StandingsWidget', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="standings-widget">
      Standings Widget {data ? '(with data)' : '(no data)'}
    </div>
  ),
}));

vi.mock('./widgets/LastPodiumWidget', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="last-podium-widget">
      Last Podium Widget {data ? '(with data)' : '(no data)'}
    </div>
  ),
}));

vi.mock('./widgets/FastestLapWidget', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="fastest-lap-widget">
      Fastest Lap Widget {data ? '(with data)' : '(no data)'}
    </div>
  ),
}));

vi.mock('./widgets/FavoriteDriverSnapshotWidget', () => ({
  default: () => <div data-testid="favorite-driver-widget">Favorite Driver Widget</div>,
}));

vi.mock('./widgets/FavoriteTeamSnapshotWidget', () => ({
  default: () => <div data-testid="favorite-team-widget">Favorite Team Widget</div>,
}));

vi.mock('./widgets/HeadToHeadQuickCompareWidget', () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="head-to-head-widget">
      Head to Head Widget {data ? '(with data)' : '(no data)'}
    </div>
  ),
}));

vi.mock('./widgets/LatestF1NewsWidget', () => ({
  default: () => <div data-testid="f1-news-widget">F1 News Widget</div>,
}));

// Mock F1LoadingSpinner
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle-icon">⚠️</div>,
}));

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
  },
  space: {
    lg: '1.5rem',
  },
  fonts: {
    heading: 'Inter, sans-serif',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ChakraProvider theme={testTheme}>
        {ui}
      </ChakraProvider>
    </BrowserRouter>
  );
};

const mockDashboardData = {
  nextRace: {
    raceName: 'Bahrain Grand Prix',
    date: '2025-03-02',
    circuit: 'Bahrain International Circuit',
  },
  championshipStandings: [
    { position: 1, driver: 'Max Verstappen', points: 25 },
    { position: 2, driver: 'Lewis Hamilton', points: 18 },
  ],
  lastRacePodium: [
    { position: 1, driver: 'Max Verstappen' },
    { position: 2, driver: 'Lewis Hamilton' },
    { position: 3, driver: 'Charles Leclerc' },
  ],
  lastRaceFastestLap: {
    driver: 'Max Verstappen',
    time: '1:32.123',
  },
  headToHead: {
    driver1: 'Max Verstappen',
    driver2: 'Lewis Hamilton',
    comparison: 'Verstappen leads 3-1',
  },
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      isFallback: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      isFallback: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading Dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard header', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('customize-button')).toBeInTheDocument();
    });
  });

  it('renders all widgets when loaded', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('responsive-grid-layout')).toBeInTheDocument();
      expect(screen.getByTestId('next-race-widget')).toBeInTheDocument();
      expect(screen.getByTestId('standings-widget')).toBeInTheDocument();
      expect(screen.getByTestId('last-podium-widget')).toBeInTheDocument();
      expect(screen.getByTestId('fastest-lap-widget')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-driver-widget')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-team-widget')).toBeInTheDocument();
      expect(screen.getByTestId('head-to-head-widget')).toBeInTheDocument();
      expect(screen.getByTestId('f1-news-widget')).toBeInTheDocument();
    });
  });

  it('passes correct data to widgets', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('next-race-widget')).toHaveTextContent('with data');
      expect(screen.getByTestId('standings-widget')).toHaveTextContent('with data');
      expect(screen.getByTestId('last-podium-widget')).toHaveTextContent('with data');
      expect(screen.getByTestId('fastest-lap-widget')).toHaveTextContent('with data');
      expect(screen.getByTestId('head-to-head-widget')).toHaveTextContent('with data');
    });
  });

  it('opens customize modal when customize button is clicked', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    const customizeButton = screen.getByTestId('customize-button');
    fireEvent.click(customizeButton);

    await waitFor(() => {
      expect(screen.getByTestId('customize-modal')).toBeInTheDocument();
    });
  });

  it('closes customize modal when close button is clicked', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    // Open modal
    const customizeButton = screen.getByTestId('customize-button');
    fireEvent.click(customizeButton);

    await waitFor(() => {
      expect(screen.getByTestId('customize-modal')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      const modal = screen.getByTestId('customize-modal');
      expect(modal).toHaveStyle({ display: 'none' });
    });
  });

  it('shows fallback banner when using fallback data', async () => {
    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      isFallback: true,
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Live Data Unavailable. Showing cached data.')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  it('handles error state when no data is available', () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to fetch dashboard data',
      isFallback: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Error loading dashboard: Failed to fetch dashboard data')).toBeInTheDocument();
  });

  it('handles empty data gracefully', async () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      isFallback: false,
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('responsive-grid-layout')).toBeInTheDocument();
      expect(screen.getByTestId('next-race-widget')).toHaveTextContent('no data');
      expect(screen.getByTestId('standings-widget')).toHaveTextContent('no data');
      expect(screen.getByTestId('last-podium-widget')).toHaveTextContent('no data');
      expect(screen.getByTestId('fastest-lap-widget')).toHaveTextContent('no data');
      expect(screen.getByTestId('head-to-head-widget')).toHaveTextContent('no data');
    });
  });

  it('handles layout changes', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('responsive-grid-layout')).toBeInTheDocument();
    });

    // Simulate layout change by clicking the grid layout
    const gridLayout = screen.getByTestId('responsive-grid-layout');
    fireEvent.click(gridLayout);

    // Should not crash when layout changes
    expect(gridLayout).toBeInTheDocument();
  });

  it('renders standings widget with link', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      const standingsWidget = screen.getByTestId('standings-widget');
      const link = standingsWidget.closest('a');
      expect(link).toHaveAttribute('href', '/standings/drivers');
    });
  });

  it('maintains widget visibility state', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      // All widgets should be visible by default
      expect(screen.getByTestId('next-race-widget')).toBeInTheDocument();
      expect(screen.getByTestId('standings-widget')).toBeInTheDocument();
      expect(screen.getByTestId('last-podium-widget')).toBeInTheDocument();
      expect(screen.getByTestId('fastest-lap-widget')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-driver-widget')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-team-widget')).toBeInTheDocument();
      expect(screen.getByTestId('head-to-head-widget')).toBeInTheDocument();
      expect(screen.getByTestId('f1-news-widget')).toBeInTheDocument();
    });
  });

  it('renders within performance expectations', async () => {
    const startTime = performance.now();

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within reasonable time (less than 2000ms)
    expect(renderTime).toBeLessThan(2000);
  });

  it('handles rapid state changes without crashing', async () => {
    const { rerender } = renderWithProviders(<DashboardPage />);

    // Change to loading state
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      isFallback: false,
    });

    rerender(
      <BrowserRouter>
        <ChakraProvider theme={testTheme}>
          <DashboardPage />
        </ChakraProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Change to error state
    mockUseDashboardData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      isFallback: false,
    });

    rerender(
      <BrowserRouter>
        <ChakraProvider theme={testTheme}>
          <DashboardPage />
        </ChakraProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Error loading dashboard: Network error')).toBeInTheDocument();

    // Change back to loaded state
    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      isFallback: false,
    });

    rerender(
      <BrowserRouter>
        <ChakraProvider theme={testTheme}>
          <DashboardPage />
        </ChakraProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });
  });
});
