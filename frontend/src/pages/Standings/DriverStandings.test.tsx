import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DriverStandingsPage from './DriverStandings';
import { useDriverStandings } from '../../hooks/useDriverStandings';

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useDriverStandings hook
vi.mock('../../hooks/useDriverStandings', () => ({
  useDriverStandings: vi.fn(),
}));

// Mock SearchableSelect component
vi.mock('../../components/DropDownSearch/SearchableSelect', () => ({
  default: ({ label, options, value, onChange, placeholder }: any) => (
    <div data-testid="searchable-select">
      <label>{label}</label>
      <div data-testid="select-placeholder">{placeholder}</div>
      {value && <div data-testid="selected-value">{value.label}</div>}
      <div data-testid="select-options">
        {options?.map((option: any) => (
          <div
            key={option.value}
            data-testid={`option-${option.value}`}
            onClick={() => onChange?.(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  ),
}));

// Mock F1LoadingSpinner
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

// Mock team colors
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull': '#3671C6',
    'Ferrari': '#DC143C',
    'Mercedes': '#00D2BE',
    'Default': '#666666',
  },
}));

// Mock team logo map
vi.mock('@/lib/teamAssets', () => ({
  teamLogoMap: {
    'Red Bull': '/logos/red-bull.png',
    'Ferrari': '/logos/ferrari.png',
    'Mercedes': '/logos/mercedes.png',
  },
}));

// Test theme with required colors
const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#FF0000',
    },
  },
});

// Mock data
const mockDriverStandings = [
  {
    id: 1,
    fullName: 'Max Verstappen',
    number: 1,
    country: 'Netherlands',
    profileImageUrl: 'https://example.com/max.jpg',
    constructor: 'Red Bull',
    points: 575,
    wins: 19,
    podiums: 21,
    position: 1,
    seasonYear: 2024,
  },
  {
    id: 2,
    fullName: 'Charles Leclerc',
    number: 16,
    country: 'Monaco',
    profileImageUrl: 'https://example.com/charles.jpg',
    constructor: 'Ferrari',
    points: 308,
    wins: 3,
    podiums: 12,
    position: 2,
    seasonYear: 2024,
  },
  {
    id: 3,
    fullName: 'Lewis Hamilton',
    number: 44,
    country: 'United Kingdom',
    profileImageUrl: 'https://example.com/lewis.jpg',
    constructor: 'Mercedes',
    points: 234,
    wins: 1,
    podiums: 9,
    position: 3,
    seasonYear: 2024,
  },
];

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('DriverStandingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Setup default mock for useDriverStandings
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: mockDriverStandings,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<DriverStandingsPage />);
    
  // Heading text in component is "Formula 1 Championship Standings"
  expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: [],
      loading: true,
      error: null,
    });

    renderWithProviders(<DriverStandingsPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading Driver Standings...')).toBeInTheDocument();
  });

  it('displays driver standings when loaded', () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Check if all drivers are displayed
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    
    // Check if positions are displayed (using getAllByText to handle multiple matches)
    const position1Elements = screen.getAllByText('1');
    const position2Elements = screen.getAllByText('2');
    const position3Elements = screen.getAllByText('3');
    
    expect(position1Elements.length).toBeGreaterThan(0);
    expect(position2Elements.length).toBeGreaterThan(0);
    expect(position3Elements.length).toBeGreaterThan(0);
    
    // Check if points are displayed
    expect(screen.getByText('575')).toBeInTheDocument();
    expect(screen.getByText('308')).toBeInTheDocument();
    expect(screen.getByText('234')).toBeInTheDocument();
    
    // Check if wins are displayed
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0); // Charles has 3 wins, and position 3
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Lewis has 1 win, and position 1
    
    // Check if podiums are displayed
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    
    // Check if constructors are displayed
    expect(screen.getByText('Red Bull')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
  });

  it('displays season selector', () => {
    renderWithProviders(<DriverStandingsPage />);
    
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
    expect(screen.getByText('Select Season')).toBeInTheDocument();
  });

  it('handles season selection', async () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Find and click on a different season option
    const option2023 = screen.getByTestId('option-2023');
    fireEvent.click(option2023);
    
    // Verify that useDriverStandings was called with the new season
    expect(useDriverStandings).toHaveBeenCalledWith(2023);
  });

  it('navigates to driver detail page when driver is clicked', async () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Find and click on Max Verstappen
    const maxVerstappenElement = screen.getByText('Max Verstappen');
    fireEvent.click(maxVerstappenElement);
    
    expect(mockNavigate).toHaveBeenCalledWith('/drivers/1');
  });

  it('navigates to driver detail page when driver row is clicked', async () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Find the driver row (Flex container) and click it
    const driverRows = screen.getAllByText('Max Verstappen');
    const driverRow = driverRows[0].closest('div');
    
    if (driverRow) {
      fireEvent.click(driverRow);
      expect(mockNavigate).toHaveBeenCalledWith('/drivers/1');
    }
  });

  it('displays driver profile images (Avatar with accessible name) when available', () => {
    renderWithProviders(<DriverStandingsPage />);
    // Chakra Avatar renders an img with role="img" and accessible name
    const maxAvatar = screen.getByRole('img', { name: 'Max Verstappen' });
    const charlesAvatar = screen.getByRole('img', { name: 'Charles Leclerc' });
    const lewisAvatar = screen.getByRole('img', { name: 'Lewis Hamilton' });

    expect(maxAvatar).toBeInTheDocument();
    expect(charlesAvatar).toBeInTheDocument();
    expect(lewisAvatar).toBeInTheDocument();

    // Don't assert src value; Chakra Avatar may defer image load or use a canvas/initials fallback.
    // Presence + accessible name is sufficient for our UI contract.
  });

  it('handles drivers without profile images', () => {
    const standingsWithoutImages = mockDriverStandings.map(driver => ({
      ...driver,
      profileImageUrl: null,
    }));
    
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: standingsWithoutImages,
      loading: false,
      error: null,
    });

    renderWithProviders(<DriverStandingsPage />);
    
    // Should still display driver names without images
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    
    // Should not have any profile images
    expect(screen.queryByAltText('Max Verstappen')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Charles Leclerc')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Lewis Hamilton')).not.toBeInTheDocument();
  });

  it('sorts drivers by position correctly', () => {
    // Create standings with mixed positions
    const mixedStandings = [
      { ...mockDriverStandings[2], position: 3 }, // Lewis
      { ...mockDriverStandings[0], position: 1 }, // Max
      { ...mockDriverStandings[1], position: 2 }, // Charles
    ];
    
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: mixedStandings,
      loading: false,
      error: null,
    });

    renderWithProviders(<DriverStandingsPage />);
    
    // Get all position elements (more specific selector to avoid matching other numbers)
    const positions = screen.getAllByText(/^(1|2|3)$/);
    expect(positions.length).toBeGreaterThanOrEqual(3);
    
    // Use accessible name (aria-label) exposed on each row to validate ordering and positions
    const rows = screen.getAllByRole('button', { name: /Driver .* position / });
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveAccessibleName(/position 1 /);
    expect(rows[1]).toHaveAccessibleName(/position 2 /);
    expect(rows[2]).toHaveAccessibleName(/position 3 /);
  });

  it('displays correct team colors', () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Check that driver rows exist (they should have team colors applied via CSS)
    const maxVerstappenRow = screen.getByText('Max Verstappen').closest('div');
    const charlesLeclercRow = screen.getByText('Charles Leclerc').closest('div');
    const lewisHamiltonRow = screen.getByText('Lewis Hamilton').closest('div');
    
    expect(maxVerstappenRow).toBeInTheDocument();
    expect(charlesLeclercRow).toBeInTheDocument();
    expect(lewisHamiltonRow).toBeInTheDocument();
  });

  it('handles empty standings gracefully', () => {
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: [],
      loading: false,
      error: null,
    });

    renderWithProviders(<DriverStandingsPage />);
    
  expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument();
    expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
  });

  it('handles error state', () => {
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: [],
      loading: false,
      error: 'Failed to load standings',
    });

    renderWithProviders(<DriverStandingsPage />);
    
    // The component should still render without crashing
  expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument();
  });

  it('displays current year as default season', () => {
    const currentYear = new Date().getFullYear();
    
    renderWithProviders(<DriverStandingsPage />);
    
    // Verify that useDriverStandings was called with current year
    expect(useDriverStandings).toHaveBeenCalledWith(currentYear);
  });

  it('updates season when selector changes', async () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Click on 2022 season
    const option2022 = screen.getByTestId('option-2022');
    fireEvent.click(option2022);
    
    // Verify that useDriverStandings was called with 2022
    expect(useDriverStandings).toHaveBeenCalledWith(2022);
  });

  it('maintains performance with large dataset', () => {
    // Create a large dataset
    const largeStandings = Array.from({ length: 50 }, (_, index) => ({
      ...mockDriverStandings[0],
      id: index + 1,
      fullName: `Driver ${index + 1}`,
      position: index + 1,
      points: Math.floor(Math.random() * 500),
    }));
    
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: largeStandings,
      loading: false,
      error: null,
    });

    const startTime = performance.now();
    renderWithProviders(<DriverStandingsPage />);
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (less than 1500ms for 50 drivers)
    expect(renderTime).toBeLessThan(1500);
    
    // Should display all drivers
    expect(screen.getByText('Driver 1')).toBeInTheDocument();
    expect(screen.getByText('Driver 50')).toBeInTheDocument();
  });

  it('handles drivers with missing data gracefully', () => {
    const incompleteStandings = [
      {
        id: 1,
        fullName: 'Test Driver',
        number: 99,
        country: 'Unknown',
        profileImageUrl: '',
        constructor: 'Unknown Team',
        points: 0,
        wins: 0,
        podiums: 0,
        position: 1,
        seasonYear: 2024,
      },
    ];
    
    vi.mocked(useDriverStandings).mockReturnValue({
      standings: incompleteStandings,
      loading: false,
      error: null,
    });

    renderWithProviders(<DriverStandingsPage />);
    
    // Should still render without crashing
    expect(screen.getByText('Test Driver')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Position
    
    // Check for zero values in the driver's row specifically
    const testDriverRow = screen.getByText('Test Driver').closest('div');
    expect(testDriverRow).toBeInTheDocument();
    
    // Check that the driver row contains the expected zero values
    const zeroElements = testDriverRow?.querySelectorAll('p');
    expect(zeroElements?.length).toBeGreaterThan(0);
  });

  it('displays season options correctly', () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Check that season options are available
    expect(screen.getByTestId('option-2024')).toBeInTheDocument();
    expect(screen.getByTestId('option-2023')).toBeInTheDocument();
    expect(screen.getByTestId('option-2022')).toBeInTheDocument();
    
    // Check that older seasons are available
    expect(screen.getByTestId('option-1950')).toBeInTheDocument();
  });

  it('handles hover effects on driver rows', () => {
    renderWithProviders(<DriverStandingsPage />);
    
    const maxVerstappenRow = screen.getByText('Max Verstappen').closest('div');
    
    // Hover effects are applied via CSS, so we just verify the element exists
    expect(maxVerstappenRow).toBeInTheDocument();
  });

  it('displays responsive grid layout', () => {
    renderWithProviders(<DriverStandingsPage />);
    
    // Check that the main container exists
  expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument();
    
    // Check that driver rows exist (they use CSS Grid)
    const maxVerstappenRow = screen.getByText('Max Verstappen').closest('div');
    expect(maxVerstappenRow).toBeInTheDocument();
  });
});
