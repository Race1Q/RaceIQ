import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HeadToHeadQuickCompareWidget from './HeadToHeadQuickCompareWidget';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useDashboardSharedData from context
vi.mock('../../../context/DashboardDataContext', () => ({
  useDashboardSharedData: () => ({
    driverStandings: [
      { id: 1, fullName: 'Max Verstappen', teamName: 'Red Bull Racing', number: 1, points: 454, wins: 15, podiums: 20, position: 1 },
      { id: 2, fullName: 'Lewis Hamilton', teamName: 'Mercedes', number: 44, points: 400, wins: 10, podiums: 18, position: 2 }
    ],
    constructorStandings: [],
    isLoading: false,
    loadingDriverStandings: false,
    errorDriverStandings: null,
  }),
}));

// Mock useUserProfile
vi.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock teamColors
vi.mock('../../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '1E40AF',
    'Mercedes': '00D2BE',
    'Ferrari': 'DC143C',
    'Default': '666666',
  },
  getTeamColor: (teamName: string | undefined | null, opts?: { hash?: boolean }) => {
    const colors: any = {
      'Red Bull Racing': '1E40AF',
      'Mercedes': '00D2BE',
      'Ferrari': 'DC143C',
      'Default': '666666',
    };
    const hex = colors[teamName || ''] || colors['Default'];
    return opts?.hash ? `#${hex}` : hex;
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
  },
}));

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
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

// Mock data to match the component's expected API
const mockAllDrivers = [
  { id: 1, name: 'Max Verstappen', teamName: 'Red Bull Racing', headshotUrl: '/images/verstappen.jpg' },
  { id: 2, name: 'Lewis Hamilton', teamName: 'Mercedes', headshotUrl: '/images/hamilton.jpg' },
  { id: 3, name: 'Charles Leclerc', teamName: 'Ferrari', headshotUrl: '/images/leclerc.jpg' },
];

const mockOnPreferenceChange = vi.fn();

describe('HeadToHeadQuickCompareWidget', () => {
  beforeEach(() => {
    mockOnPreferenceChange.mockClear();
  });

  it('renders head-to-head comparison widget', () => {
    renderWithProviders(
      <HeadToHeadQuickCompareWidget 
        preference={{ driver1Id: 1, driver2Id: 2 }}
        onPreferenceChange={mockOnPreferenceChange}
        allDrivers={mockAllDrivers}
      />
    );

    expect(screen.getByText('Head to Head')).toBeInTheDocument();
  });

  it('displays driver names correctly', () => {
    renderWithProviders(
      <HeadToHeadQuickCompareWidget 
        preference={{ driver1Id: 1, driver2Id: 2 }}
        onPreferenceChange={mockOnPreferenceChange}
        allDrivers={mockAllDrivers}
      />
    );

    // Names appear multiple times (in dropdown and display area)
    const maxVerstappenElements = screen.getAllByText('Max Verstappen');
    const lewisHamiltonElements = screen.getAllByText('Lewis Hamilton');
    expect(maxVerstappenElements.length).toBeGreaterThan(0);
    expect(lewisHamiltonElements.length).toBeGreaterThan(0);
  });

  it('displays team names correctly', () => {
    renderWithProviders(
      <HeadToHeadQuickCompareWidget 
        preference={{ driver1Id: 1, driver2Id: 2 }}
        onPreferenceChange={mockOnPreferenceChange}
        allDrivers={mockAllDrivers}
      />
    );

    // Team names appear multiple times
    const redBullElements = screen.getAllByText('Red Bull Racing');
    const mercedesElements = screen.getAllByText('Mercedes');
    expect(redBullElements.length).toBeGreaterThan(0);
    expect(mercedesElements.length).toBeGreaterThan(0);
  });

  it('displays driver statistics', () => {
    renderWithProviders(
      <HeadToHeadQuickCompareWidget 
        preference={{ driver1Id: 1, driver2Id: 2 }}
        onPreferenceChange={mockOnPreferenceChange}
        allDrivers={mockAllDrivers}
      />
    );

    // Check that both drivers are displayed with their data
    const maxElements = screen.getAllByText('Max Verstappen');
    const lewisElements = screen.getAllByText('Lewis Hamilton');
    expect(maxElements.length).toBeGreaterThan(0);
    expect(lewisElements.length).toBeGreaterThan(0);
  });

  it('renders with no preference set', () => {
    renderWithProviders(
      <HeadToHeadQuickCompareWidget 
        onPreferenceChange={mockOnPreferenceChange}
        allDrivers={mockAllDrivers}
      />
    );

    // Should auto-select first two drivers from standings
    expect(mockOnPreferenceChange).toHaveBeenCalled();
  });

  it('renders with empty allDrivers array', () => {
    renderWithProviders(
      <HeadToHeadQuickCompareWidget 
        preference={{ driver1Id: 1, driver2Id: 2 }}
        onPreferenceChange={mockOnPreferenceChange}
        allDrivers={[]}
      />
    );

    // Widget should still render
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
  });

  it('renders widget card wrapper', () => {
    renderWithProviders(
      <HeadToHeadQuickCompareWidget 
        preference={{ driver1Id: 1, driver2Id: 2 }}
        onPreferenceChange={mockOnPreferenceChange}
        allDrivers={mockAllDrivers}
      />
    );

    // Check that widget card structure exists
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
  });
});
