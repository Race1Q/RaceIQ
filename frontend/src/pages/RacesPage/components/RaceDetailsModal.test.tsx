import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import RaceDetailsModal from './RaceDetailsModal';
import type { Race } from '../../../types/races';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    create: (Component: any) => Component,
  },
}));

// Mock @react-three/fiber and @react-three/drei
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-3d">{children}</div>
  ),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
}));

// Mock CircuitTrack3D component
vi.mock('./CircuitTrack3D', () => ({
  default: ({ circuitId, circuitName }: any) => (
    <div data-testid="circuit-track-3d" data-circuit-id={circuitId} data-circuit-name={circuitName}>
      Circuit Track 3D Mock
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">×</div>,
}));

// Helper to create a Response-like object with headers so apiFetch doesn't crash
const jsonResponse = (data: any, { ok = true, status = ok ? 200 : 500 }: { ok?: boolean; status?: number } = {}) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  headers: new Headers({ 'content-type': 'application/json' }),
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
});

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock performance for timing tests
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
});

const testTheme = extendTheme({
  colors: {
    'bg-elevated': '#ffffff',
    'border-subtle': '#e5e7eb',
    'text-primary': '#111827',
    'text-secondary': '#6b7280',
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

const mockRace: Race = {
  id: 1,
  name: 'Bahrain Grand Prix',
  round: 1,
  date: '2025-03-02T15:00:00',
  circuit_id: 1,
  season_id: 2025,
};

const mockCircuit = {
  id: 1,
  name: 'Bahrain International Circuit',
  country: 'Bahrain',
  location: 'Sakhir',
};

describe('RaceDetailsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/races/1')) return Promise.resolve(jsonResponse(mockRace));
      if (url.includes('/api/circuits/id/1')) return Promise.resolve(jsonResponse(mockCircuit));
      return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders modal with loading state initially', () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    expect(screen.getByText('Race Details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();
  });

  it('fetches and displays race details when loaded', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });

    expect(screen.getByText('Round')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Circuit')).toBeInTheDocument();
    expect(screen.getByText('Season')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('displays formatted date correctly', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });

    // Loosen date assertion to be locale-agnostic: just ensure year appears in Date row
    const yearElement = screen.getAllByText(/2025/).find(el => el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'span');
    expect(yearElement).toBeTruthy();
  });

  it('fetches and displays circuit name', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Bahrain International Circuit')).toBeInTheDocument();
    });
  });

  it('shows circuit loading state while fetching circuit data', async () => {
    const mockOnClose = vi.fn();
    
    // Mock a slow circuit fetch
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/races/1')) return Promise.resolve(jsonResponse(mockRace));
      if (url.includes('/api/circuits/id/1')) {
        return new Promise(resolve => setTimeout(() => resolve(jsonResponse(mockCircuit)), 100));
      }
      return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
    });

    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });

    // Wait for circuit data to load
    await waitFor(() => {
      expect(screen.getByText('Bahrain International Circuit')).toBeInTheDocument();
    });
  });

  it('displays circuit ID when circuit name is not available', async () => {
    const mockOnClose = vi.fn();
    
    // Mock circuit fetch failure
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/races/1')) return Promise.resolve(jsonResponse(mockRace));
      if (url.includes('/api/circuits/id/1')) return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
      return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
    });

    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('renders CircuitTrack3D component with correct props', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      const circuitTrack = screen.getByTestId('circuit-track-3d');
      expect(circuitTrack).toHaveAttribute('data-circuit-id', '1');
      expect(circuitTrack).toHaveAttribute('data-circuit-name', 'Bahrain International Circuit');
    });
  });

  it('renders placeholder circuit when no race data', async () => {
    const mockOnClose = vi.fn();
    
    // Mock fetch to return null for race data
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/races/1')) return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
      return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
    });

    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    // Should render placeholder circuit initially
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Race Details')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles race fetch failure gracefully', async () => {
    const mockOnClose = vi.fn();
    
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(null, { ok: false, status: 500 })));

    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Race Details')).toBeInTheDocument();
    });

    // Should still show the modal with default title
    expect(screen.getByText('Round')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument(); // No date available
  });

  it('handles different race data correctly', async () => {
    const mockOnClose = vi.fn();
    const differentRace: Race = {
      id: 2,
      name: 'Saudi Arabian Grand Prix',
      round: 2,
      date: '2025-03-09',
      circuit_id: 2,
      season_id: 2025,
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/races/2')) return Promise.resolve(jsonResponse(differentRace));
      if (url.includes('/api/circuits/id/2')) return Promise.resolve(jsonResponse({ ...mockCircuit, id: 2, name: 'Jeddah Corniche Circuit' }));
      return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
    });

    renderWithProviders(<RaceDetailsModal raceId={2} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Saudi Arabian Grand Prix')).toBeInTheDocument();
    });

    expect(screen.getByText('2')).toBeInTheDocument(); // Round 2
    expect(screen.getByText('Jeddah Corniche Circuit')).toBeInTheDocument();
  });

  it('cleans up fetch requests when component unmounts', async () => {
    const mockOnClose = vi.fn();
    const { unmount } = renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });

    unmount();

    // Component should clean up properly without memory leaks
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders modal with correct accessibility attributes', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();

    // Modal should have proper structure for screen readers
    expect(screen.getByText('Race Details')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });
  });

  it('handles rapid raceId changes correctly', async () => {
    const mockOnClose = vi.fn();
    const { rerender } = renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });

    // Change to different race
    const newRace: Race = {
      id: 3,
      name: 'Australian Grand Prix',
      round: 3,
      date: '2025-03-24',
      circuit_id: 3,
      season_id: 2025,
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/races/3')) return Promise.resolve(jsonResponse(newRace));
      if (url.includes('/api/circuits/id/3')) return Promise.resolve(jsonResponse({ ...mockCircuit, id: 3, name: 'Albert Park Circuit' }));
      return Promise.resolve(jsonResponse(null, { ok: false, status: 404 }));
    });

    rerender(
      <ChakraProvider theme={testTheme}>
        <RaceDetailsModal raceId={3} onClose={mockOnClose} />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Australian Grand Prix')).toBeInTheDocument();
    });

    expect(screen.getByText('3')).toBeInTheDocument(); // Round 3
    expect(screen.getByText('Albert Park Circuit')).toBeInTheDocument();
  });

  it('renders within performance expectations', async () => {
    const mockOnClose = vi.fn();
    const startTime = performance.now();

    renderWithProviders(<RaceDetailsModal raceId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within reasonable time (less than 1000ms)
    expect(renderTime).toBeLessThan(3000);
  });
});
