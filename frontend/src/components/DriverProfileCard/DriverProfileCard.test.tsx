import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import DriverProfileCard from './DriverProfileCard';

// Mock the color utilities to return simple hex colors
vi.mock('../../lib/colorUtils', () => ({
  lightenColor: vi.fn((hex: string) => hex),
  darkenColor: vi.fn((hex: string) => hex),
}));

// Mock ReactCountryFlag component
vi.mock('react-country-flag', () => ({
  default: ({ countryCode, title }: { countryCode: string; title: string }) => (
    <div data-testid={`flag-${countryCode}`} title={title}>
      Flag: {countryCode.toUpperCase()}
    </div>
  ),
}));

// Mock the user icon asset
vi.mock('../../assets/UserIcon.png', () => ({
  default: 'mocked-user-icon.png'
}));

// Mock country code utilities
vi.mock('../../lib/countryCodeUtils', () => ({
  countryCodeMap: {
    'NL': 'NL',
    'GB': 'GB',
    'ES': 'ES',
    'FR': 'FR',
    'IT': 'IT',
    'DE': 'DE',
    'AU': 'AU',
    'BR': 'BR',
    'CA': 'CA',
    'MX': 'MX',
    'FI': 'FI',
    'DK': 'DK',
    'JP': 'JP',
    'TH': 'TH',
    'CH': 'CH',
    'RU': 'RU',
    'AR': 'AR',
    'VE': 'VE',
    'ID': 'ID',
    'SG': 'SG',
    'US': 'US',
    'ZA': 'ZA',
    'NZ': 'NZ',
    'CL': 'CL',
    'KR': 'KR',
    'IN': 'IN',
    'MY': 'MY',
    'PH': 'PH',
    'VN': 'VN',
    'TW': 'TW',
    'HK': 'HK',
    'MO': 'MO',
    'CN': 'CN',
    'TR': 'TR',
    'EG': 'EG',
    'MA': 'MA',
    'TN': 'TN',
    'DZ': 'DZ',
    'LY': 'LY',
    'SD': 'SD',
    'ET': 'ET',
    'KE': 'KE',
    'UG': 'UG',
    'TZ': 'TZ',
    'RW': 'RW',
    'BI': 'BI',
    'DJ': 'DJ',
    'SO': 'SO',
    'ER': 'ER',
    'SS': 'SS',
    'CF': 'CF',
    'TD': 'TD',
    'NE': 'NE',
    'NG': 'NG',
    'CM': 'CM',
    'GQ': 'GQ',
    'GA': 'GA',
    'CG': 'CG',
    'CD': 'CD',
    'AO': 'AO',
    'ZM': 'ZM',
    'ZW': 'ZW',
    'BW': 'BW',
    'NA': 'NA',
    'SZ': 'SZ',
    'LS': 'LS',
    'MW': 'MW',
    'MZ': 'MZ',
    'MG': 'MG',
    'MU': 'MU',
    'SC': 'SC',
    'KM': 'KM',
    'YT': 'YT',
    'RE': 'RE',
    'CV': 'CV',
    'ST': 'ST',
    'GH': 'GH',
    'TG': 'TG',
    'BJ': 'BJ',
    'BF': 'BF',
    'CI': 'CI',
    'LR': 'LR',
    'SL': 'SL',
    'GN': 'GN',
    'GW': 'GW',
    'GM': 'GM',
    'SN': 'SN',
    'ML': 'ML',
    'MR': 'MR'
  }
}));

// Helper function to render with Chakra UI and Router
function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe('DriverProfileCard Component', () => {
  const mockDriver = {
    id: 'max_verstappen',
    name: 'Max Verstappen',
    number: '1',
    team: 'Red Bull',
    nationality: 'NL',
    image: 'max.png',
    team_color: '#E10600',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<DriverProfileCard driver={mockDriver} />);
    
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
  });

  it('renders driver name split into first and last name', () => {
    renderWithProviders(<DriverProfileCard driver={mockDriver} />);
    
    // Check first name
    expect(screen.getByText('Max')).toBeInTheDocument();
    // Check last name (component renders it in uppercase)
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
  });

  it('renders driver number when available', () => {
    renderWithProviders(<DriverProfileCard driver={mockDriver} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders driver image with correct src', () => {
    renderWithProviders(<DriverProfileCard driver={mockDriver} />);
    
    const image = screen.getByRole('img', { name: /max verstappen/i });
    expect(image).toHaveAttribute('src', 'max.png');
  });

  it('renders country flag', () => {
    renderWithProviders(<DriverProfileCard driver={mockDriver} />);
    
    expect(screen.getByTestId('flag-nl')).toBeInTheDocument();
  });

  it('renders "View Profile" text', () => {
    renderWithProviders(<DriverProfileCard driver={mockDriver} />);
    
    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  it('handles driver without number', () => {
    const driverWithoutNumber = {
      ...mockDriver,
      number: 'N/A'
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithoutNumber} />);
    
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('handles driver with empty number', () => {
    const driverWithEmptyNumber = {
      ...mockDriver,
      number: ''
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithEmptyNumber} />);
    
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('uses fallback image when driver image is not provided', () => {
    const driverWithoutImage = {
      ...mockDriver,
      image: ''
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithoutImage} />);
    
    const image = screen.getByRole('img', { name: /max verstappen/i });
    expect(image).toHaveAttribute('src', 'mocked-user-icon.png');
  });

  it('handles single name correctly', () => {
    const driverWithSingleName = {
      ...mockDriver,
      name: 'Madonna'
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithSingleName} />);
    
    expect(screen.getByText('Madonna')).toBeInTheDocument();
    // Last name should be empty string, so no uppercase text should be found
    expect(screen.queryByText('MADONNA')).not.toBeInTheDocument();
  });

  it('handles names with multiple parts', () => {
    const driverWithMultipleNames = {
      ...mockDriver,
      name: 'Jean-Pierre Jacques-Marie François'
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithMultipleNames} />);
    
    expect(screen.getByText('Jean-Pierre')).toBeInTheDocument();
    expect(screen.getByText('Jacques-Marie François')).toBeInTheDocument();
  });

  it('handles different nationalities', () => {
    const britishDriver = {
      ...mockDriver,
      nationality: 'GB',
      name: 'Lewis Hamilton'
    };
    
    renderWithProviders(<DriverProfileCard driver={britishDriver} />);
    
    expect(screen.getByTestId('flag-gb')).toBeInTheDocument();
    expect(screen.getByText('Lewis')).toBeInTheDocument();
    expect(screen.getByText('Hamilton')).toBeInTheDocument();
  });

  it('handles unknown nationality gracefully', () => {
    const driverWithUnknownNationality = {
      ...mockDriver,
      nationality: 'XX'
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithUnknownNationality} />);
    
    // Should still render the flag with the original nationality code
    expect(screen.getByTestId('flag-xx')).toBeInTheDocument();
  });

  it('handles missing team color', () => {
    const driverWithoutTeamColor = {
      ...mockDriver,
      team_color: ''
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithoutTeamColor} />);
    
    // Component should still render without crashing
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    renderWithProviders(<DriverProfileCard driver={mockDriver} />);
    
    // Check that the main container has the correct role
    const container = screen.getByRole('group');
    expect(container).toBeInTheDocument();
    
    // Check that all main elements are present
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  it('renders with different team colors', () => {
    const mercedesDriver = {
      ...mockDriver,
      team_color: '#00D2BE',
      name: 'Lewis Hamilton'
    };
    
    renderWithProviders(<DriverProfileCard driver={mercedesDriver} />);
    
    expect(screen.getByText('Lewis')).toBeInTheDocument();
    expect(screen.getByText('Hamilton')).toBeInTheDocument();
  });
});

describe('DriverProfileCard Edge Cases', () => {
  it('handles very long names', () => {
    const driverWithLongName = {
      id: 'test_driver',
      name: 'Jean-Pierre Jacques-Marie François de la Croix',
      number: '99',
      team: 'Test Team',
      nationality: 'FR',
      image: 'test.jpg',
      team_color: '#123456'
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithLongName} />);
    
    expect(screen.getByText('Jean-Pierre')).toBeInTheDocument();
    expect(screen.getByText('Jacques-Marie François de la Croix')).toBeInTheDocument();
  });

  it('handles names with special characters', () => {
    const driverWithSpecialChars = {
      id: 'test_driver',
      name: 'José María López',
      number: '77',
      team: 'Test Team',
      nationality: 'ES',
      image: 'test.jpg',
      team_color: '#654321'
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithSpecialChars} />);
    
    expect(screen.getByText('José')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
  });

  it('handles empty name gracefully', () => {
    const driverWithEmptyName = {
      id: 'test_driver',
      name: '',
      number: '88',
      team: 'Test Team',
      nationality: 'DE',
      image: 'test.jpg',
      team_color: '#987654'
    };
    
    renderWithProviders(<DriverProfileCard driver={driverWithEmptyName} />);
    
    // Should still render the number and other elements
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('View Profile')).toBeInTheDocument();
    expect(screen.getByTestId('flag-de')).toBeInTheDocument();
  });
});

describe('DriverProfileCard Integration Tests', () => {
  const testDriver = {
    id: 'max_verstappen',
    name: 'Max Verstappen',
    number: '1',
    team: 'Red Bull',
    nationality: 'NL',
    image: 'max.png',
    team_color: '#E10600',
  };

  it('works correctly with Chakra UI theme', () => {
    renderWithProviders(<DriverProfileCard driver={testDriver} />);
    
    // The component should render without theme-related errors
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
  });

  it('maintains accessibility with proper roles and alt text', () => {
    renderWithProviders(<DriverProfileCard driver={testDriver} />);
    
    // Check that the image has proper alt text
    const image = screen.getByRole('img', { name: /max verstappen/i });
    expect(image).toHaveAttribute('alt', 'Max Verstappen');
    
    // Check that the main container has group role
    const container = screen.getByRole('group');
    expect(container).toBeInTheDocument();
  });

  it('renders multiple instances correctly', () => {
    const drivers = [
      testDriver,
      {
        id: 'lewis_hamilton',
        name: 'Lewis Hamilton',
        number: '44',
        team: 'Mercedes',
        nationality: 'GB',
        image: 'lewis.jpg',
        team_color: '#00D2BE'
      }
    ];
    
    drivers.forEach((driver) => {
      const { unmount } = renderWithProviders(<DriverProfileCard driver={driver} />);
      
      const [firstName] = driver.name.split(' ');
      expect(screen.getByText(firstName)).toBeInTheDocument();
      
      unmount();
    });
  });
});
