// src/pages/Standings/ConstructorStandings.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import ConstructorStandings from './ConstructorStandings';

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

// Mock buildApiUrl
vi.mock('../../lib/api', () => ({
  buildApiUrl: (path: string) => `http://localhost:3000${path}`,
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

  it('renders without crashing', () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ constructorStandings: sampleData }),
    } as any);

    const { container } = renderWithProviders(<ConstructorStandings />);
    
    // Just verify component mounts
    expect(container).toBeInTheDocument();
  });

  it('mounts successfully', () => {
    vi.spyOn(global, 'fetch' as any)
      .mockResolvedValue({ ok: true, json: async () => ({ constructorStandings: sampleData }) } as any);

    const { container } = renderWithProviders(<ConstructorStandings />);
    
    // Verify component rendered
    expect(container.firstChild).toBeTruthy();
  });
});
