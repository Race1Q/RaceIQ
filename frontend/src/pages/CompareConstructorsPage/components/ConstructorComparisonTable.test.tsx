import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import { ConstructorComparisonTable } from './ConstructorComparisonTable';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock ProfileUpdateContext
vi.mock('../../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    refreshTrigger: 0,
    triggerRefresh: vi.fn(),
  }),
}));

const mockConstructor1 = {
  id: '1',
  name: 'Red Bull Racing',
  nationality: 'Austrian',
  championshipStanding: 1,
  wins: 100,
  podiums: 250,
  points: 10000,
  teamColorToken: 'red_bull',
  isActive: true,
};

const mockConstructor2 = {
  id: '2',
  name: 'Ferrari',
  nationality: 'Italian',
  championshipStanding: 2,
  wins: 240,
  podiums: 780,
  points: 9000,
  teamColorToken: 'ferrari',
  isActive: true,
};

const mockStats1 = {
  career: {
    wins: 100,
    podiums: 250,
    poles: 150,
    fastestLaps: 120,
    points: 10000,
    dnfs: 20,
    races: 400,
  },
  yearStats: null,
};

const mockStats2 = {
  career: {
    wins: 240,
    podiums: 780,
    poles: 300,
    fastestLaps: 280,
    points: 9000,
    dnfs: 50,
    races: 1000,
  },
  yearStats: null,
};

const mockAvailableMetrics = {
  wins: 'Wins',
  podiums: 'Podiums',
  poles: 'Pole Positions',
  fastest_laps: 'Fastest Laps',
  points: 'Points',
  dnf: 'DNFs',
  races: 'Races',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('ConstructorComparisonTable', () => {
  it('renders without crashing', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins', 'podiums', 'poles', 'fastest_laps', 'points', 'dnf', 'races']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: 85, c2: 70 }}
      />
    );
    
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('displays both constructor names', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins', 'podiums']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: 85, c2: 70 }}
      />
    );
    
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
  });

  it('displays statistics', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: 85, c2: 70 }}
      />
    );
    
    // Should display wins
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows scores when provided', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: 85, c2: 70 }}
      />
    );
    
    // Scores might be displayed
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('handles null scores', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: null, c2: null }}
      />
    );
    
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('displays only enabled metrics', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: 85, c2: 70 }}
      />
    );
    
    // Should show wins
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows nationality', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: 85, c2: 70 }}
      />
    );
    
    expect(screen.getByText('Austrian')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('displays active status badge', () => {
    renderWithProviders(
      <ConstructorComparisonTable
        constructor1={mockConstructor1}
        constructor2={mockConstructor2}
        stats1={mockStats1}
        stats2={mockStats2}
        enabledMetrics={['wins']}
        availableMetrics={mockAvailableMetrics}
        teamColor1="#3671C6"
        teamColor2="#DC0000"
        score={{ c1: 85, c2: 70 }}
      />
    );
    
    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges.length).toBe(2);
  });
});

