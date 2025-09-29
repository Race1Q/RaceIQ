import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RaceHeader from './RaceHeader';
import type { Race } from '../../data/types';

// Mock react-country-flag
vi.mock('react-country-flag', () => ({
  default: ({ countryCode, title, style }: { countryCode: string; title: string; style: any }) => (
    <div data-testid="country-flag" data-country={countryCode} title={title} style={style}>
      Flag for {countryCode}
    </div>
  ),
}));

// Mock countryCodeUtils
vi.mock('../../lib/countryCodeUtils', () => ({
  countryCodeMap: {
    'GBR': 'GB',
    'NED': 'NL',
    'MON': 'MC',
    'GER': 'DE',
    'FRA': 'FR',
    'ESP': 'ES',
    'ITA': 'IT',
    'AUS': 'AU',
    'USA': 'US',
    'BRA': 'BR',
    'JPN': 'JP',
    'CHN': 'CN',
    'ARE': 'AE',
    'SAU': 'SA',
  },
}));

// Mock Chakra UI theme
const theme = {
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      red: '#e53e3e',
    },
  },
  components: {
    Box: {
      baseStyle: {},
    },
    Text: {
      baseStyle: {},
    },
    VStack: {
      baseStyle: {},
    },
    HStack: {
      baseStyle: {},
    },
    Heading: {
      baseStyle: {},
    },
    Divider: {
      baseStyle: {},
    },
  },
};

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
}

// Mock race data
const mockRace: Race = {
  id: '1',
  trackName: 'Silverstone Circuit',
  country: 'United Kingdom',
  countryCode: 'GBR',
  date: '2024-07-14',
  trackMapCoords: '52.0786,-1.0169',
  standings: [],
  keyInfo: {
    weather: 'Sunny',
    fastestLap: { driver: 'Lewis Hamilton', time: '1:27.369' },
    totalOvertakes: 15,
  },
  flagsTimeline: [],
  paceDistribution: [],
  tireStrategies: [],
  historicalStats: {
    lapRecord: { driver: 'Max Verstappen', time: '1:27.097' },
    previousWinner: 'Lewis Hamilton',
  },
  driverOfTheDay: 'Lewis Hamilton',
  circuitLength: 5.891,
  raceDistance: 306.198,
  totalLaps: 52,
  weather: {
    airTemp: 22,
    trackTemp: 35,
    windSpeed: 12,
    condition: 'Sunny',
  },
  lapPositions: [],
  raceControlMessages: [],
};

describe('RaceHeader', () => {
  it('renders without crashing', () => {
    renderWithProviders(<RaceHeader race={mockRace} />);
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
  });

  it('displays the track name as heading', () => {
    renderWithProviders(<RaceHeader race={mockRace} />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Silverstone Circuit');
  });

  it('displays the country name', () => {
    renderWithProviders(<RaceHeader race={mockRace} />);
    
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('displays the formatted date', () => {
    renderWithProviders(<RaceHeader race={mockRace} />);
    
    // The date should be formatted as a readable string
    expect(screen.getByText(/Sunday, July 14, 2024/)).toBeInTheDocument();
  });

  it('displays country flag with correct mapping', () => {
    renderWithProviders(<RaceHeader race={mockRace} />);
    
    const flag = screen.getByTestId('country-flag');
    expect(flag).toBeInTheDocument();
    expect(flag).toHaveAttribute('data-country', 'gb');
    expect(flag).toHaveAttribute('title', 'United Kingdom');
  });

  it('handles different country codes correctly', () => {
    const raceWithDifferentCountry: Race = {
      ...mockRace,
      country: 'Netherlands',
      countryCode: 'NED',
    };
    
    renderWithProviders(<RaceHeader race={raceWithDifferentCountry} />);
    
    const flag = screen.getByTestId('country-flag');
    expect(flag).toHaveAttribute('data-country', 'nl');
    expect(flag).toHaveAttribute('title', 'Netherlands');
    expect(screen.getByText('Netherlands')).toBeInTheDocument();
  });

  it('handles unknown country codes gracefully', () => {
    const raceWithUnknownCountry: Race = {
      ...mockRace,
      country: 'Unknown Country',
      countryCode: 'UNK',
    };
    
    renderWithProviders(<RaceHeader race={raceWithUnknownCountry} />);
    
    // Should still render a flag but with the unknown country code
    const flag = screen.getByTestId('country-flag');
    expect(flag).toBeInTheDocument();
    expect(flag).toHaveAttribute('data-country', 'unk');
    expect(screen.getByText('Unknown Country')).toBeInTheDocument();
  });

  it('handles missing country code', () => {
    const raceWithoutCountryCode: Race = {
      ...mockRace,
      countryCode: undefined as any,
    };
    
    renderWithProviders(<RaceHeader race={raceWithoutCountryCode} />);
    
    // Should not render a flag when country code is missing
    expect(screen.queryByTestId('country-flag')).not.toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('handles null country code', () => {
    const raceWithNullCountryCode: Race = {
      ...mockRace,
      countryCode: null as any,
    };
    
    renderWithProviders(<RaceHeader race={raceWithNullCountryCode} />);
    
    // Should not render a flag when country code is null
    expect(screen.queryByTestId('country-flag')).not.toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('displays calendar icon', () => {
    renderWithProviders(<RaceHeader race={mockRace} />);
    
    // Calendar icon should be present as an SVG with the lucide-calendar class
    const calendarIcon = document.querySelector('.lucide-calendar');
    expect(calendarIcon).toBeInTheDocument();
    expect(calendarIcon).toHaveClass('lucide-calendar');
  });

  it('handles different date formats', () => {
    const raceWithDifferentDate: Race = {
      ...mockRace,
      date: '2024-12-25',
    };
    
    renderWithProviders(<RaceHeader race={raceWithDifferentDate} />);
    
    expect(screen.getByText(/Wednesday, December 25, 2024/)).toBeInTheDocument();
  });

  it('handles invalid date gracefully', () => {
    const raceWithInvalidDate: Race = {
      ...mockRace,
      date: 'invalid-date',
    };
    
    renderWithProviders(<RaceHeader race={raceWithInvalidDate} />);
    
    // Should still render the component even with invalid date
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('handles very long track names', () => {
    const raceWithLongTrackName: Race = {
      ...mockRace,
      trackName: 'Very Long Track Name That Should Be Displayed Properly Without Breaking The Layout',
    };
    
    renderWithProviders(<RaceHeader race={raceWithLongTrackName} />);
    
    expect(screen.getByText('Very Long Track Name That Should Be Displayed Properly Without Breaking The Layout')).toBeInTheDocument();
  });

  it('handles very long country names', () => {
    const raceWithLongCountryName: Race = {
      ...mockRace,
      country: 'The United States of America',
    };
    
    renderWithProviders(<RaceHeader race={raceWithLongCountryName} />);
    
    expect(screen.getByText('The United States of America')).toBeInTheDocument();
  });

  it('handles special characters in track name', () => {
    const raceWithSpecialChars: Race = {
      ...mockRace,
      trackName: 'Circuit de Monaco (Monte Carlo)',
    };
    
    renderWithProviders(<RaceHeader race={raceWithSpecialChars} />);
    
    expect(screen.getByText('Circuit de Monaco (Monte Carlo)')).toBeInTheDocument();
  });

  it('handles special characters in country name', () => {
    const raceWithSpecialChars: Race = {
      ...mockRace,
      country: 'São Paulo',
    };
    
    renderWithProviders(<RaceHeader race={raceWithSpecialChars} />);
    
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
  });

  it('handles empty track name', () => {
    const raceWithEmptyTrackName: Race = {
      ...mockRace,
      trackName: '',
    };
    
    renderWithProviders(<RaceHeader race={raceWithEmptyTrackName} />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('');
  });

  it('handles empty country name', () => {
    const raceWithEmptyCountry: Race = {
      ...mockRace,
      country: '',
    };
    
    renderWithProviders(<RaceHeader race={raceWithEmptyCountry} />);
    
    // Should render the component even with empty country name
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    // Should still render the date
    expect(screen.getByText(/Sunday, July 14, 2024/)).toBeInTheDocument();
  });

  it('handles different time zones in date formatting', () => {
    const raceWithDifferentDate: Race = {
      ...mockRace,
      date: '2024-01-01T00:00:00Z',
    };
    
    renderWithProviders(<RaceHeader race={raceWithDifferentDate} />);
    
    // Should format the date correctly regardless of timezone
    expect(screen.getByText(/Monday, January 1, 2024/)).toBeInTheDocument();
  });

  it('maintains proper structure with all elements', () => {
    renderWithProviders(<RaceHeader race={mockRace} />);
    
    // Check that all main elements are present
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText(/Sunday, July 14, 2024/)).toBeInTheDocument();
    expect(screen.getByTestId('country-flag')).toBeInTheDocument();
  });

  it('handles rapid prop changes', () => {
    const { rerender } = renderWithProviders(<RaceHeader race={mockRace} />);
    
    expect(screen.getByText('Silverstone Circuit')).toBeInTheDocument();
    
    // Change to different race
    const newRace: Race = {
      ...mockRace,
      trackName: 'Monaco Circuit',
      country: 'Monaco',
      countryCode: 'MON',
      date: '2024-05-26',
    };
    
    rerender(
      <ChakraProvider theme={theme}>
        <RaceHeader race={newRace} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Monaco Circuit')).toBeInTheDocument();
    expect(screen.getByText('Monaco')).toBeInTheDocument();
    expect(screen.getByText(/Sunday, May 26, 2024/)).toBeInTheDocument();
  });

  it('handles case sensitivity in country codes', () => {
    const raceWithLowerCaseCountryCode: Race = {
      ...mockRace,
      countryCode: 'gbr', // lowercase
    };
    
    renderWithProviders(<RaceHeader race={raceWithLowerCaseCountryCode} />);
    
    const flag = screen.getByTestId('country-flag');
    expect(flag).toHaveAttribute('data-country', 'gb');
  });

  it('handles mixed case country codes', () => {
    const raceWithMixedCaseCountryCode: Race = {
      ...mockRace,
      countryCode: 'GbR', // mixed case
    };
    
    renderWithProviders(<RaceHeader race={raceWithMixedCaseCountryCode} />);
    
    const flag = screen.getByTestId('country-flag');
    expect(flag).toHaveAttribute('data-country', 'gb');
  });
});
