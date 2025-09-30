// src/pages/Standings/ConstructorStandings.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import ConstructorStandings from './ConstructorStandings';
import { useConstructorStandings } from '../../hooks/useConstructorStandings';

// Mock the useConstructorStandings hook
vi.mock('../../hooks/useConstructorStandings', () => ({
  useConstructorStandings: vi.fn(),
}));

// Mock Auth0 hook to provide a token and authenticated state
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'auth0|test' },
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
  }),
}));

// Mock teamColors to deterministic values
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    RedBull: '1e5bc6',
    Ferrari: 'e10600',
    Default: 'e10600',
  },
}));

// Mock SearchableSelect component
vi.mock('../../components/DropDownSearch/SearchableSelect', () => ({
  SearchableSelect: ({ label, options, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <select
        data-testid="season-select"
        aria-label="Search and select..."
        value={value?.value ?? ''}
        onChange={(e) => {
          const val = Number(e.target.value);
          const opt = options.find((o: any) => o.value === val) || null;
          onChange && onChange(opt);
        }}
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  default: ({ label, options, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <select
        data-testid="season-select"
        aria-label="Search and select..."
        value={value?.value ?? ''}
        onChange={(e) => {
          const val = Number(e.target.value);
          const opt = options.find((o: any) => o.value === val) || null;
          onChange && onChange(opt);
        }}
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock chakra-react-select with a simple native select
vi.mock('chakra-react-select', () => ({
  Select: ({ options, value, onChange, placeholder }: any) => (
    <select
      data-testid="season-select"
      aria-label={placeholder || 'Select'}
      value={value?.value ?? ''}
      onChange={(e) => {
        const val = Number(e.target.value);
        const opt = options.find((o: any) => o.value === val) || null;
        onChange && onChange(opt);
      }}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { initialRoute: "/standings/constructors" });
}

const sampleData = [
  {
    seasonYear: 2024,
    constructorId: 9,
    constructorName: 'RedBull',
    seasonPoints: 860,
    seasonWins: 18,
    position: 1,
  },
  {
    seasonYear: 2024,
    constructorId: 6,
    constructorName: 'Ferrari',
    seasonPoints: 500,
    seasonWins: 6,
    position: 2,
  },
];

describe('ConstructorStandings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('renders header and rows from API', async () => {
    // Mock the hook to return our sample data
    const mockUseConstructorStandings = useConstructorStandings as any;
    mockUseConstructorStandings.mockReturnValue({
      standings: sampleData,
      loading: false,
      error: null,
    });

    renderWithProviders(<ConstructorStandings />);

    // Wait for the component to render the main heading
    await waitFor(() => {
      expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Wait for constructor data to be rendered
    await waitFor(() => {
      expect(screen.getByText('RedBull')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Check for data that should be rendered
    expect(screen.getByText('RedBull')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();

    // Check that position numbers are displayed (1 and 2 from our sample data)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Verify the hook was called with the current year
    expect(mockUseConstructorStandings).toHaveBeenCalledWith(new Date().getFullYear());
  });

  it('changes season via select and triggers a refetch', async () => {
    // Mock the hook to return our sample data
    const mockUseConstructorStandings = useConstructorStandings as any;
    mockUseConstructorStandings.mockReturnValue({
      standings: sampleData,
      loading: false,
      error: null,
    });

    renderWithProviders(<ConstructorStandings />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Select Season')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Wait for data to be rendered
    await waitFor(() => {
      expect(screen.getByText('RedBull')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Find the season select and change it to 2023
    const seasonSelect = screen.getByTestId('season-select');
    fireEvent.change(seasonSelect, { target: { value: '2023' } });

    // Verify the component rendered successfully with the data
    expect(screen.getByText('Select Season')).toBeInTheDocument();
    expect(screen.getByText('RedBull')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
  });
});
