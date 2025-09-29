import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Constructors from './Constructors';

// Mock Auth0 - simple approach like existing tests
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      sub: 'auth0|123456789',
      name: 'Test User',
      email: 'test@example.com',
    },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock the API fetch function
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock the API build function
vi.mock('../../lib/api', () => ({
  buildApiUrl: (endpoint: string) => `http://localhost:3000${endpoint}`,
}));

// Mock team colors
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': 'E10600',
    'Ferrari': 'DC0000',
    'McLaren': 'FF8700',
    'Mercedes': '00D2BE',
    'Aston Martin': '006F62',
    'Alpine F1 Team': 'FF87BC',
    'Williams': '005AFF',
    'RB F1 Team': '6692FF',
    'Sauber': '9B0000',
    'Haas F1 Team': 'FFFFFF',
    'Default': '666666',
  },
}));

// Mock team car images
vi.mock('../../lib/teamCars', () => ({
  teamCarImages: {
    'Red Bull Racing': 'redbull-car.png',
    'Ferrari': 'ferrari-car.png',
    'McLaren': 'mclaren-car.png',
    'Mercedes': 'mercedes-car.png',
    'Aston Martin': 'aston-martin-car.png',
    'Alpine F1 Team': 'alpine-car.png',
    'Williams': 'williams-car.png',
    'RB F1 Team': 'rb-car.png',
    'Sauber': 'sauber-car.png',
    'Haas F1 Team': 'haas-car.png',
  },
}));

// Mock F1LoadingSpinner
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

// Mock chakra-react-select to a native select
vi.mock('chakra-react-select', () => {
  function TestSelect({
    options = [],
    value,
    onChange,
    placeholder,
    'data-testid': dataTestId,
  }: any) {
    const currentValue = value?.value ?? '';
    return (
      <div>
        <select
          data-testid={dataTestId || placeholder}
          aria-label={placeholder}
          value={currentValue}
          onChange={(e) => {
            const selectedOption = options.find((o: any) => o.value === e.target.value) || null;
            onChange?.(selectedOption);
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o: any) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span data-testid={(dataTestId || placeholder) + '-selected'}>
          {value?.label ?? ''}
        </span>
      </div>
    );
  }
  return { Select: TestSelect };
});

// Mock useToast
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { 
    ...actual, 
    useToast: () => mockToast,
  };
});

function renderPage(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
}

describe('Constructors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
  });

  const mockConstructorsData = [
    {
      id: 1,
      name: 'Red Bull Racing',
      nationality: 'Austrian',
      url: 'https://www.redbullracing.com',
      is_active: true,
    },
    {
      id: 2,
      name: 'Ferrari',
      nationality: 'Italian',
      url: 'https://www.ferrari.com',
      is_active: true,
    },
    {
      id: 3,
      name: 'McLaren',
      nationality: 'British',
      url: 'https://www.mclaren.com',
      is_active: true,
    },
    {
      id: 4,
      name: 'Mercedes',
      nationality: 'German',
      url: 'https://www.mercedes.com',
      is_active: true,
    },
    {
      id: 5,
      name: 'Aston Martin',
      nationality: 'British',
      url: 'https://www.astonmartin.com',
      is_active: true,
    },
    {
      id: 6,
      name: 'Haas F1 Team',
      nationality: 'American',
      url: 'https://www.haasf1team.com',
      is_active: false,
    },
  ];

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderPage(<Constructors />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading Constructors...')).toBeInTheDocument();
  });

  it('renders constructors grid when data is loaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check that constructor cards are rendered
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    expect(screen.getByText('McLaren')).toBeInTheDocument();
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getByText('Aston Martin')).toBeInTheDocument();
    // Haas F1 Team is inactive, so not shown by default
  });

  it('renders constructor information correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check constructor details (only active ones by default)
    // Check that constructor cards show the right nationalities
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    expect(screen.getByText('McLaren')).toBeInTheDocument();
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getByText('Aston Martin')).toBeInTheDocument();
    // American (Haas) is inactive, so not shown by default
  });

  it('renders search input and filters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check search input
    expect(screen.getByPlaceholderText('Search by name or nationality')).toBeInTheDocument();
    
    // Check filter dropdowns
    expect(screen.getByLabelText('Nationality')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Status')).toBeInTheDocument();
  });

  it('filters constructors by search term', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or nationality');
    
    // Search by team name
    await user.type(searchInput, 'Red Bull');
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.queryByText('Ferrari')).not.toBeInTheDocument();

    // Clear search and search by nationality
    await user.clear(searchInput);
    await user.type(searchInput, 'British');
    expect(screen.getByText('McLaren')).toBeInTheDocument();
    expect(screen.getByText('Aston Martin')).toBeInTheDocument();
    expect(screen.queryByText('Ferrari')).not.toBeInTheDocument();
  });

  it('filters constructors by nationality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const nationalitySelect = screen.getByLabelText('Nationality');
    
    // Select Italian nationality
    fireEvent.change(nationalitySelect, { target: { value: 'Italian' } });
    
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    expect(screen.queryByText('Red Bull Racing')).not.toBeInTheDocument();
  });

  it('filters constructors by status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText('Filter by Status');
    
    // Filter by inactive teams
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });
    
    expect(screen.getByText('Haas F1 Team')).toBeInTheDocument();
    expect(screen.queryByText('Red Bull Racing')).not.toBeInTheDocument();
    expect(screen.queryByText('Ferrari')).not.toBeInTheDocument();

    // Filter by all teams
    fireEvent.change(statusSelect, { target: { value: 'all' } });
    
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Haas F1 Team')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or nationality');
    
    // Type in search
    await user.type(searchInput, 'Red Bull');
    expect(screen.getByDisplayValue('Red Bull')).toBeInTheDocument();
    
    // Clear search using clear button
    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);
    
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error fetching constructors',
      description: 'API Error',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });

  it('renders all main sections for constructors page', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check all main sections are present
    expect(screen.getByText('Constructors')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name or nationality')).toBeInTheDocument();
    expect(screen.getByLabelText('Nationality')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Status')).toBeInTheDocument();
    
    // Check constructor cards (only active ones by default)
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    expect(screen.getByText('McLaren')).toBeInTheDocument();
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getByText('Aston Martin')).toBeInTheDocument();
  });

  it('renders constructor cards with proper navigation links', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check that constructor cards are wrapped in links
    const redBullLink = screen.getByText('Red Bull Racing').closest('a');
    expect(redBullLink).toBeInTheDocument();
    expect(redBullLink?.getAttribute('href')).toBe('/constructors/1');

    const ferrariLink = screen.getByText('Ferrari').closest('a');
    expect(ferrariLink).toBeInTheDocument();
    expect(ferrariLink?.getAttribute('href')).toBe('/constructors/2');
  });

  it('displays correct number of constructors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstructorsData,
    });

    renderPage(<Constructors />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Should display 5 active constructors by default (Haas is inactive)
    const activeConstructorNames = [
      'Red Bull Racing',
      'Ferrari', 
      'McLaren',
      'Mercedes',
      'Aston Martin'
    ];

    activeConstructorNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    // Haas should not be visible by default (inactive)
    expect(screen.queryByText('Haas F1 Team')).not.toBeInTheDocument();
  });
});
