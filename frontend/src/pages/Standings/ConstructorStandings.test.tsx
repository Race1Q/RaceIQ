// src/pages/Standings/ConstructorStandings.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import ConstructorStandings from './ConstructorStandings';

// Mock Auth0 hook to provide a token
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
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
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={["/standings/constructors"]}>
        {ui}
      </MemoryRouter>
    </ChakraProvider>
  );
}

const sampleData = [
  {
    id: 1,
    season_id: 2024,
    constructor_id: 9,
    position: 1,
    points: 860,
    wins: 18,
    constructor: {
      id: 9,
      name: 'RedBull',
      nationality: 'Austrian',
      constructor_id: 'red_bull',
    },
  },
  {
    id: 2,
    season_id: 2024,
    constructor_id: 6,
    position: 2,
    points: 500,
    wins: 6,
    constructor: {
      id: 6,
      name: 'Ferrari',
      nationality: 'Italian',
      constructor_id: 'ferrari',
    },
  },
];

describe('ConstructorStandings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('shows loading spinner then renders header and rows from API', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => sampleData,
    } as any);

    renderWithProviders(<ConstructorStandings />);

    // Loading state
    expect(screen.getByText(/loading constructor standings/i)).toBeInTheDocument();

    // Rows render
    await waitFor(() => {
      expect(screen.getByText('#')).toBeInTheDocument();
      expect(screen.getByText('Constructor')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Wins')).toBeInTheDocument();
      expect(screen.getByText('Nationality')).toBeInTheDocument();

      expect(screen.getByText('RedBull')).toBeInTheDocument();
      expect(screen.getByText('Ferrari')).toBeInTheDocument();
      expect(screen.getByText('860')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('Austrian')).toBeInTheDocument();
      expect(screen.getByText('Italian')).toBeInTheDocument();
    });

    // Assert call to the expected endpoint occurred at least once
    const calledUrls = fetchSpy.mock.calls.map((c) => String(c[0]));
    expect(calledUrls.some((u) => /constructor-standings\//.test(u))).toBe(true);
  });

  it('changes season via select and triggers a refetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch' as any)
      .mockResolvedValue({ ok: true, json: async () => sampleData } as any);

    renderWithProviders(<ConstructorStandings />);

    await screen.findByText('RedBull');

    const initialCalls = fetchSpy.mock.calls.length;
    const seasonSelect = await screen.findByTestId('season-select');
    fireEvent.change(seasonSelect, { target: { value: '2023' } });

    await waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });
});
