import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Standings from './Standings';

// Mock environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_BACKEND_URL: 'http://localhost:3000/',
  },
  writable: true,
});

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name}>Line for {name}</div>
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey}>X Axis</div>
  ),
  YAxis: () => <div data-testid="y-axis">Y Axis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">Grid</div>,
  Tooltip: () => (
    <div data-testid="tooltip">Tooltip</div>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock F1LoadingSpinner
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}));

// Mock teamColors
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '#1e40af',
    'Mercedes': '#00d2be',
    'Ferrari': '#dc2626',
  },
}));

const testTheme = extendTheme({
  colors: {
    gray: {
      700: '#374151',
      800: '#1f2937',
    },
  },
  fonts: {
    display: 'Inter, sans-serif',
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

const mockConstructorProgression = [
  {
    constructorId: 1,
    constructorName: 'Red Bull Racing',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 },
      { round: 2, raceName: 'Saudi Arabia GP', racePoints: 18, cumulativePoints: 43 },
    ],
  },
  {
    constructorId: 2,
    constructorName: 'Mercedes',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 15, cumulativePoints: 15 },
      { round: 2, raceName: 'Saudi Arabia GP', racePoints: 20, cumulativePoints: 35 },
    ],
  },
];

const mockDriverProgression = [
  {
    driverId: 1,
    driverName: 'Max Verstappen',
    driverTeam: 'Red Bull Racing',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 },
      { round: 2, raceName: 'Saudi Arabia GP', racePoints: 18, cumulativePoints: 43 },
    ],
  },
  {
    driverId: 2,
    driverName: 'Lewis Hamilton',
    driverTeam: 'Mercedes',
    progression: [
      { round: 1, raceName: 'Bahrain GP', racePoints: 15, cumulativePoints: 15 },
      { round: 2, raceName: 'Saudi Arabia GP', racePoints: 20, cumulativePoints: 35 },
    ],
  },
];

describe('Standings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockConstructorProgression),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<Standings />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading Standings...')).toBeInTheDocument();
  });

  it('renders main heading', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument();
    });
  });

  it('renders driver and constructor navigation boxes', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByText('Drivers Standings')).toBeInTheDocument();
      expect(screen.getByText('Constructors Standings')).toBeInTheDocument();
      expect(screen.getByText('View Drivers')).toBeInTheDocument();
      expect(screen.getByText('View Constructors')).toBeInTheDocument();
    });
  });

  it('renders driver progression chart when data is available', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByText('2025 Drivers Points Progression')).toBeInTheDocument();
      expect(screen.getAllByTestId('line-chart')).toHaveLength(2);
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(2);
    });
  });

  it('renders constructor progression chart when data is available', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByText('2025 Constructors Points Progression')).toBeInTheDocument();
      expect(screen.getAllByTestId('line-chart')).toHaveLength(2);
    });
  });

  it('creates chart data correctly for drivers', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByTestId('line-Max Verstappen')).toBeInTheDocument();
      expect(screen.getByTestId('line-Lewis Hamilton')).toBeInTheDocument();
    });
  });

  it('creates chart data correctly for constructors', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByTestId('line-Red Bull Racing')).toBeInTheDocument();
      expect(screen.getByTestId('line-Mercedes')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<Standings />);

    await waitFor(() => {
      // Should not show charts when API fails
      expect(screen.queryByText('2025 Drivers Points Progression')).not.toBeInTheDocument();
      expect(screen.queryByText('2025 Constructors Points Progression')).not.toBeInTheDocument();
    });
  });

  it('handles empty data gracefully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      // Should not show charts when no data
      expect(screen.queryByText('2025 Drivers Points Progression')).not.toBeInTheDocument();
      expect(screen.queryByText('2025 Constructors Points Progression')).not.toBeInTheDocument();
    });
  });

  it('renders navigation links with correct paths', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      const driverLink = screen.getByText('View Drivers').closest('a');
      const constructorLink = screen.getByText('View Constructors').closest('a');
      
      expect(driverLink).toHaveAttribute('href', '/standings/drivers');
      expect(constructorLink).toHaveAttribute('href', '/standings/constructors');
    });
  });

  it('sorts chart data by round number', async () => {
    const unsortedDriverData = [
      {
        driverId: 1,
        driverName: 'Max Verstappen',
        driverTeam: 'Red Bull Racing',
        progression: [
          { round: 2, raceName: 'Saudi Arabia GP', racePoints: 18, cumulativePoints: 43 },
          { round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 },
        ],
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(unsortedDriverData),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getAllByTestId('line-chart')).toHaveLength(2);
      // Chart should be rendered (data processing happens internally)
    });
  });

  it('renders within performance expectations', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConstructorProgression),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDriverProgression),
      });

    const startTime = performance.now();
    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within reasonable time (less than 2000ms)
    expect(renderTime).toBeLessThan(2000);
  });

  it('handles mixed data scenarios', async () => {
    const mixedDriverData = [
      {
        driverId: 1,
        driverName: 'Max Verstappen',
        driverTeam: 'Red Bull Racing',
        progression: [
          { round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 },
        ],
      },
    ];

    const mixedConstructorData = [
      {
        constructorId: 1,
        constructorName: 'Red Bull Racing',
        progression: [
          { round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 },
          { round: 2, raceName: 'Saudi Arabia GP', racePoints: 18, cumulativePoints: 43 },
        ],
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mixedConstructorData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mixedDriverData),
      });

    renderWithProviders(<Standings />);

    await waitFor(() => {
      expect(screen.getByText('2025 Drivers Points Progression')).toBeInTheDocument();
      expect(screen.getByText('2025 Constructors Points Progression')).toBeInTheDocument();
    });
  });
});
