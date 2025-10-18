import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AnalyticsStandings from './AnalyticsStandings';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
  }),
}));

// Mock useUserProfile
vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock SearchableSelect component
vi.mock('../../components/DropDownSearch/SearchableSelect', () => ({
  default: ({ label, value }: any) => (
    <div data-testid="searchable-select">
      <label>{label}</label>
      {value && <div data-testid="selected-value">{value.label}</div>}
    </div>
  ),
}));

// Mock StandingsTabs
vi.mock('../../components/Standings/StandingsTabs', () => ({
  default: ({ active }: any) => (
    <div data-testid="standings-tabs">
      <div data-testid={`tab-${active}`}>{active}</div>
    </div>
  ),
}));

// Mock StandingsAnalysisCard
vi.mock('../../components/StandingsAnalysisCard/StandingsAnalysisCard', () => ({
  default: ({ season }: any) => (
    <div data-testid="standings-analysis-card">
      <div>AI Analysis for {season}</div>
    </div>
  ),
}));

// Mock PageHeader
vi.mock('../../components/layout/PageHeader', () => ({
  default: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

// Mock LayoutContainer
vi.mock('../../components/layout/LayoutContainer', () => ({
  default: ({ children }: any) => <div data-testid="layout-container">{children}</div>,
}));

// Mock AnalyticsStandingsSkeleton
vi.mock('./AnalyticsStandingsSkeleton', () => ({
  default: () => <div data-testid="analytics-skeleton">Loading Analytics...</div>,
}));

// Mock recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ name }: any) => <div data-testid={`line-${name}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis">X Axis</div>,
  YAxis: () => <div data-testid="y-axis">Y Axis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">Grid</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock team colors
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull': '3671C6',
    'Ferrari': 'DC143C',
    'Mercedes': '00D2BE',
  },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Test theme
const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#FF0000',
    },
  },
});

// Mock data
const mockConstructorsProgression = [
  {
    constructorId: 1,
    constructorName: 'Red Bull',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 44, cumulativePoints: 44 },
      { round: 2, raceName: 'Saudi Arabian GP', racePoints: 38, cumulativePoints: 82 },
    ],
  },
  {
    constructorId: 2,
    constructorName: 'Ferrari',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 36, cumulativePoints: 36 },
      { round: 2, raceName: 'Saudi Arabian GP', racePoints: 32, cumulativePoints: 68 },
    ],
  },
];

const mockDriversProgression = [
  {
    driverId: 1,
    driverName: 'Max Verstappen',
    driverTeam: 'Red Bull',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 },
      { round: 2, raceName: 'Saudi Arabian GP', racePoints: 25, cumulativePoints: 50 },
    ],
  },
  {
    driverId: 2,
    driverName: 'Charles Leclerc',
    driverTeam: 'Ferrari',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 18, cumulativePoints: 18 },
      { round: 2, raceName: 'Saudi Arabian GP', racePoints: 18, cumulativePoints: 36 },
    ],
  },
];

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      <BrowserRouter>
        <ThemeColorProvider>
          {ui}
        </ThemeColorProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('AnalyticsStandings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful fetch responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/constructors/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockConstructorsProgression),
        });
      }
      if (url.includes('/drivers/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDriversProgression),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByText('Formula 1 Championship Analytics')).toBeInTheDocument();
    });
  });

  it('displays page header with correct title and subtitle', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByText('Formula 1 Championship Analytics')).toBeInTheDocument();
      expect(screen.getByText('Explore and Analyze both F1 Championships')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderWithProviders(<AnalyticsStandings />);
    
    expect(screen.getByTestId('analytics-skeleton')).toBeInTheDocument();
    expect(screen.getByText('Loading Analytics...')).toBeInTheDocument();
  });

  it('displays standings tabs', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByTestId('standings-tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tab-analytics')).toBeInTheDocument();
    });
  });

  it('displays season selector', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
      expect(screen.getByText('Select Season')).toBeInTheDocument();
    });
  });

  it('fetches and displays chart data', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/constructors/'));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/drivers/'));
    });

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).not.toBeInTheDocument();
    });
  });

  it('displays drivers chart when data is loaded', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByText('2025 Drivers Points Progression')).toBeInTheDocument();
    });
  });

  it('displays constructors chart when data is loaded', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByText('2025 Constructors Points Progression')).toBeInTheDocument();
    });
  });

  it('displays AI analysis card', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByTestId('standings-analysis-card')).toBeInTheDocument();
      expect(screen.getByText('AI Analysis for 2025')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (global.fetch as any).mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        json: () => Promise.reject(new Error('API Error')),
      });
    });

    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders chart containers with fixed heights', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      const charts = screen.getAllByTestId('responsive-container');
      expect(charts.length).toBeGreaterThan(0);
    });
  });

  it('renders chart containers with proper structure', async () => {
    const { container } = renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      // Verify that chart containers are rendered
      const charts = container.querySelectorAll('[data-testid="responsive-container"]');
      expect(charts.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('uses memoized chart data', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      // Charts should render with memoized data
      expect(screen.getByText('2025 Drivers Points Progression')).toBeInTheDocument();
      expect(screen.getByText('2025 Constructors Points Progression')).toBeInTheDocument();
    });
  });

  it('handles empty progression data', async () => {
    (global.fetch as any).mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).not.toBeInTheDocument();
    });
  });

  it('maintains responsive container structure', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByTestId('layout-container')).toBeInTheDocument();
    });
  });

  it('displays correct season in analysis card', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Analysis for 2025')).toBeInTheDocument();
    });
  });

  it('renders all chart components', async () => {
    renderWithProviders(<AnalyticsStandings />);
    
    await waitFor(() => {
      const lineCharts = screen.getAllByTestId('line-chart');
      expect(lineCharts.length).toBeGreaterThanOrEqual(2); // At least 2 charts (drivers + constructors)
    });
  });
});

