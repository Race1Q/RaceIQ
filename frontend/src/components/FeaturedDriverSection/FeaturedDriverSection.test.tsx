import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import FeaturedDriverSection from './FeaturedDriverSection';

// Mock the external dependencies
vi.mock('../../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Lewis Hamilton': 'https://example.com/hamilton.jpg',
    'Max Verstappen': 'https://example.com/verstappen.jpg',
  },
}));

vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Mercedes': '00D2BE',
    'Red Bull Racing': '3671C6',
    'Default': 'FFFFFF',
  },
}));

vi.mock('../../lib/countryCodeUtils', () => ({
  countryCodeMap: {
    'GB': 'GB',
    'NL': 'NL',
    'ES': 'ES',
    'FR': 'FR',
  },
}));

vi.mock('react-country-flag', () => ({
  default: ({ countryCode, title, style }: { countryCode: string; title: string; style: any }) => (
    <div 
      data-testid={`flag-${countryCode}`} 
      title={title}
      style={style}
    >
      Flag: {countryCode.toUpperCase()}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Trophy: ({ className }: { className?: string }) => (
    <div data-testid="trophy-icon" className={className}>Trophy</div>
  ),
  Award: ({ className }: { className?: string }) => (
    <div data-testid="award-icon" className={className}>Award</div>
  ),
  Timer: ({ className }: { className?: string }) => (
    <div data-testid="timer-icon" className={className}>Timer</div>
  ),
  Star: ({ className }: { className?: string }) => (
    <div data-testid="star-icon" className={className}>Star</div>
  ),
}));

// Helper function to render with Chakra UI
function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('FeaturedDriverSection Component', () => {
  const mockFeaturedDriver = {
    id: 1,
    fullName: 'Lewis Hamilton',
    driverNumber: 44,
    countryCode: 'GB',
    teamName: 'Mercedes',
    seasonPoints: 250,
    seasonWins: 8,
    position: 2,
    careerStats: {
      wins: 103,
      podiums: 197,
      poles: 104,
      totalPoints: 4634,
      fastestLaps: 61,
      racesCompleted: 332,
    },
  };

  const mockFeaturedDriverWithRecentForm = {
    ...mockFeaturedDriver,
    recentForm: [
      { position: 1, raceName: 'Monaco Grand Prix', countryCode: 'MC' },
      { position: 2, raceName: 'Spanish Grand Prix', countryCode: 'ES' },
      { position: 3, raceName: 'French Grand Prix', countryCode: 'FR' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing when featuredDriver is provided', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    expect(screen.getByText('Featured Driver')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
  });

  it('returns null when featuredDriver is null', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={null} isError={false} />
    );
    
    // Check that the component content is not rendered (only ChakraProvider wrapper remains)
    expect(screen.queryByText('Featured Driver')).not.toBeInTheDocument();
  });

  it('renders driver information correctly', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('Mercedes • #44')).toBeInTheDocument();
    // Position is split across multiple elements, check for both parts
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders season stats correctly', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`${currentYear} Season`)).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument(); // seasonPoints
    expect(screen.getByText('8')).toBeInTheDocument(); // seasonWins
    expect(screen.getByText('Points')).toBeInTheDocument();
    // "Wins" appears multiple times, use getAllByText
    expect(screen.getAllByText('Wins')).toHaveLength(2); // season and career wins
  });

  it('renders career stats correctly', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    expect(screen.getByText('Career Stats')).toBeInTheDocument();
    expect(screen.getByText('103')).toBeInTheDocument(); // career wins
    expect(screen.getByText('197')).toBeInTheDocument(); // career podiums
    expect(screen.getByText('104')).toBeInTheDocument(); // career poles
  });

  it('renders driver image with correct attributes', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    const image = screen.getByAltText('Lewis Hamilton');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/hamilton.jpg');
  });

  it('renders error badge when isError is true', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={true} />
    );
    
    expect(screen.getByText('Live Data Unavailable')).toBeInTheDocument();
  });

  it('does not render error badge when isError is false', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    expect(screen.queryByText('Live Data Unavailable')).not.toBeInTheDocument();
  });

  it('handles driver without driver number', () => {
    const driverWithoutNumber = {
      ...mockFeaturedDriver,
      driverNumber: null,
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={driverWithoutNumber} isError={false} />
    );
    
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.queryByText('#44')).not.toBeInTheDocument();
  });

  it('renders recent form section when available', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriverWithRecentForm} isError={false} />
    );
    
    expect(screen.getByText('Recent Form')).toBeInTheDocument();
    expect(screen.getByText('Monaco GP')).toBeInTheDocument();
    expect(screen.getByText('Spanish GP')).toBeInTheDocument();
    expect(screen.getByText('French GP')).toBeInTheDocument();
  });

  it('renders country flags in recent form', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriverWithRecentForm} isError={false} />
    );
    
    expect(screen.getByTestId('flag-mc')).toBeInTheDocument();
    expect(screen.getByTestId('flag-es')).toBeInTheDocument();
    expect(screen.getByTestId('flag-fr')).toBeInTheDocument();
  });

  it('displays correct position indicators in recent form', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriverWithRecentForm} isError={false} />
    );
    
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
    expect(screen.getByText('P3')).toBeInTheDocument();
  });

  it('handles missing recent form gracefully', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    expect(screen.queryByText('Recent Form')).not.toBeInTheDocument();
  });

  it('renders with different team names', () => {
    const redBullDriver = {
      ...mockFeaturedDriver,
      fullName: 'Max Verstappen',
      teamName: 'Red Bull Racing',
      driverNumber: 1,
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={redBullDriver} isError={false} />
    );
    
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing • #1')).toBeInTheDocument();
  });

  it('handles zero values in stats', () => {
    const driverWithZeroStats = {
      ...mockFeaturedDriver,
      seasonPoints: 0,
      seasonWins: 0,
      careerStats: {
        wins: 0,
        podiums: 0,
        poles: 0,
        totalPoints: 0,
        fastestLaps: 0,
        racesCompleted: 0,
      },
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={driverWithZeroStats} isError={false} />
    );
    
    expect(screen.getAllByText('0')).toHaveLength(5); // season points, season wins, career wins, podiums, poles
  });

  it('renders all required icons', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    expect(screen.getAllByTestId('star-icon')).toHaveLength(1);
    expect(screen.getAllByTestId('trophy-icon')).toHaveLength(2); // season wins and career wins
    expect(screen.getAllByTestId('award-icon')).toHaveLength(1);
    expect(screen.getAllByTestId('timer-icon')).toHaveLength(1);
  });

  it('maintains proper heading structure', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockFeaturedDriver} isError={false} />
    );
    
    const sectionHeading = screen.getByRole('heading', { level: 4 });
    expect(sectionHeading).toHaveTextContent('Featured Driver');
    
    // Use getAllByRole for multiple H3 headings
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBeGreaterThanOrEqual(2);
    
    const seasonHeading = h3Headings.find(heading => 
      heading.textContent?.includes('Season')
    );
    expect(seasonHeading).toBeInTheDocument();
  });

  it('handles empty recent form array', () => {
    const driverWithEmptyRecentForm = {
      ...mockFeaturedDriver,
      recentForm: [],
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={driverWithEmptyRecentForm} isError={false} />
    );
    
    expect(screen.queryByText('Recent Form')).not.toBeInTheDocument();
  });

  it('handles undefined recent form', () => {
    const driverWithUndefinedRecentForm = {
      ...mockFeaturedDriver,
      recentForm: undefined,
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={driverWithUndefinedRecentForm} isError={false} />
    );
    
    expect(screen.queryByText('Recent Form')).not.toBeInTheDocument();
  });
});

describe('FeaturedDriverSection Integration Tests', () => {
  const mockDriver = {
    id: 1,
    fullName: 'Lewis Hamilton',
    driverNumber: 44,
    countryCode: 'GB',
    teamName: 'Mercedes',
    seasonPoints: 250,
    seasonWins: 8,
    position: 2,
    careerStats: {
      wins: 103,
      podiums: 197,
      poles: 104,
      totalPoints: 4634,
      fastestLaps: 61,
      racesCompleted: 332,
    },
  };

  it('works correctly with Chakra UI theme', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockDriver} isError={false} />
    );
    
    // Component should render without theme-related errors
    expect(screen.getByText('Featured Driver')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
  });

  it('maintains accessibility with proper heading structure', () => {
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockDriver} isError={false} />
    );
    
    // Check that headings are properly structured
    const sectionHeading = screen.getByRole('heading', { level: 4 });
    expect(sectionHeading).toBeInTheDocument();
    expect(sectionHeading).toHaveTextContent('Featured Driver');
    
    // Use getAllByRole for multiple H3 headings
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBeGreaterThanOrEqual(2);
  });

  it('renders multiple instances correctly', () => {
    const { unmount: unmount1 } = renderWithProviders(
      <FeaturedDriverSection featuredDriver={mockDriver} isError={false} />
    );
    
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    
    unmount1();
    
    const redBullDriver = {
      ...mockDriver,
      fullName: 'Max Verstappen',
      teamName: 'Red Bull Racing',
    };
    
    const { unmount: unmount2 } = renderWithProviders(
      <FeaturedDriverSection featuredDriver={redBullDriver} isError={false} />
    );
    
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing • #44')).toBeInTheDocument();
    
    unmount2();
  });
});

describe('FeaturedDriverSection Edge Cases', () => {
  it('handles driver with minimal data', () => {
    const minimalDriver = {
      id: 1,
      fullName: 'Test Driver',
      driverNumber: null,
      countryCode: null,
      teamName: 'Test Team',
      seasonPoints: 0,
      seasonWins: 0,
      position: 20,
      careerStats: {
        wins: 0,
        podiums: 0,
        poles: 0,
        totalPoints: 0,
        fastestLaps: 0,
        racesCompleted: 0,
      },
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={minimalDriver} isError={false} />
    );
    
    expect(screen.getByText('Test Driver')).toBeInTheDocument();
    expect(screen.getByText('Test Team')).toBeInTheDocument();
    // Position is split across multiple elements, check for both parts
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('handles very long driver names', () => {
    const driverWithLongName = {
      id: 1,
      fullName: 'This Is A Very Long Driver Name That Should Still Display Correctly',
      driverNumber: 99,
      countryCode: 'GB',
      teamName: 'Mercedes',
      seasonPoints: 100,
      seasonWins: 1,
      position: 5,
      careerStats: {
        wins: 5,
        podiums: 10,
        poles: 2,
        totalPoints: 500,
        fastestLaps: 3,
        racesCompleted: 50,
      },
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={driverWithLongName} isError={false} />
    );
    
    expect(screen.getByText('This Is A Very Long Driver Name That Should Still Display Correctly')).toBeInTheDocument();
  });

  it('handles special characters in team names', () => {
    const driverWithSpecialTeam = {
      id: 1,
      fullName: 'Test Driver',
      driverNumber: 1,
      countryCode: 'GB',
      teamName: 'Team & Co. (Special)',
      seasonPoints: 50,
      seasonWins: 1,
      position: 10,
      careerStats: {
        wins: 1,
        podiums: 5,
        poles: 1,
        totalPoints: 100,
        fastestLaps: 1,
        racesCompleted: 20,
      },
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={driverWithSpecialTeam} isError={false} />
    );
    
    expect(screen.getByText('Team & Co. (Special) • #1')).toBeInTheDocument();
  });

  it('handles high position numbers', () => {
    const driverWithHighPosition = {
      id: 1,
      fullName: 'Test Driver',
      driverNumber: 99,
      countryCode: 'GB',
      teamName: 'Test Team',
      seasonPoints: 1,
      seasonWins: 0,
      position: 99,
      careerStats: {
        wins: 0,
        podiums: 0,
        poles: 0,
        totalPoints: 1,
        fastestLaps: 0,
        racesCompleted: 1,
      },
    };
    
    renderWithProviders(
      <FeaturedDriverSection featuredDriver={driverWithHighPosition} isError={false} />
    );
    
    // Position is split across multiple elements, check for both parts
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
  });
});
