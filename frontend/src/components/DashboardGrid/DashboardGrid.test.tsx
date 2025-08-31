import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import DashboardGrid from './DashboardGrid';

// Mock CSS module so className lookups don't crash
vi.mock('./DashboardGrid.module.css', () => ({
  default: { grid: 'grid' },
}), { virtual: true });

// Mock icons to keep DOM small
vi.mock('lucide-react', () => ({
  Trophy: (p: any) => <svg data-testid="icon-trophy" {...p} />,
  Medal: (p: any) => <svg data-testid="icon-medal" {...p} />,
  Zap: (p: any) => <svg data-testid="icon-zap" {...p} />,
}));

// Mock teamColors map
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    Ferrari: '#E10600',
    'Red Bull Racing': '#1E5BC6',
  },
}));

// Stub heavy child components to stable test doubles
vi.mock('../DriverDetailProfile/DriverDetailProfile', () => ({
  default: ({ driver }: any) => (
    <section data-testid="driver-detail-profile">
      <h2>{driver.name}</h2>
    </section>
  ),
}));

vi.mock('../StatCard/StatCard', () => ({
    default: ({ label, value, description, teamColor, icon }: any) => (
      <article
        data-testid={`stat-card-${String(label).toLowerCase().replace(/\s+/g, '-')}`}
        data-label={label}
        data-value={value}
        data-description={description}
        data-color={teamColor}
      >
        {/* render the icon so icon testIDs exist */}
        <span data-testid={`stat-icon-${String(label).toLowerCase().replace(/\s+/g, '-')}`}>
          {icon}
        </span>
        {label}:{value}
      </article>
    ),
  }));

vi.mock('../WinsPerSeasonChart/WinsPerSeasonChart', () => ({
  default: ({ data, teamColor }: any) => (
    <div data-testid="wins-per-season-chart" data-points={data?.length ?? 0} data-color={teamColor} />
  ),
}));

vi.mock('../LapByLapChart/LapByLapChart', () => ({
  default: ({ data, teamColor }: any) => (
    <div data-testid="lap-by-lap-chart" data-points={data?.length ?? 0} data-color={teamColor} />
  ),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

const driver = {
  id: 'max_verstappen',
  name: 'Max Verstappen',
  number: '1',
  team: 'Ferrari', // using a key from teamColors mock
  nationality: 'NL',
  wins: 61,
  podiums: 103,
  fastestLaps: 28,
  points: 0,
  image: 'max.png',
  funFact: 'Very fast.',
  winsPerSeason: [
    { season: '2021', wins: 10 },
    { season: '2022', wins: 15 },
    { season: '2023', wins: 19 },
  ],
  lapByLapData: [
    { lap: 1, position: 2 },
    { lap: 2, position: 1 },
    { lap: 3, position: 1 },
  ],
};

describe('DashboardGrid', () => {
  it('renders profile, stat cards, and charts with correct props', () => {
    const { container } = renderWithProviders(<DashboardGrid driver={driver} />);

    // Container has grid class from CSS module
    const gridEl = container.querySelector('.grid');
    expect(gridEl).toBeTruthy();

    // Driver profile shows the driver name
    expect(screen.getByTestId('driver-detail-profile')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /max verstappen/i })).toBeInTheDocument();

    // Stat cards (check props via data attributes)
    const wins = screen.getByTestId('stat-card-wins');
    expect(wins).toHaveAttribute('data-label', 'Wins');
    expect(wins).toHaveAttribute('data-value', String(driver.wins));
    expect(wins).toHaveAttribute('data-description', 'Career victories');
    expect(wins).toHaveAttribute('data-color', '#E10600'); // Ferrari color from mock

    const podiums = screen.getByTestId('stat-card-podiums');
    expect(podiums).toHaveAttribute('data-label', 'Podiums');
    expect(podiums).toHaveAttribute('data-value', String(driver.podiums));
    expect(podiums).toHaveAttribute('data-description', 'Top 3 finishes');
    expect(podiums).toHaveAttribute('data-color', '#E10600');

    const flaps = screen.getByTestId('stat-card-fastest-laps');
    expect(flaps).toHaveAttribute('data-label', 'Fastest Laps');
    expect(flaps).toHaveAttribute('data-value', String(driver.fastestLaps));
    expect(flaps).toHaveAttribute('data-description', 'Best lap times');
    expect(flaps).toHaveAttribute('data-color', '#E10600');

    // Charts get data length + color
    const winsChart = screen.getByTestId('wins-per-season-chart');
    expect(winsChart).toHaveAttribute('data-points', String(driver.winsPerSeason.length));
    expect(winsChart).toHaveAttribute('data-color', '#E10600');

    const lblChart = screen.getByTestId('lap-by-lap-chart');
    expect(lblChart).toHaveAttribute('data-points', String(driver.lapByLapData.length));
    expect(lblChart).toHaveAttribute('data-color', '#E10600');

    // Icons are present (stubbed svgs)
    expect(screen.getByTestId('icon-trophy')).toBeInTheDocument();
    expect(screen.getByTestId('icon-medal')).toBeInTheDocument();
    expect(screen.getByTestId('icon-zap')).toBeInTheDocument();
  });

  it('falls back to default team color (#e10600) when team is not in map', () => {
    const unknownTeamDriver = { ...driver, team: 'Unknown Team' };
    renderWithProviders(<DashboardGrid driver={unknownTeamDriver} />);

    // Any of the stat cards will do; check the color prop
    const wins = screen.getByTestId('stat-card-wins');
    expect(wins).toHaveAttribute('data-color', '#e10600'); // fallback defined in component
  });
});
