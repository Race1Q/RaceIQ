import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock react-country-flag
vi.mock('react-country-flag', () => ({
  default: ({ countryCode, title, style }: { countryCode: string; title?: string; style?: any }) => (
    <div data-testid="country-flag" data-country={countryCode} title={title} style={style}>
      Flag for {countryCode}
    </div>
  ),
}));

// Mock countryCodeMap
vi.mock('../../lib/countryCodeUtils', () => ({
  countryCodeMap: {
    'NED': 'NL',
    'MEX': 'MX',
    'ESP': 'ES',
    'GBR': 'GB',
    'MON': 'MC',
    'BEL': 'BE',
    'ITA': 'IT',
    'FRA': 'FR',
    'GER': 'DE',
    'AUT': 'AT',
    'USA': 'US',
    'CAN': 'CA',
    'AUS': 'AU',
    'JPN': 'JP',
    'BRA': 'BR',
    'SAU': 'SA',
    'BHR': 'BH',
  },
  getCountryFlagUrl: vi.fn((countryCode: string) => {
    if (countryCode === 'NED') return 'https://flagcdn.com/nl.svg';
    if (countryCode === 'MEX') return 'https://flagcdn.com/mx.svg';
    if (countryCode === 'ESP') return 'https://flagcdn.com/es.svg';
    return null;
  }),
}));

import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { RaceCard } from './RaceCard';
import type { RaceWithPodium } from '../../hooks/useHomePageData';
import type { RaceStatus } from './RaceSlider';

// Create a minimal theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  semanticTokens: {
    colors: {
      'bg-surface-raised': { _light: 'white', _dark: 'gray.700' },
      'text-primary': { _light: 'gray.900', _dark: 'white' },
      'text-secondary': { _light: 'gray.600', _dark: 'gray.400' },
      'brand.red': { _light: 'red.500', _dark: 'red.400' },
    },
  },
});

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
}

// Mock race data
const mockRace: RaceWithPodium = {
  id: 1,
  name: 'Bahrain Grand Prix',
  round: 1,
  date: '2024-03-02',
  circuit: {
    id: 1,
    name: 'Bahrain International Circuit',
    country_code: 'BHR',
  },
  podium: [
    { position: 1, driverName: 'Max Verstappen', countryCode: 'NED' },
    { position: 2, driverName: 'Sergio Perez', countryCode: 'MEX' },
    { position: 3, driverName: 'Carlos Sainz', countryCode: 'ESP' },
  ],
};

const mockRaceWithoutPodium: RaceWithPodium = {
  id: 2,
  name: 'Saudi Arabian Grand Prix',
  round: 2,
  date: '2024-03-09',
  circuit: {
    id: 2,
    name: 'Jeddah Corniche Circuit',
    country_code: 'SAU',
  },
  podium: null,
};

describe('RaceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="live" />
    );
    
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
  });

  it('displays race name correctly', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="live" />
    );
    
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
  });

  it('displays formatted date correctly', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="live" />
    );
    
    expect(screen.getByText('02/03/2024')).toBeInTheDocument();
  });

  it('shows correct status badge for live race', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="live" />
    );
    
    expect(screen.getByText('Live Now')).toBeInTheDocument();
  });

  it('shows correct status badge for upcoming race', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="next-upcoming" />
    );
    
    expect(screen.getByText('Up Next')).toBeInTheDocument();
  });

  it('shows correct status badge for future race', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="future" />
    );
    
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('shows correct status badge for past race', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="past" />
    );
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows correct status badge for previous race', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="previous" />
    );
    
    expect(screen.getByText('Previous Race')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays podium results for past races', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="past" />
    );
    
    // Check for podium positions
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check for driver names
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Sergio Perez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
  });

  it('displays podium results for previous races', () => {
    renderWithProviders(
      <RaceCard race={mockRace} isActive={true} status="previous" />
    );
    
    // Check for podium positions
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not display podium for future races', () => {
    renderWithProviders(
      <RaceCard race={mockRaceWithoutPodium} isActive={true} status="future" />
    );
    
    // Should not show podium positions
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('handles race without podium data', () => {
    renderWithProviders(
      <RaceCard race={mockRaceWithoutPodium} isActive={true} status="past" />
    );
    
    expect(screen.getByText('Saudi Arabian Grand Prix')).toBeInTheDocument();
    expect(screen.getByText('09/03/2024')).toBeInTheDocument();
  });

  it('handles different date formats', () => {
    const raceWithTime = { ...mockRace, date: '2024-03-02T14:00:00Z' };
    
    renderWithProviders(
      <RaceCard race={raceWithTime} isActive={true} status="live" />
    );
    
    expect(screen.getByText('02/03/2024')).toBeInTheDocument();
  });

  it('handles empty podium array', () => {
    const raceWithEmptyPodium = { ...mockRace, podium: [] };
    
    renderWithProviders(
      <RaceCard race={raceWithEmptyPodium} isActive={true} status="past" />
    );
    
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    // Should not show podium positions
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('handles podium with missing country codes', () => {
    const raceWithMissingCountryCodes = {
      ...mockRace,
      podium: [
        { position: 1, driverName: 'Max Verstappen', countryCode: undefined },
        { position: 2, driverName: 'Sergio Perez', countryCode: 'MEX' },
        { position: 3, driverName: 'Carlos Sainz', countryCode: undefined },
      ],
    };
    
    renderWithProviders(
      <RaceCard race={raceWithMissingCountryCodes} isActive={true} status="past" />
    );
    
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Sergio Perez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Sainz')).toBeInTheDocument();
  });

  it('handles podium with missing driver names', () => {
    const raceWithMissingDriverNames = {
      ...mockRace,
      podium: [
        { position: 1, driverName: '', countryCode: 'NED' },
        { position: 2, driverName: 'Sergio Perez', countryCode: 'MEX' },
        { position: 3, driverName: '', countryCode: 'ESP' },
      ],
    };
    
    renderWithProviders(
      <RaceCard race={raceWithMissingDriverNames} isActive={true} status="past" />
    );
    
    expect(screen.getByText('Sergio Perez')).toBeInTheDocument();
  });

  it('handles different race names', () => {
    const raceWithDifferentName = { ...mockRace, name: 'Monaco Grand Prix' };
    
    renderWithProviders(
      <RaceCard race={raceWithDifferentName} isActive={true} status="live" />
    );
    
    expect(screen.getByText('Monaco Grand Prix')).toBeInTheDocument();
  });

  it('handles very long race names', () => {
    const raceWithLongName = { 
      ...mockRace, 
      name: 'Very Long Race Name That Should Be Displayed Properly Without Breaking The Layout Grand Prix' 
    };
    
    renderWithProviders(
      <RaceCard race={raceWithLongName} isActive={true} status="live" />
    );
    
    expect(screen.getByText('Very Long Race Name That Should Be Displayed Properly Without Breaking The Layout Grand Prix')).toBeInTheDocument();
  });

  it('handles race names with special characters', () => {
    const raceWithSpecialChars = { ...mockRace, name: 'São Paulo Grand Prix' };
    
    renderWithProviders(
      <RaceCard race={raceWithSpecialChars} isActive={true} status="live" />
    );
    
    expect(screen.getByText('São Paulo Grand Prix')).toBeInTheDocument();
  });

  it('handles empty race name', () => {
    const raceWithEmptyName = { ...mockRace, name: '' };
    
    renderWithProviders(
      <RaceCard race={raceWithEmptyName} isActive={true} status="live" />
    );
    
    // Should still render the component structure
    expect(screen.getByText('02/03/2024')).toBeInTheDocument();
  });

  it('handles invalid date strings gracefully', () => {
    const raceWithInvalidDate = { ...mockRace, date: 'invalid-date' };
    
    renderWithProviders(
      <RaceCard race={raceWithInvalidDate} isActive={true} status="live" />
    );
    
    // Should still render the component even with invalid date
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
  });
});
