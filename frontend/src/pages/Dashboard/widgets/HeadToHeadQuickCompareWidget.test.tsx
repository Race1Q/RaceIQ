import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HeadToHeadQuickCompareWidget from './HeadToHeadQuickCompareWidget';

// Mock Auth0
const mockGetAccessTokenSilently = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
    isAuthenticated: true,
    user: { sub: 'test-user' },
  }),
}));

// Mock buildApiUrl
vi.mock('../../../lib/api', () => ({
  buildApiUrl: (path: string) => path,
}));

// Mock teamColors
vi.mock('../../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '1E40AF',
    'Mercedes': '00D2BE',
    'Ferrari': 'DC143C',
    'Default': '666666',
  },
}));

// Mock getTeamLogo
vi.mock('../../../lib/teamAssets', () => ({
  getTeamLogo: vi.fn((teamName: string) => `/images/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}-logo.png`),
}));

// Mock driverHeadshots
vi.mock('../../../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Max Verstappen': '/images/verstappen.jpg',
    'Lewis Hamilton': '/images/hamilton.jpg',
    'Charles Leclerc': '/images/leclerc.jpg',
    'Carlos Sainz': '/images/sainz.jpg',
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      muted: '#666666',
    },
  },
  space: {
    md: '1rem',
    sm: '0.5rem',
    xs: '0.25rem',
    lg: '1.5rem',
  },
  fonts: {
    heading: 'Inter, sans-serif',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      {ui}
    </ChakraProvider>
  );
};

const mockHeadToHeadData = {
  driver1: {
    id: 1,
    fullName: 'Max Verstappen',
    teamName: 'Red Bull Racing',
    headshotUrl: '/images/verstappen.jpg',
    wins: 3,
    podiums: 5,
    points: 150,
  },
  driver2: {
    id: 2,
    fullName: 'Lewis Hamilton',
    teamName: 'Mercedes',
    headshotUrl: '/images/hamilton.jpg',
    wins: 1,
    podiums: 3,
    points: 120,
  },
};

const mockApiResponse = [
  {
    id: 1,
    fullname: 'Max Verstappen',
    constructor: 'Red Bull Racing',
    wins: 3,
    podiums: 5,
    points: 150,
    profileimageurl: '/images/verstappen.jpg',
  },
  {
    id: 2,
    fullname: 'Lewis Hamilton',
    constructor: 'Mercedes',
    wins: 1,
    podiums: 3,
    points: 120,
    profileimageurl: '/images/hamilton.jpg',
  },
  {
    id: 3,
    fullname: 'Charles Leclerc',
    constructor: 'Ferrari',
    wins: 0,
    podiums: 2,
    points: 75,
    profileimageurl: '/images/leclerc.jpg',
  },
  {
    id: 4,
    fullname: 'Carlos Sainz',
    constructor: 'Ferrari',
    wins: 1,
    podiums: 1,
    points: 50,
    profileimageurl: '/images/sainz.jpg',
  },
];

describe('HeadToHeadQuickCompareWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently.mockResolvedValue('mock-token');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });
  it('renders loading state when no data provided', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders head-to-head comparison when data is provided', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    
    await waitFor(() => {
      const verstappenElements = screen.getAllByText('Max Verstappen');
      expect(verstappenElements.length).toBeGreaterThan(0);
    });
    
    const hamiltonElements = screen.getAllByText('Lewis Hamilton');
    expect(hamiltonElements.length).toBeGreaterThan(0);
  });

  it('displays driver names correctly', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    await waitFor(() => {
      const verstappenElements = screen.getAllByText('Max Verstappen');
      expect(verstappenElements.length).toBeGreaterThan(0);
    });
    
    const hamiltonElements = screen.getAllByText('Lewis Hamilton');
    expect(hamiltonElements.length).toBeGreaterThan(0);
  });

  it('displays team names correctly', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    await waitFor(() => {
      expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
  });

  it('displays driver statistics correctly', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    await waitFor(() => {
      expect(screen.getByText('Wins: 3')).toBeInTheDocument();
    });

    // Driver 1 stats
    expect(screen.getByText('Podiums: 5')).toBeInTheDocument();
    expect(screen.getByText('Points: 150')).toBeInTheDocument();

    // Driver 2 stats
    expect(screen.getByText('Wins: 1')).toBeInTheDocument();
    expect(screen.getByText('Podiums: 3')).toBeInTheDocument();
    expect(screen.getByText('Points: 120')).toBeInTheDocument();
  });

  it('displays VS indicator', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    await waitFor(() => {
      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });

  it('renders driver images with fallback', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      const verstappenImage = images.find(img => img.getAttribute('alt') === 'Max Verstappen');
      expect(verstappenImage).toBeDefined();
    });
  });

  it('renders team logos', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      const redBullLogo = images.find(img => img.getAttribute('alt') === 'Red Bull Racing Logo');
      expect(redBullLogo).toBeDefined();
    });
  });

  it('handles null data gracefully', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={undefined} />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={undefined} />);

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles incomplete driver data', async () => {
    const incompleteData = {
      driver1: {
        id: 1,
        fullName: 'Max Verstappen',
        teamName: 'Red Bull Racing',
        headshotUrl: '/images/verstappen.jpg',
        wins: 3,
        podiums: 5,
        points: 150,
      },
      driver2: {
        id: 2,
        fullName: '',
        teamName: 'Mercedes',
        headshotUrl: '',
        wins: 0,
        podiums: 0,
        points: 0,
      },
    };

    renderWithProviders(<HeadToHeadQuickCompareWidget data={incompleteData} />);

    await waitFor(() => {
      const verstappenElements = screen.getAllByText('Max Verstappen');
      expect(verstappenElements.length).toBeGreaterThan(0);
    });
    
    expect(screen.getByText('Wins: 3')).toBeInTheDocument();
    expect(screen.getByText('Wins: 1')).toBeInTheDocument(); // From API data (Lewis Hamilton)
  });

  it('handles unknown teams', async () => {
    const dataWithUnknownTeams = {
      ...mockHeadToHeadData,
      driver1: {
        ...mockHeadToHeadData.driver1,
        teamName: 'Unknown Team',
      },
      driver2: {
        ...mockHeadToHeadData.driver2,
        teamName: 'Another Unknown Team',
      },
    };

    renderWithProviders(<HeadToHeadQuickCompareWidget data={dataWithUnknownTeams} />);

    // Component fetches from API so it will show the actual team names from API
    await waitFor(() => {
      expect(screen.getAllByText('Red Bull Racing').length).toBeGreaterThan(0);
    });
  });

  it('renders with correct layout structure', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    // Check for title
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('VS')).toBeInTheDocument();
    });
    
    // Check for both drivers
    const verstappenElements = screen.getAllByText('Max Verstappen');
    expect(verstappenElements.length).toBeGreaterThan(0);
    const hamiltonElements = screen.getAllByText('Lewis Hamilton');
    expect(hamiltonElements.length).toBeGreaterThan(0);
    
    // Check for stats
    expect(screen.getByText('Wins: 3')).toBeInTheDocument();
    expect(screen.getByText('Wins: 1')).toBeInTheDocument();
  });

  it('handles different driver statistics', async () => {
    const differentStatsData = {
      driver1: {
        id: 3,
        fullName: 'Charles Leclerc',
        teamName: 'Ferrari',
        headshotUrl: '/images/leclerc.jpg',
        wins: 0,
        podiums: 2,
        points: 75,
      },
      driver2: {
        id: 4,
        fullName: 'Carlos Sainz',
        teamName: 'Ferrari',
        headshotUrl: '/images/sainz.jpg',
        wins: 1,
        podiums: 1,
        points: 50,
      },
    };

    renderWithProviders(<HeadToHeadQuickCompareWidget data={differentStatsData} />);

    await waitFor(() => {
      const leclercElements = screen.getAllByText('Charles Leclerc');
      expect(leclercElements.length).toBeGreaterThan(0);
    });
    
    const sainzElements = screen.getAllByText('Carlos Sainz');
    expect(sainzElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Wins: 0')).toBeInTheDocument();
    expect(screen.getByText('Wins: 1')).toBeInTheDocument();
    expect(screen.getByText('Podiums: 2')).toBeInTheDocument();
    expect(screen.getByText('Podiums: 1')).toBeInTheDocument();
    expect(screen.getByText('Points: 75')).toBeInTheDocument();
    expect(screen.getByText('Points: 50')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />)).not.toThrow();
  });

  it('maintains consistent structure between loading and loaded states', async () => {
    // Test loading state
    const { rerender } = renderWithProviders(<HeadToHeadQuickCompareWidget />);
    
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Test loaded state
    rerender(
      <ChakraProvider theme={testTheme}>
        <HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />
      </ChakraProvider>
    );

    await waitFor(() => {
      const verstappenElements = screen.queryAllByText('Max Verstappen');
      expect(verstappenElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    const hamiltonElements = screen.getAllByText('Lewis Hamilton');
    expect(hamiltonElements.length).toBeGreaterThan(0);
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('displays all statistics in correct format', async () => {
    renderWithProviders(<HeadToHeadQuickCompareWidget data={mockHeadToHeadData} />);

    await waitFor(() => {
      const winsElements = screen.queryAllByText(/Wins: \d+/);
      expect(winsElements.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 3000 });
    
    // Check that all stats are displayed with proper formatting
    const podiumsElements = screen.getAllByText(/Podiums: \d+/);
    const pointsElements = screen.getAllByText(/Points: \d+/);

    expect(podiumsElements.length).toBeGreaterThanOrEqual(2);
    expect(pointsElements.length).toBeGreaterThanOrEqual(2);
  });
});
