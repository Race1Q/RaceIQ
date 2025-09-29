import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import KeyInfoBlocks from './KeyInfoBlocks';
import type { KeyInfo } from '../../data/types';

// Mock StatCard component
vi.mock('../StatCard/StatCard', () => ({
  default: ({ icon, label, value, description, teamColor }: any) => (
    <div 
      data-testid="stat-card"
      data-label={label}
      data-value={value}
      data-description={description}
      data-team-color={teamColor || ''}
    >
      <div data-testid="stat-card-icon">{icon}</div>
      <div data-testid="stat-card-label">{label}</div>
      <div data-testid="stat-card-value">{value}</div>
      <div data-testid="stat-card-description">{description}</div>
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Sun: (props: any) => <div data-testid="sun-icon" {...props}>Sun</div>,
  CloudRain: (props: any) => <div data-testid="cloud-rain-icon" {...props}>CloudRain</div>,
  Clock: (props: any) => <div data-testid="clock-icon" {...props}>Clock</div>,
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props}>TrendingUp</div>,
}));

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('KeyInfoBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockKeyInfo: KeyInfo = {
    weather: 'Sunny',
    fastestLap: {
      driver: 'Max Verstappen',
      time: '1:23.456'
    },
    totalOvertakes: 42
  };

  it('renders without crashing', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByText('Key Information')).toBeInTheDocument();
  });

  it('renders the title correctly', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByText('Key Information')).toBeInTheDocument();
  });

  it('renders all three StatCard components', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    const statCards = screen.getAllByTestId('stat-card');
    expect(statCards).toHaveLength(3);
  });

  it('renders weather StatCard with correct props', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    const statCards = screen.getAllByTestId('stat-card');
    const weatherCard = statCards[0]; // First card is weather
    expect(weatherCard).toHaveAttribute('data-label', 'Weather');
    expect(weatherCard).toHaveAttribute('data-value', 'Sunny');
    expect(weatherCard).toHaveAttribute('data-description', 'Race conditions');
  });

  it('renders fastest lap StatCard with correct props', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    const fastestLapCard = screen.getAllByTestId('stat-card')[1];
    expect(fastestLapCard).toHaveAttribute('data-label', 'Fastest Lap');
    expect(fastestLapCard).toHaveAttribute('data-value', '1:23.456');
    expect(fastestLapCard).toHaveAttribute('data-description', 'by Max Verstappen');
  });

  it('renders overtakes StatCard with correct props', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    const overtakesCard = screen.getAllByTestId('stat-card')[2];
    expect(overtakesCard).toHaveAttribute('data-label', 'Overtakes');
    expect(overtakesCard).toHaveAttribute('data-value', '42');
    expect(overtakesCard).toHaveAttribute('data-description', 'Total overtakes');
  });

  it('renders correct weather icon for sunny weather', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('renders correct weather icon for rain weather', () => {
    const rainyKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      weather: 'Rain'
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={rainyKeyInfo} />);
    
    expect(screen.getByTestId('cloud-rain-icon')).toBeInTheDocument();
  });

  it('renders correct weather icon for cloudy weather', () => {
    const cloudyKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      weather: 'Cloudy'
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={cloudyKeyInfo} />);
    
    expect(screen.getByTestId('cloud-rain-icon')).toBeInTheDocument();
  });

  it('renders correct weather icon for case-insensitive weather', () => {
    const caseInsensitiveKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      weather: 'RAIN'
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={caseInsensitiveKeyInfo} />);
    
    expect(screen.getByTestId('cloud-rain-icon')).toBeInTheDocument();
  });

  it('renders default sun icon for unknown weather', () => {
    const unknownWeatherKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      weather: 'Unknown'
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={unknownWeatherKeyInfo} />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('renders clock icon for fastest lap', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('renders trending up icon for overtakes', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('passes teamColor prop to StatCard components', () => {
    const teamColor = '#FF0000';
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} teamColor={teamColor} />);
    
    const statCards = screen.getAllByTestId('stat-card');
    statCards.forEach(card => {
      expect(card).toHaveAttribute('data-team-color', teamColor);
    });
  });

  it('handles missing teamColor prop', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    const statCards = screen.getAllByTestId('stat-card');
    statCards.forEach(card => {
      expect(card).toHaveAttribute('data-team-color', '');
    });
  });

  it('handles different fastest lap data', () => {
    const differentKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      fastestLap: {
        driver: 'Lewis Hamilton',
        time: '1:24.123'
      }
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={differentKeyInfo} />);
    
    const fastestLapCard = screen.getAllByTestId('stat-card')[1];
    expect(fastestLapCard).toHaveAttribute('data-value', '1:24.123');
    expect(fastestLapCard).toHaveAttribute('data-description', 'by Lewis Hamilton');
  });

  it('handles zero overtakes', () => {
    const zeroOvertakesKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      totalOvertakes: 0
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={zeroOvertakesKeyInfo} />);
    
    const overtakesCard = screen.getAllByTestId('stat-card')[2];
    expect(overtakesCard).toHaveAttribute('data-value', '0');
  });

  it('handles large overtake numbers', () => {
    const largeOvertakesKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      totalOvertakes: 999
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={largeOvertakesKeyInfo} />);
    
    const overtakesCard = screen.getAllByTestId('stat-card')[2];
    expect(overtakesCard).toHaveAttribute('data-value', '999');
  });

  it('handles different weather conditions', () => {
    const weatherConditions = ['Sunny', 'Rain', 'Cloudy', 'Overcast', 'Stormy'];
    
    weatherConditions.forEach(weather => {
      const keyInfo: KeyInfo = {
        ...mockKeyInfo,
        weather
      };
      
      const { unmount } = renderWithChakra(<KeyInfoBlocks keyInfo={keyInfo} />);
      
      const statCards = screen.getAllByTestId('stat-card');
      const weatherCard = statCards[0]; // First card is weather
      expect(weatherCard).toHaveAttribute('data-value', weather);
      
      unmount();
    });
  });

  it('handles special characters in driver names', () => {
    const specialCharKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      fastestLap: {
        driver: 'José María López',
        time: '1:25.789'
      }
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={specialCharKeyInfo} />);
    
    const fastestLapCard = screen.getAllByTestId('stat-card')[1];
    expect(fastestLapCard).toHaveAttribute('data-description', 'by José María López');
  });

  it('handles long lap times', () => {
    const longLapTimeKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      fastestLap: {
        driver: 'Test Driver',
        time: '2:15.123456'
      }
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={longLapTimeKeyInfo} />);
    
    const fastestLapCard = screen.getAllByTestId('stat-card')[1];
    expect(fastestLapCard).toHaveAttribute('data-value', '2:15.123456');
  });

  it('maintains proper component structure', () => {
    const { container } = renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    // Check main container exists
    const mainContainer = container.firstChild;
    expect(mainContainer).toBeInTheDocument();
    
    // Check title exists
    expect(screen.getByText('Key Information')).toBeInTheDocument();
    
    // Check all StatCards exist
    expect(screen.getAllByTestId('stat-card')).toHaveLength(3);
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByText('Key Information')).toBeInTheDocument();
    expect(screen.getAllByTestId('stat-card')).toHaveLength(3);
    
    rerender(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByText('Key Information')).toBeInTheDocument();
    expect(screen.getAllByTestId('stat-card')).toHaveLength(3);
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    expect(screen.getByText('Key Information')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Key Information')).not.toBeInTheDocument();
  });

  it('handles edge case with minimal data', () => {
    const minimalKeyInfo: KeyInfo = {
      weather: '',
      fastestLap: {
        driver: '',
        time: ''
      },
      totalOvertakes: 0
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={minimalKeyInfo} />);
    
    expect(screen.getByText('Key Information')).toBeInTheDocument();
    expect(screen.getAllByTestId('stat-card')).toHaveLength(3);
  });

  it('handles negative overtake values', () => {
    const negativeOvertakesKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      totalOvertakes: -5
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={negativeOvertakesKeyInfo} />);
    
    const overtakesCard = screen.getAllByTestId('stat-card')[2];
    expect(overtakesCard).toHaveAttribute('data-value', '-5');
  });

  it('handles very long driver names', () => {
    const longDriverNameKeyInfo: KeyInfo = {
      ...mockKeyInfo,
      fastestLap: {
        driver: 'Very Long Driver Name That Exceeds Normal Length',
        time: '1:30.000'
      }
    };
    
    renderWithChakra(<KeyInfoBlocks keyInfo={longDriverNameKeyInfo} />);
    
    const fastestLapCard = screen.getAllByTestId('stat-card')[1];
    expect(fastestLapCard).toHaveAttribute('data-description', 'by Very Long Driver Name That Exceeds Normal Length');
  });

  it('handles different time formats', () => {
    const timeFormats = ['1:23.456', '1:23:456', '23.456', '1.23.456'];
    
    timeFormats.forEach(time => {
      const keyInfo: KeyInfo = {
        ...mockKeyInfo,
        fastestLap: {
          driver: 'Test Driver',
          time
        }
      };
      
      const { unmount } = renderWithChakra(<KeyInfoBlocks keyInfo={keyInfo} />);
      
      const fastestLapCard = screen.getAllByTestId('stat-card')[1];
      expect(fastestLapCard).toHaveAttribute('data-value', time);
      
      unmount();
    });
  });

  it('renders all required icons for each stat', () => {
    renderWithChakra(<KeyInfoBlocks keyInfo={mockKeyInfo} />);
    
    // Weather should have Sun icon (for sunny weather)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    
    // Fastest Lap should have Clock icon
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    
    // Overtakes should have TrendingUp icon
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('handles weather icon switching correctly', () => {
    // Test sunny weather
    const sunnyKeyInfo: KeyInfo = { ...mockKeyInfo, weather: 'Sunny' };
    const { unmount: unmount1 } = renderWithChakra(<KeyInfoBlocks keyInfo={sunnyKeyInfo} />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    unmount1();
    
    // Test rainy weather
    const rainyKeyInfo: KeyInfo = { ...mockKeyInfo, weather: 'Rain' };
    const { unmount: unmount2 } = renderWithChakra(<KeyInfoBlocks keyInfo={rainyKeyInfo} />);
    expect(screen.getByTestId('cloud-rain-icon')).toBeInTheDocument();
    unmount2();
    
    // Test cloudy weather
    const cloudyKeyInfo: KeyInfo = { ...mockKeyInfo, weather: 'Cloudy' };
    renderWithChakra(<KeyInfoBlocks keyInfo={cloudyKeyInfo} />);
    expect(screen.getByTestId('cloud-rain-icon')).toBeInTheDocument();
  });
});
