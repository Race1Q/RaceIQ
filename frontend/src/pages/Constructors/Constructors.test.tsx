import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Constructors from './Constructors';

// Auth0 mock (kept lightweight / deterministic)
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'auth0|123', name: 'Test User' },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Global fetch mock
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// buildApiUrl passthrough
vi.mock('../../lib/api', () => ({
  buildApiUrl: (endpoint: string) => `http://test.local${endpoint}`,
}));

// Team colors & cars (minimal needed keys to avoid undefined lookups)
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': 'E10600',
    Ferrari: 'DC0000',
    McLaren: 'FF8700',
    Mercedes: '00D2BE',
    'Aston Martin': '006F62',
    'Haas F1 Team': 'FFFFFF',
  },
}));
vi.mock('../../lib/teamCars', () => ({
  teamCarImages: {
    'Red Bull Racing': 'redbull.png',
    Ferrari: 'ferrari.png',
  },
}));

// Spinner mock
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

// Mock Select -> native select for predictable interaction
vi.mock('chakra-react-select', () => {
  const Select = ({ options, value, onChange, placeholder }: any) => (
    <select
      aria-label={placeholder || 'select'}
      value={value?.value || ''}
      onChange={(e) => {
        const opt = options.find((o: any) => o.value === e.target.value) || null;
        onChange?.(opt);
      }}
      data-testid="status-select"
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
  return { Select };
});

// Toast mock (preserve other chakra exports)
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { ...actual, useToast: () => mockToast };
});

function renderPage(node: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>{node}</MemoryRouter>
    </ChakraProvider>
  );
}

describe('Constructors Page', () => {
  const data = [
    { id: 1, name: 'Red Bull Racing', nationality: 'Austrian', url: '', is_active: true },
    { id: 2, name: 'Ferrari', nationality: 'Italian', url: '', is_active: true },
    { id: 3, name: 'McLaren', nationality: 'British', url: '', is_active: true },
    { id: 4, name: 'Mercedes', nationality: 'German', url: '', is_active: true },
    { id: 5, name: 'Aston Martin', nationality: 'British', url: '', is_active: true },
    { id: 6, name: 'Haas F1 Team', nationality: 'American', url: '', is_active: false },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading indicator initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    renderPage(<Constructors />);
    expect(screen.getByTestId('loading-spinner')).toHaveTextContent('Loading Constructors...');
  });

  it('renders active constructors (default status filter = active)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    ['Red Bull Racing','Ferrari','McLaren','Mercedes','Aston Martin'].forEach(n => {
      expect(screen.getByText(n)).toBeInTheDocument();
    });
    expect(screen.queryByText('Haas F1 Team')).not.toBeInTheDocument(); // inactive hidden
    // Search input is NOT visible while status=active
    expect(screen.queryByPlaceholderText('Search by name')).not.toBeInTheDocument();
  });

  it('switching to "all" reveals search and shows inactive team', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: 'all' } });
    expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument();
    expect(screen.getByText('Haas F1 Team')).toBeInTheDocument();
  });

  it('filters via search when status is all', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'all' } });
    const search = screen.getByPlaceholderText('Search by name');
    await user.type(search, 'Ferr');
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    // An unrelated team should be filtered out logically by name match
    // (The component filters client-side).
    expect(screen.queryByText('Red Bull Racing')).not.toBeInTheDocument();
  });

  it('shows inactive only when status set to inactive', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'inactive' } });
    expect(screen.getByText('Haas F1 Team')).toBeInTheDocument();
    // Active teams hidden
    expect(screen.queryByText('Ferrari')).not.toBeInTheDocument();
    // Search input appears for inactive
    expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument();
  });

  it('clear search button resets input', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'all' } });
    const search = screen.getByPlaceholderText('Search by name');
    await user.type(search, 'Merc');
    expect(screen.getByDisplayValue('Merc')).toBeInTheDocument();
    const clearBtn = screen.getByLabelText('Clear search');
    await user.click(clearBtn);
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles fetch error and shows toast + error message', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Boom'));
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    expect(screen.getByText('Network Boom')).toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error fetching constructors',
      description: 'Network Boom',
      status: 'error',
    }));
  });

  it('links each card to constructor details', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    const link = screen.getByText('Red Bull Racing').closest('a');
    expect(link).toHaveAttribute('href', '/constructors/1');
  });
});
