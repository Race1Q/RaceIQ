import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the styled-system module to avoid gradient parsing issues
vi.mock('@chakra-ui/styled-system', () => ({
  parseGradient: vi.fn(() => ({
    type: 'linear',
    direction: '135deg',
    stops: [
      { color: '#ff0000', position: '0%' },
      { color: '#0000ff', position: '100%' }
    ]
  })),
  gradientTransform: vi.fn(() => 'linear-gradient(135deg, #ff0000 0%, #0000ff 100%)'),
  css: vi.fn((styles) => {
    if (styles && typeof styles === 'object' && styles.bgGradient) {
      return { background: 'linear-gradient(135deg, #ff0000 0%, #0000ff 100%)' };
    }
    return styles;
  }),
  createTransform: vi.fn(() => vi.fn((value) => value))
}));

import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import RaceProfileCard from './RaceProfileCard';
import type { Race } from '../../types/races';

// Create a minimal theme that supports gradients
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  semanticTokens: {
    colors: {
      'bg-surface': { _light: 'white', _dark: 'gray.800' },
      'border-primary': { _light: 'gray.200', _dark: 'gray.600' },
      'text-muted': { _light: 'gray.600', _dark: 'gray.400' },
      'text-secondary': { _light: 'gray.700', _dark: 'gray.300' },
    },
  },
});

// Mock react-country-flag
vi.mock('react-country-flag', () => ({
  default: ({ countryCode, title }: { countryCode: string; title?: string }) => (
    <div data-testid="country-flag" data-country={countryCode} title={title}>
      Flag for {countryCode}
    </div>
  ),
}));


// Mock countryCodeMap
vi.mock('../../lib/countryCodeUtils', () => ({
  countryCodeMap: {
    'GBR': 'GB',
    'MON': 'MC',
    'BEL': 'BE',
    'ITA': 'IT',
    'ESP': 'ES',
    'FRA': 'FR',
    'GER': 'DE',
    'AUT': 'AT',
    'NED': 'NL',
    'USA': 'US',
    'CAN': 'CA',
    'AUS': 'AU',
    'JPN': 'JP',
    'BRA': 'BR',
    'MEX': 'MX',
    'SGP': 'SG',
    'ARE': 'AE',
    'SAU': 'SA',
    'QAT': 'QA',
    'TUR': 'TR',
    'HUN': 'HU',
    'RUS': 'RU',
    'CHN': 'CN',
    'KOR': 'KR',
    'IND': 'IN',
    'THA': 'TH',
    'MYS': 'MY',
    'IDN': 'ID',
    'PHL': 'PH',
    'VNM': 'VN',
    'LAO': 'LA',
    'KHM': 'KH',
    'MMR': 'MM',
    'BGD': 'BD',
    'LKA': 'LK',
    'MDV': 'MV',
    'BTN': 'BT',
    'NPL': 'NP',
    'PAK': 'PK',
    'AFG': 'AF',
    'IRN': 'IR',
    'IRQ': 'IQ',
    'SYR': 'SY',
    'LBN': 'LB',
    'ISR': 'IL',
    'PSE': 'PS',
    'JOR': 'JO',
    'YEM': 'YE',
    'OMN': 'OM',
    'KWT': 'KW',
    'BHR': 'BH',
    'EGY': 'EG',
    'LBY': 'LY',
    'TUN': 'TN',
    'DZA': 'DZ',
    'MAR': 'MA',
    'MRT': 'MR',
    'MLI': 'ML',
    'NER': 'NE',
    'TCD': 'TD',
    'SDN': 'SD',
    'SSD': 'SS',
    'ETH': 'ET',
    'ERI': 'ER',
    'DJI': 'DJ',
    'SOM': 'SO',
    'KEN': 'KE',
    'UGA': 'UG',
    'RWA': 'RW',
    'BDI': 'BI',
    'TZA': 'TZ',
    'MOZ': 'MZ',
    'ZWE': 'ZW',
    'ZMB': 'ZM',
    'MWI': 'MW',
    'AGO': 'AO',
    'NAM': 'NA',
    'BWA': 'BW',
    'ZAF': 'ZA',
    'LSO': 'LS',
    'SWZ': 'SZ',
    'MDG': 'MG',
    'COM': 'KM',
    'MUS': 'MU',
    'SYC': 'SC',
    'CPV': 'CV',
    'GMB': 'GM',
    'SEN': 'SN',
    'GIN': 'GN',
    'GNB': 'GW',
    'SLE': 'SL',
    'LBR': 'LR',
    'CIV': 'CI',
    'GHA': 'GH',
    'TGO': 'TG',
    'BEN': 'BJ',
    'NGA': 'NG',
    'CMR': 'CM',
    'CAF': 'CF',
    'GAB': 'GA',
    'COG': 'CG',
    'COD': 'CD',
    'GNQ': 'GQ',
    'STP': 'ST',
    'BFA': 'BF',
    'DEU': 'DE',
    'MCO': 'MC',
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
}

// Mock race data
const mockRace: Race = {
  id: 1,
  name: 'British Grand Prix',
  round: 10,
  date: '2024-07-14',
  circuit_id: 1,
  season_id: 2024,
};

const mockRaceWithCircuit: Race & { circuit?: { country_code: string } } = {
  ...mockRace,
  circuit: {
    country_code: 'GBR',
  },
};

const mockRaceWithUnknownCountry: Race & { circuit?: { country_code: string } } = {
  ...mockRace,
  circuit: {
    country_code: 'UNKNOWN',
  },
};

describe('RaceProfileCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<RaceProfileCard race={mockRace} />);
    
    // Text is split across spans
    expect(screen.getByText('British')).toBeInTheDocument();
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
  });

  it('displays race name correctly', () => {
    renderWithProviders(<RaceProfileCard race={mockRace} />);
    
    // Text is split across spans
    expect(screen.getByText('British')).toBeInTheDocument();
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
  });

  it('displays short name correctly (removes Grand Prix)', () => {
    renderWithProviders(<RaceProfileCard race={mockRace} />);
    
    expect(screen.getByText('British')).toBeInTheDocument();
  });

  it('displays round number correctly', () => {
    renderWithProviders(<RaceProfileCard race={mockRace} />);
    
    expect(screen.getByText('Round 10')).toBeInTheDocument();
  });

  it('displays formatted date correctly', () => {
    renderWithProviders(<RaceProfileCard race={mockRace} />);
    
    expect(screen.getByText('Jul 14, 2024')).toBeInTheDocument();
  });

  it('displays "View Details" text', () => {
    renderWithProviders(<RaceProfileCard race={mockRace} />);
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('handles race with circuit country code', () => {
    renderWithProviders(<RaceProfileCard race={mockRaceWithCircuit} />);
    
    const flag = screen.getByTestId('country-flag');
    expect(flag).toBeInTheDocument();
    expect(flag).toHaveAttribute('data-country', 'gb');
    expect(flag).toHaveAttribute('title', 'GBR');
  });

  it('handles race with unknown country code', () => {
    renderWithProviders(<RaceProfileCard race={mockRaceWithUnknownCountry} />);
    
    // Component should render without errors even with unknown country code
    expect(screen.getByText('British')).toBeInTheDocument();
    expect(screen.queryByTestId('country-flag')).not.toBeInTheDocument();
  });

  it('handles race without circuit data', () => {
    renderWithProviders(<RaceProfileCard race={mockRace} />);
    
    // Component should render without errors even without circuit data
    expect(screen.getByText('British')).toBeInTheDocument();
    expect(screen.queryByTestId('country-flag')).not.toBeInTheDocument();
  });

  it('handles different round numbers for gradient calculation', () => {
    const raceRound1 = { ...mockRace, round: 1 };
    const raceRound5 = { ...mockRace, round: 5 };
    const raceRound10 = { ...mockRace, round: 10 };
    
    renderWithProviders(<RaceProfileCard race={raceRound1} />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    
    renderWithProviders(<RaceProfileCard race={raceRound5} />);
    expect(screen.getByText('Round 5')).toBeInTheDocument();
    
    renderWithProviders(<RaceProfileCard race={raceRound10} />);
    expect(screen.getByText('Round 10')).toBeInTheDocument();
  });


  it('handles edge case round numbers', () => {
    const raceRound0 = { ...mockRace, round: 0 };
    const raceRoundNegative = { ...mockRace, round: -1 };
    const raceRoundLarge = { ...mockRace, round: 100 };
    
    renderWithProviders(<RaceProfileCard race={raceRound0} />);
    expect(screen.getByText('Round 0')).toBeInTheDocument();
    
    renderWithProviders(<RaceProfileCard race={raceRoundNegative} />);
    expect(screen.getByText('Round -1')).toBeInTheDocument();
    
    renderWithProviders(<RaceProfileCard race={raceRoundLarge} />);
    expect(screen.getByText('Round 100')).toBeInTheDocument();
  });

  it('handles race names with special characters', () => {
    const raceWithSpecialChars = { ...mockRace, name: 'São Paulo Grand Prix' };
    
    renderWithProviders(<RaceProfileCard race={raceWithSpecialChars} />);
    // Text is split across spans, so check for the parts
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
  });

  it('handles very long race names', () => {
    const raceWithLongName = { 
      ...mockRace, 
      name: 'Very Long Race Name That Should Be Displayed Properly Without Breaking The Layout Grand Prix' 
    };
    
    renderWithProviders(<RaceProfileCard race={raceWithLongName} />);
    // Text is split across spans, so check for the parts
    expect(screen.getByText('Very Long Race Name That Should Be Displayed Properly Without Breaking The Layout')).toBeInTheDocument();
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
  });

  it('handles race names with multiple GP references', () => {
    const raceWithMultipleGP = { ...mockRace, name: 'Monaco Grand Prix GP' };
    
    renderWithProviders(<RaceProfileCard race={raceWithMultipleGP} />);
    // Text is split across spans, check for the parts
    expect(screen.getByText('Monaco')).toBeInTheDocument();
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
  });

  it('handles invalid date strings gracefully', () => {
    const raceWithInvalidDate = { ...mockRace, date: 'invalid-date' };
    
    renderWithProviders(<RaceProfileCard race={raceWithInvalidDate} />);
    // Should still render the component even with invalid date (text is split)
    expect(screen.getByText('British')).toBeInTheDocument();
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
  });

  it('handles empty race name', () => {
    const raceWithEmptyName = { ...mockRace, name: '' };
    
    renderWithProviders(<RaceProfileCard race={raceWithEmptyName} />);
    // Empty name should still render the component structure
    expect(screen.getByText('Round 10')).toBeInTheDocument();
  });

  it('handles race name with only Grand Prix', () => {
    const raceWithOnlyGP = { ...mockRace, name: 'Grand Prix' };
    
    renderWithProviders(<RaceProfileCard race={raceWithOnlyGP} />);
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
    // After removing "Grand Prix", the short name should be empty, but we can't easily test for empty text
    // The component will render an empty span, which is not easily testable
  });

  it('handles race name with only GP abbreviation', () => {
    const raceWithOnlyGPAbbr = { ...mockRace, name: 'GP' };
    
    renderWithProviders(<RaceProfileCard race={raceWithOnlyGPAbbr} />);
    // Component transforms "GP" to "Grand Prix" and removes GP from short name
    expect(screen.getByText('Grand Prix')).toBeInTheDocument();
    // The short name will be empty after removing "GP"
  });
});
