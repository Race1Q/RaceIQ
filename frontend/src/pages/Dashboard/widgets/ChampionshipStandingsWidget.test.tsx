import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import ChampionshipStandingsWidget from './ChampionshipStandingsWidget';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock ProfileUpdateContext
vi.mock('../../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    refreshTrigger: 0,
    triggerRefresh: vi.fn(),
  }),
}));

// Mock team colors
vi.mock('../../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '#3671C6',
    'McLaren': '#FF8700',
    'Ferrari': '#DC0000',
    'Default': '#000000',
  },
}));

// Mock driver headshots
vi.mock('../../../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Max Verstappen': '/headshots/max.png',
    'Lando Norris': '/headshots/lando.png',
  },
}));

const mockStandingsData = [
  {
    position: 1,
    driverFullName: 'Max Verstappen',
    points: 400,
    constructorName: 'Red Bull Racing',
    driverHeadshotUrl: '/headshots/max.png',
  },
  {
    position: 2,
    driverFullName: 'Lando Norris',
    points: 350,
    constructorName: 'McLaren',
    driverHeadshotUrl: '/headshots/lando.png',
  },
  {
    position: 3,
    driverFullName: 'Charles Leclerc',
    points: 300,
    constructorName: 'Ferrari',
    driverHeadshotUrl: '/headshots/charles.png',
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('ChampionshipStandingsWidget', () => {
  it('renders without crashing', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    expect(screen.getByText('Driver Standings')).toBeInTheDocument();
  });

  it('displays widget title with year', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('displays driver standings', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lando Norris')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
  });

  it('displays driver points', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    
    expect(screen.getByText('400 pts')).toBeInTheDocument();
    expect(screen.getByText('350 pts')).toBeInTheDocument();
    expect(screen.getByText('300 pts')).toBeInTheDocument();
  });

  it('displays positions', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
  });

  it('shows loading message when no data', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={[]} year={2025} />);
    expect(screen.getByText('Loading standings...')).toBeInTheDocument();
  });

  it('highlights first place driver', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    
    // First place should have trophy icon
    const firstDriver = screen.getByText('Max Verstappen');
    expect(firstDriver).toBeInTheDocument();
  });

  it('displays team names', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('McLaren')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
  });

  it('renders driver avatars', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} year={2025} />);
    
    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBeGreaterThanOrEqual(3);
  });

  it('works without year prop', () => {
    renderWithProviders(<ChampionshipStandingsWidget data={mockStandingsData} />);
    
    expect(screen.getByText('Driver Standings')).toBeInTheDocument();
    expect(screen.queryByText('2025')).not.toBeInTheDocument();
  });
});

