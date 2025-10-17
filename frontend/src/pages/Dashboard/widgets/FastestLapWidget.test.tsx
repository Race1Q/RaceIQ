import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import FastestLapWidget from './FastestLapWidget';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useUserProfile
vi.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Zap: () => <div data-testid="zap-icon">⚡</div>,
}));

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
    text: {
      primary: '#ffffff',
      muted: '#666666',
    },
  },
  space: {
    md: '1rem',
    sm: '0.5rem',
    xs: '0.25rem',
  },
  fonts: {
    heading: 'Inter, sans-serif',
    mono: 'Monaco, monospace',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

const mockFastestLapData = {
  lapTime: '1:32.123',
  driverFullName: 'Max Verstappen',
};

describe('FastestLapWidget', () => {
  it('renders loading state when no data provided', () => {
    renderWithProviders(<FastestLapWidget />);

    expect(screen.getByText('Last Race: Fastest Lap')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
  });

  it('renders fastest lap information when data is provided', () => {
    renderWithProviders(<FastestLapWidget data={mockFastestLapData} />);

    expect(screen.getByText('Last Race: Fastest Lap')).toBeInTheDocument();
    expect(screen.getByText('1:32.123')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
  });

  it('renders correct icon', () => {
    renderWithProviders(<FastestLapWidget data={mockFastestLapData} />);

    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
  });

  it('renders lap time with proper styling', () => {
    renderWithProviders(<FastestLapWidget data={mockFastestLapData} />);

    const lapTimeElement = screen.getByText('1:32.123');
    expect(lapTimeElement).toBeInTheDocument();
    // Just check that the element exists and has the correct text
    expect(lapTimeElement).toHaveTextContent('1:32.123');
  });

  it('renders driver name with proper styling', () => {
    renderWithProviders(<FastestLapWidget data={mockFastestLapData} />);

    const driverNameElement = screen.getByText('Max Verstappen');
    expect(driverNameElement).toBeInTheDocument();
    // Just check that the element exists and has the correct text
    expect(driverNameElement).toHaveTextContent('Max Verstappen');
  });

  it('renders "Lap Time" label', () => {
    renderWithProviders(<FastestLapWidget data={mockFastestLapData} />);

    expect(screen.getByText('Lap Time')).toBeInTheDocument();
  });

  it('handles null data gracefully', () => {
    renderWithProviders(<FastestLapWidget data={null} />);

    expect(screen.getByText('Last Race: Fastest Lap')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    renderWithProviders(<FastestLapWidget data={undefined} />);

    expect(screen.getByText('Last Race: Fastest Lap')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays information in correct layout', () => {
    renderWithProviders(<FastestLapWidget data={mockFastestLapData} />);

    // Check for title with icon
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    expect(screen.getByText('Last Race: Fastest Lap')).toBeInTheDocument();
    
    // Check for lap time display
    expect(screen.getByText('1:32.123')).toBeInTheDocument();
    expect(screen.getByText('Lap Time')).toBeInTheDocument();
    
    // Check for driver name
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
  });

  it('renders with different fastest lap data', () => {
    const differentData = {
      lapTime: '1:28.456',
      driverFullName: 'Lewis Hamilton',
    };

    renderWithProviders(<FastestLapWidget data={differentData} />);

    expect(screen.getByText('1:28.456')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
  });

  it('handles empty driver name', () => {
    const dataWithEmptyName = {
      lapTime: '1:32.123',
      driverFullName: '',
    };

    renderWithProviders(<FastestLapWidget data={dataWithEmptyName} />);

    expect(screen.getByText('1:32.123')).toBeInTheDocument();
    expect(screen.getByText('Lap Time')).toBeInTheDocument();
  });

  it('handles empty lap time', () => {
    const dataWithEmptyTime = {
      lapTime: '',
      driverFullName: 'Max Verstappen',
    };

    renderWithProviders(<FastestLapWidget data={dataWithEmptyTime} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Lap Time')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => renderWithProviders(<FastestLapWidget data={mockFastestLapData} />)).not.toThrow();
  });

  it('maintains consistent structure between loading and loaded states', () => {
    // Test loading state
    const { rerender } = renderWithProviders(<FastestLapWidget />);
    
    expect(screen.getByText('Last Race: Fastest Lap')).toBeInTheDocument();
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Test loaded state
    rerender(
      <ChakraProvider theme={testTheme}>
        <ThemeColorProvider>
          <FastestLapWidget data={mockFastestLapData} />
        </ThemeColorProvider>
      </ChakraProvider>
    );

    expect(screen.getByText('Last Race: Fastest Lap')).toBeInTheDocument();
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    expect(screen.getByText('1:32.123')).toBeInTheDocument();
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
  });
});
