// src/pages/Standings/ConstructorStandings.test.tsx (revised)
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import ConstructorStandings from './ConstructorStandings';

// --- Mocks --- //
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ isAuthenticated: true, isLoading: false, user: { sub: 'auth0|test' } })
}));

vi.mock('../../lib/teamColors', () => ({
  teamColors: { 'Red Bull Racing': '1e5bc6', Ferrari: 'e10600', McLaren: 'ff8700', Default: 'aaaaaa' }
}));

// Mock loading spinner for deterministic querying
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="spinner">{text}</div>
}));

// Mock SearchableSelect (bypass chakra-react-select complexity)
vi.mock('../../components/DropDownSearch/SearchableSelect', () => ({
  __esModule: true,
  default: ({ label, options, value, onChange }: any) => (
    <div>
      <label>
        {label}
        <select
          data-testid="season-select"
          value={value?.value ?? ''}
          onChange={(e) => {
            const val = Number(e.target.value);
            const opt = options.find((o: any) => o.value === val) || null;
            onChange(opt);
          }}
        >
          {options.map((o: any) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}));

// Supabase mock with season-aware responses
const calls: number[] = [];
const data2025 = [
  { seasonYear: 2025, constructorId: 1, constructorName: 'Red Bull Racing', seasonPoints: 500, seasonWins: 15, position: 1 },
  { seasonYear: 2025, constructorId: 2, constructorName: 'Ferrari', seasonPoints: 410, seasonWins: 6, position: 2 }
];
const data2024 = [
  { seasonYear: 2024, constructorId: 3, constructorName: 'McLaren', seasonPoints: 380, seasonWins: 4, position: 1 }
];

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: (_col: string, year: number) => ({
          order: () => {
            calls.push(year);
            const payload = year === 2025 ? data2025 : year === 2024 ? data2024 : [];
            return Promise.resolve({ data: payload, error: null });
          }
        })
      })
    })
  }
}));

function renderPage(ui: React.ReactElement) {
  return render(ui, { initialRoute: '/standings/constructors' });
}

describe('ConstructorStandings Page', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('loads and displays initial season standings', async () => {
    renderPage(<ConstructorStandings />);

    // Initial fetch (current year 2025) should occur
    await waitFor(() => expect(screen.getByText('Formula 1 Championship Standings')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Red Bull Racing')).toBeInTheDocument());
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    // Verify only one supabase call so far (initial render)
    expect(calls).toEqual([2025]);
  });

  it('changes season and refetches new standings', async () => {
    renderPage(<ConstructorStandings />);

    await waitFor(() => expect(screen.getByText('Red Bull Racing')).toBeInTheDocument());
    const select = screen.getByTestId('season-select');
    // Change to 2024 (second option in list descending 2025..1950)
    fireEvent.change(select, { target: { value: '2024' } });

    await waitFor(() => expect(screen.getByText('McLaren')).toBeInTheDocument());
    expect(screen.queryByText('Red Bull Racing')).not.toBeInTheDocument();
    // Two calls: initial 2025 + after change 2024
    expect(calls).toEqual([2025, 2024]);
  });
});
