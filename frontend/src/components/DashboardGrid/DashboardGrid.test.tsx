import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import DashboardGrid from './DashboardGrid';

// CSS module safety
vi.mock('./DashboardGrid.module.css', () => ({
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

// Tolerant mock for DriverDetailProfile — don't crash if prop shape changes
vi.mock('../DriverDetailProfile/DriverDetailProfile', () => ({
  default: ({ name, team, imageUrl, funFact }: any) => (
    <section
      data-testid="driver-detail-profile"
      data-driver-id=""
      data-driver-name={name || ''}
    />
  ),
}));

// Mock StatCard and charts to visible elements that capture props
vi.mock('../StatCard/StatCard', () => ({
  default: ({ value }: any) => <div data-testid="stat-card" data-value={String(value ?? '')} />,
}));

vi.mock('../WinsPerSeasonChart/WinsPerSeasonChart', () => ({
  default: ({ data, teamColor }: any) => (
    <div data-testid="wins-chart" data-count={data?.length ?? 0} data-team-color={teamColor} />
  ),
}));

function renderWithChakra(ui: React.ReactNode) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

const driver = {
  id: 'max',
  name: 'Max Verstappen',
  team: 'Red Bull',
  stats: { wins: 10, podiums: 15, fastestLaps: 6 },
  winsPerSeason: [{ season: 2023, wins: 10 }],
  lapByLap: [{ lap: 1, time: 75.123 }],
};

describe('DashboardGrid', () => {
  it('renders profile, stat cards, and charts with correct props', () => {
    renderWithChakra(
      <DashboardGrid driver={driver as any} />
    );

    const profile = screen.getByTestId('driver-detail-profile');
    expect(profile).toHaveAttribute('data-driver-name', 'Max Verstappen');

    const statCards = screen.getAllByTestId('stat-card');
    expect(statCards).toHaveLength(3);

    const winsChart = screen.getByTestId('wins-chart');
    expect(winsChart).toHaveAttribute('data-count', '1');
  });

  it('falls back to default team color (#e10600) when team is not in map', () => {
    const unknownTeamDriver = { ...driver, team: 'Some New Team' };
    renderWithChakra(<DashboardGrid driver={unknownTeamDriver as any} />);

    const winsChart = screen.getByTestId('wins-chart');

    const defaultColor = '#e10600';
    expect(winsChart.getAttribute('data-team-color')?.toLowerCase()).toBe(defaultColor);
  });
});
