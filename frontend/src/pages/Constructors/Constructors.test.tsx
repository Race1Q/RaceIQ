import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Constructors from './Constructors';

// Auth0 mock - will be overridden in individual tests
const mockUseAuth0 = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0(),
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
    // Default to authenticated user
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { sub: 'auth0|123', name: 'Test User' },
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('shows loading indicator initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    renderPage(<Constructors />);
    expect(screen.getByTestId('loading-spinner')).toHaveTextContent('Loading Constructors...');
  });

  describe('when user is authenticated', () => {
    it('renders all constructors with filters', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
      renderPage(<Constructors />);
      await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
      
      // Should show filter dropdown
      expect(screen.getByText('Filter by Status')).toBeInTheDocument();
      
      // Should show all active teams by default
      ['Red Bull Racing','Ferrari','McLaren','Mercedes','Aston Martin'].forEach(n => {
        expect(screen.getByText(n)).toBeInTheDocument();
      });
      // Inactive team should be hidden by default (active filter)
      expect(screen.queryByText('Haas F1 Team')).not.toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
      });
    });

    it('renders only active constructors without filters', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
      renderPage(<Constructors />);
      await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
      
      // Should not show filter dropdown
      expect(screen.queryByText('Filter by Status')).not.toBeInTheDocument();
      
      // Should show only active teams
      ['Red Bull Racing','Ferrari','McLaren','Mercedes','Aston Martin'].forEach(n => {
        expect(screen.getByText(n)).toBeInTheDocument();
      });
      // Inactive team should be hidden
      expect(screen.queryByText('Haas F1 Team')).not.toBeInTheDocument();
    });
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
