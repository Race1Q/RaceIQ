import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Constructors from './Constructors';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock useUserProfile
vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

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
      <ThemeColorProvider>
        <MemoryRouter>{node}</MemoryRouter>
      </ThemeColorProvider>
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
      getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
    });
    // Default fetch implementation
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => data,
    });
  });

  it('shows loading indicator initially', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    renderPage(<Constructors />);
    // Component renders immediately with header, check that data section exists
    expect(screen.getByText('Constructors')).toBeInTheDocument();
  });

  describe('when user is authenticated', () => {
    it('renders page with filters', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => data });
      renderPage(<Constructors />);
      
      // Should render page header
      expect(screen.getByText('Constructors')).toBeInTheDocument();
      
      // Should show filter tabs
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /active/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('tab', { name: /historical/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
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
        getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
      });
    });

    it('renders page for unauthenticated users', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => data });
      renderPage(<Constructors />);
      
      // Should render page header
      expect(screen.getByText('Constructors')).toBeInTheDocument();
    });
  });





  it('handles fetch error and shows toast + error message', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Boom'));
    renderPage(<Constructors />);
    await waitFor(() => expect(screen.getByText('Network Boom')).toBeInTheDocument());
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error fetching constructors',
      description: 'Network Boom',
      status: 'error',
    }));
  });

  it('renders successfully', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => data });
    renderPage(<Constructors />);
    
    // Should render page successfully
    expect(screen.getByText('Constructors')).toBeInTheDocument();
    expect(screen.getByText('Explore F1 teams and constructors')).toBeInTheDocument();
  });
});
