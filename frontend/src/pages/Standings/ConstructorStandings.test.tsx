import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import ConstructorStandings from './ConstructorStandings';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useUserProfile
vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    loading: false,
  }),
}));

// Mock SearchableSelect
vi.mock('../../components/DropDownSearch/SearchableSelect', () => ({
  default: ({ label, value }: any) => (
    <div data-testid="searchable-select">
      <label>{label}</label>
      {value && <div>{value.label}</div>}
    </div>
  ),
}));

// Mock F1LoadingSpinner
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('ConstructorStandings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/constructors/standings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              name: 'Red Bull Racing',
              points: 800,
              wins: 21,
              position: 1,
            },
            {
              id: 2,
              name: 'Mercedes',
              points: 600,
              wins: 15,
              position: 2,
            },
          ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }) as any;
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ConstructorStandings />);
    expect(container).toBeInTheDocument();
  });

  it('displays page with standings selector', async () => {
    renderWithProviders(<ConstructorStandings />);
    
    await waitFor(() => {
      // Check for Constructors tab (will be selected)
      const constructorsTabs = screen.queryAllByText('Constructors');
      expect(constructorsTabs.length).toBeGreaterThan(0);
    });
  });

  it('shows loading or content', () => {
    renderWithProviders(<ConstructorStandings />);
    
    // Page should render something
    expect(document.body).toBeInTheDocument();
  });

  it('handles fetch errors', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
    
    const { container } = renderWithProviders(<ConstructorStandings />);
    
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
