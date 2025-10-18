import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Drivers from './Drivers';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0 - simple approach like existing tests
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      sub: 'auth0|123456789',
      name: 'Test User',
      email: 'test@example.com',
    },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
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

// Mock the drivers data hook - simple approach
vi.mock('../../hooks/useDriversData', () => ({
  useDriversData: () => ({
    loading: false,
    error: null,
    isFallback: false,
    orderedTeamNames: ['Red Bull Racing', 'Ferrari', 'McLaren'],
    groupedDrivers: {
      'Red Bull Racing': [
        {
          id: 1,
          fullName: 'Max Verstappen',
          driverNumber: 1,
          countryCode: 'NED',
          teamName: 'Red Bull Racing',
          headshotUrl: 'max.jpg',
          teamColor: '#E10600',
        },
        {
          id: 2,
          fullName: 'Sergio Perez',
          driverNumber: 11,
          countryCode: 'MEX',
          teamName: 'Red Bull Racing',
          headshotUrl: 'perez.jpg',
          teamColor: '#E10600',
        },
      ],
      'Ferrari': [
        {
          id: 3,
          fullName: 'Charles Leclerc',
          driverNumber: 16,
          countryCode: 'MON',
          teamName: 'Ferrari',
          headshotUrl: 'leclerc.jpg',
          teamColor: '#DC0000',
        },
        {
          id: 4,
          fullName: 'Carlos Sainz',
          driverNumber: 55,
          countryCode: 'ESP',
          teamName: 'Ferrari',
          headshotUrl: 'sainz.jpg',
          teamColor: '#DC0000',
        },
      ],
      'McLaren': [
        {
          id: 5,
          fullName: 'Lando Norris',
          driverNumber: 4,
          countryCode: 'GBR',
          teamName: 'McLaren',
          headshotUrl: 'norris.jpg',
          teamColor: '#FF8700',
        },
        {
          id: 6,
          fullName: 'Oscar Piastri',
          driverNumber: 81,
          countryCode: 'AUS',
          teamName: 'McLaren',
          headshotUrl: 'piastri.jpg',
          teamColor: '#FF8700',
        },
      ],
    },
  }),
}));

// Mock all the components to avoid complex rendering
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

vi.mock('../../components/DriverProfileCard/DriverProfileCard', () => ({
  default: ({ driver }: any) => (
    <div data-testid="driver-card">
      <div data-testid="driver-name">{driver?.name || 'Unknown Driver'}</div>
      <div data-testid="driver-number">#{driver?.number || 'N/A'}</div>
      <div data-testid="driver-team">{driver?.team || 'Unknown Team'}</div>
    </div>
  ),
}));

vi.mock('../../components/TeamBanner/TeamBanner', () => ({
  default: ({ teamName }: any) => (
    <div data-testid="team-banner">
      <h2 data-testid="team-name">{teamName}</h2>
    </div>
  ),
}));

// Mock team colors
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': 'E10600',
    'Ferrari': 'DC0000',
    'McLaren': 'FF8700',
    'Default': '666666',
  },
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

function renderPage(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <ThemeColorProvider>
          {ui}
        </ThemeColorProvider>
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe('Drivers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders team filter tabs for all teams', () => {
    renderPage(<Drivers />);

    // Check that all team filter tabs are rendered (they have role="tab")
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Red Bull Racing' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Ferrari' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'McLaren' })).toBeInTheDocument();
  });

  it('renders driver cards for all teams when All is selected', () => {
    renderPage(<Drivers />);

    // Check that driver cards are rendered for all teams
    const driverCards = screen.getAllByTestId('driver-card');
    expect(driverCards).toHaveLength(6); // 2 drivers per team × 3 teams
    
    // Check specific driver names
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Sergio Perez')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
    expect(screen.getByText('Lando Norris')).toBeInTheDocument();
    expect(screen.getByText('Oscar Piastri')).toBeInTheDocument();
  });

  it('renders team banners for all teams', () => {
    renderPage(<Drivers />);

    const teamBanners = screen.getAllByTestId('team-banner');
    expect(teamBanners).toHaveLength(3);
    
    // Check team names in banners specifically (not in buttons or driver cards)
    const teamNames = screen.getAllByTestId('team-name');
    expect(teamNames).toHaveLength(3);
    expect(teamNames[0]).toHaveTextContent('Red Bull Racing');
    expect(teamNames[1]).toHaveTextContent('Ferrari');
    expect(teamNames[2]).toHaveTextContent('McLaren');
  });

  it('renders driver information correctly', () => {
    renderPage(<Drivers />);

    // Check that driver information is displayed
    const driverNames = screen.getAllByTestId('driver-name');
    const driverNumbers = screen.getAllByTestId('driver-number');
    const driverTeams = screen.getAllByTestId('driver-team');

    expect(driverNames).toHaveLength(6);
    expect(driverNumbers).toHaveLength(6);
    expect(driverTeams).toHaveLength(6);

    // Check specific driver details
    expect(screen.getByText('#1')).toBeInTheDocument(); // Max Verstappen
    expect(screen.getByText('#11')).toBeInTheDocument(); // Sergio Perez
    expect(screen.getByText('#16')).toBeInTheDocument(); // Charles Leclerc
  });

  it('renders proper team grouping structure', () => {
    renderPage(<Drivers />);

    // Check that teams are properly grouped
    const teamNames = screen.getAllByTestId('team-name');
    expect(teamNames).toHaveLength(3);
    
    expect(teamNames[0]).toHaveTextContent('Red Bull Racing');
    expect(teamNames[1]).toHaveTextContent('Ferrari');
    expect(teamNames[2]).toHaveTextContent('McLaren');
  });

  it('does not show loading spinner when data is loaded', () => {
    renderPage(<Drivers />);

    // Loading spinner should not be present when data is loaded
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('does not show fallback banner when not in fallback mode', () => {
    renderPage(<Drivers />);

    // Fallback banner should not be present when not in fallback mode
    expect(screen.queryByText('Live Data Unavailable. Showing cached standings.')).not.toBeInTheDocument();
  });

  it('renders all main sections for drivers page', () => {
    renderPage(<Drivers />);

    // Check that all main sections are present
    expect(screen.getAllByRole('tab')).toHaveLength(4); // All + 3 team tabs
    expect(screen.getAllByTestId('driver-card')).toHaveLength(6); // 6 drivers total
    expect(screen.getAllByTestId('team-banner')).toHaveLength(3); // 3 teams
  });

  it('renders correct number of drivers per team', () => {
    renderPage(<Drivers />);

    // Check that each team has 2 drivers
    const driverCards = screen.getAllByTestId('driver-card');
    const redBullDrivers = driverCards.filter(card => 
      card.querySelector('[data-testid="driver-name"]')?.textContent === 'Max Verstappen' ||
      card.querySelector('[data-testid="driver-name"]')?.textContent === 'Sergio Perez'
    );
    const ferrariDrivers = driverCards.filter(card => 
      card.querySelector('[data-testid="driver-name"]')?.textContent === 'Charles Leclerc' ||
      card.querySelector('[data-testid="driver-name"]')?.textContent === 'Carlos Sainz'
    );
    const mclarenDrivers = driverCards.filter(card => 
      card.querySelector('[data-testid="driver-name"]')?.textContent === 'Lando Norris' ||
      card.querySelector('[data-testid="driver-name"]')?.textContent === 'Oscar Piastri'
    );

    expect(redBullDrivers).toHaveLength(2);
    expect(ferrariDrivers).toHaveLength(2);
    expect(mclarenDrivers).toHaveLength(2);
  });

  it('renders driver cards with proper structure', () => {
    renderPage(<Drivers />);

    const driverCards = screen.getAllByTestId('driver-card');
    expect(driverCards).toHaveLength(6);

    // Check that each driver card has the expected structure
    driverCards.forEach(card => {
      expect(card.querySelector('[data-testid="driver-name"]')).toBeInTheDocument();
      expect(card.querySelector('[data-testid="driver-number"]')).toBeInTheDocument();
      expect(card.querySelector('[data-testid="driver-team"]')).toBeInTheDocument();
    });
  });
});
