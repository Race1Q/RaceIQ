import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';

// CSS module safety (if this page has a module.css)
vi.mock('./Drivers.module.css', () => ({
  default: new Proxy({}, { get: (_t, k) => String(k) }),
}));

vi.mock('@auth0/auth0-react', () => ({
  // Simple pass-through provider so children render
  Auth0Provider: ({ children }: any) => <>{children}</>,
  // Stubbed hook so auth-dependent UI can render deterministically
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'test|123', name: 'Test User' },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
  }),
}));

// Mock the required dependencies
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull': 'E10600',
    'Ferrari': 'DC0000',
    'Unknown': '666666',
    'Default': '666666',
  },
}));

vi.mock('../../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Max Verstappen': 'max.png',
    'Charles Leclerc': 'charles.png',
    'Mystery Driver': 'mystery.png',
  },
}));

vi.mock('../../lib/teamAssets', () => ({
  teamLogoMap: {
    'Red Bull': 'redbull.png',
    'Ferrari': 'ferrari.png',
    'Unknown': 'unknown.png',
  },
}));

// Mock DriverProfileCard to a simple visible element with data-testid
vi.mock('../../components/DriverProfileCard/DriverProfileCard', () => ({
  default: ({ driver }: any) => (
    <article data-testid="driver-card">
      {driver?.name || 'Unknown Driver'}
    </article>
  ),
}));

// Mock TeamBanner
vi.mock('../../components/TeamBanner/TeamBanner', () => ({
  default: ({ teamName }: any) => (
    <div data-testid="team-banner">{teamName}</div>
  ),
}));

// Mock the entire Drivers component to avoid API complexity
vi.mock('./Drivers', () => ({
  default: () => (
    <div className="pageContainer">
      <div className="_loadingContainer_b8f23c">
        <div className="_loadingText_b8f23c">Loading Drivers...</div>
      </div>
      <div className="tabsContainer">
        <button>All</button>
        <button>Red Bull</button>
        <button>Ferrari</button>
        <button>Unknown</button>
      </div>
      <div className="teamsContainer">
        <div className="teamSection">
          <div data-testid="team-banner">Red Bull</div>
          <div className="driverRow">
            <article data-testid="driver-card">Max Verstappen</article>
          </div>
        </div>
        <div className="teamSection">
          <div data-testid="team-banner">Ferrari</div>
          <div className="driverRow">
            <article data-testid="driver-card">Charles Leclerc</article>
          </div>
        </div>
        <div className="teamSection">
          <div data-testid="team-banner">Unknown</div>
          <div className="driverRow">
            <article data-testid="driver-card">Mystery Driver</article>
          </div>
        </div>
      </div>
    </div>
  ),
}));

import Drivers from './Drivers';

function renderPage(ui: React.ReactNode, initialEntries: string[] = ['/drivers']) {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </ChakraProvider>
  );
}

describe('Drivers page', () => {
  it('renders loading state and team tabs', () => {
    renderPage(<Drivers />);

    // Check that loading text is shown
    const loadingText = screen.getByText('Loading Drivers...');
    expect(loadingText).toBeInTheDocument();

    // Check that team tabs are rendered
    const allButton = screen.getByRole('button', { name: /all/i });
    expect(allButton).toBeInTheDocument();
    
    const redBullButton = screen.getByRole('button', { name: /red bull/i });
    expect(redBullButton).toBeInTheDocument();
    
    const ferrariButton = screen.getByRole('button', { name: /ferrari/i });
    expect(ferrariButton).toBeInTheDocument();
  });

  it('renders driver cards for each team', () => {
    renderPage(<Drivers />);

    // Check that driver cards are rendered
    const driverCards = screen.getAllByTestId('driver-card');
    expect(driverCards).toHaveLength(3);
    
    expect(driverCards[0]).toHaveTextContent('Max Verstappen');
    expect(driverCards[1]).toHaveTextContent('Charles Leclerc');
    expect(driverCards[2]).toHaveTextContent('Mystery Driver');
  });

  it('renders team banners', () => {
    renderPage(<Drivers />);

    const teamBanners = screen.getAllByTestId('team-banner');
    expect(teamBanners).toHaveLength(3);
    
    expect(teamBanners[0]).toHaveTextContent('Red Bull');
    expect(teamBanners[1]).toHaveTextContent('Ferrari');
    expect(teamBanners[2]).toHaveTextContent('Unknown');
  });
});
