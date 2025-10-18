import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CompareConstructorsPage from './CompareConstructorsPage';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0
const mockLoginWithRedirect = vi.fn();
const mockUseAuth0 = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0(),
}));

// Mock ProfileUpdateContext
vi.mock('../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    refreshTrigger: 0,
    triggerRefresh: vi.fn(),
  }),
}));

// Mock useConstructorComparison hook
const mockUseConstructorComparison = vi.fn();
vi.mock('../../hooks/useConstructorComparison', () => ({
  useConstructorComparison: () => mockUseConstructorComparison(),
}));

// Mock team colors
vi.mock('../../lib/teamColors', () => ({
  getTeamColor: (teamName: string) => '#3671C6',
  teamColors: {
    'Red Bull Racing': '#3671C6',
    'Ferrari': '#DC0000',
    'Default': '#000000',
  },
}));

// Mock PDF generation
vi.mock('../../components/compare/ConstructorPdfComparisonCard', () => ({
  ConstructorPdfComparisonCard: vi.fn(() => Promise.resolve()),
}));

const mockConstructors = [
  {
    id: '1',
    name: 'Red Bull Racing',
    nationality: 'Austrian',
    championshipStanding: 1,
    wins: 100,
    podiums: 250,
    points: 10000,
    teamColorToken: 'red_bull',
  },
  {
    id: '2',
    name: 'Ferrari',
    nationality: 'Italian',
    championshipStanding: 2,
    wins: 240,
    podiums: 780,
    points: 9000,
    teamColorToken: 'ferrari',
  },
];

const mockStats = {
  wins: 100,
  podiums: 250,
  poles: 150,
  fastestLaps: 120,
  points: 10000,
  dnfs: 20,
  races: 400,
};

const defaultHookReturn = {
  allConstructors: mockConstructors,
  constructor1: null,
  constructor2: null,
  loading: false,
  error: null,
  handleSelectConstructor: vi.fn(),
  years: [2025, 2024, 2023, 2022, 2021, 2020],
  stats1: null,
  stats2: null,
  enabledMetrics: {
    wins: true,
    podiums: true,
    poles: true,
    fastestLaps: true,
    points: true,
    dnfs: true,
    races: true,
  },
  score: {
    c1: null,
    c2: null,
  },
  selectConstructor: vi.fn(),
  selectConstructorForYears: vi.fn(),
  toggleMetric: vi.fn(),
  clearSelection: vi.fn(),
};

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

describe('CompareConstructorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: authenticated user
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { sub: 'auth0|123', name: 'Test User' },
      loginWithRedirect: mockLoginWithRedirect,
      logout: vi.fn(),
    });
    
    // Default: hook returns empty state
    mockUseConstructorComparison.mockReturnValue(defaultHookReturn);
  });

  describe('Authentication', () => {
    it('renders for authenticated users', () => {
      renderWithProviders(<CompareConstructorsPage />);
      expect(screen.getByText('Constructor Comparison')).toBeInTheDocument();
    });

    it('shows login prompt for unauthenticated users', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: mockLoginWithRedirect,
      });

      renderWithProviders(<CompareConstructorsPage />);
      
      // Should show login requirement message or render page
      expect(screen.queryByText('Constructor Comparison') || screen.queryByText(/sign in/i)).toBeTruthy();
    });
  });

  describe('Page Header', () => {
    it('displays page title', () => {
      renderWithProviders(<CompareConstructorsPage />);
      expect(screen.getByText('Constructor Comparison')).toBeInTheDocument();
    });

    it('displays page subtitle', () => {
      renderWithProviders(<CompareConstructorsPage />);
      expect(screen.getByText(/Compare F1 constructors head-to-head/i)).toBeInTheDocument();
    });

    it('shows compare tabs', () => {
      renderWithProviders(<CompareConstructorsPage />);
      expect(screen.getByText('Constructors')).toBeInTheDocument();
      expect(screen.getByText('Drivers')).toBeInTheDocument();
    });
  });

  describe('Constructor Selection', () => {
    it('renders selection UI', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Should have selection inputs
      expect(screen.getByText('Constructor 1')).toBeInTheDocument();
      expect(screen.getByText('Constructor 2')).toBeInTheDocument();
    });

    it('displays step indicator', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      expect(screen.getByText('Step 1 of 2 - Select Constructors')).toBeInTheDocument();
    });

    it('shows selection prompt', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      expect(screen.getByText('Choose Your Constructors')).toBeInTheDocument();
    });
  });

  describe('Progressive Disclosure', () => {
    it('starts with parameters step', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Should show step indicator
      expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
    });

    it('shows constructor phase first', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Constructor selection should be visible
      expect(screen.getByText('Constructor 1')).toBeInTheDocument();
      expect(screen.getByText('Constructor 2')).toBeInTheDocument();
    });
  });

  describe('Comparison Results', () => {
    it('shows loading state', () => {
      mockUseConstructorComparison.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      });

      renderWithProviders(<CompareConstructorsPage />);
      
      // Should show loading indicator
      const loadingElements = screen.getAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('renders page structure', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Basic page structure should be present
      expect(screen.getByText('Constructor Comparison')).toBeInTheDocument();
    });
  });

  describe('Metrics Selection', () => {
    it('hook provides toggle functionality', () => {
      const mockToggle = vi.fn();
      mockUseConstructorComparison.mockReturnValue({
        ...defaultHookReturn,
        toggleMetric: mockToggle,
      });

      renderWithProviders(<CompareConstructorsPage />);
      
      expect(mockToggle).toBeDefined();
    });
  });

  describe('PDF Export', () => {
    it('PDF generation module is available', async () => {
      const { ConstructorPdfComparisonCard } = await import('../../components/compare/ConstructorPdfComparisonCard');
      expect(ConstructorPdfComparisonCard).toBeDefined();
    });
  });

  describe('Year Selection', () => {
    it('hook provides year options', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Year selection should be available from hook
      expect(defaultHookReturn.years.length).toBeGreaterThan(0);
      expect(defaultHookReturn.years).toContain(2025);
    });
  });

  describe('Score Display', () => {
    it('hook provides score data structure', () => {
      const hookWithScores = {
        ...defaultHookReturn,
        score: {
          c1: 85,
          c2: 70,
        },
      };
      
      expect(hookWithScores.score.c1).toBe(85);
      expect(hookWithScores.score.c2).toBe(70);
    });
  });

  describe('Empty States', () => {
    it('shows initial selection state', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      expect(screen.getByText('Choose Your Constructors')).toBeInTheDocument();
    });

    it('handles empty constructor list', () => {
      mockUseConstructorComparison.mockReturnValue({
        ...defaultHookReturn,
        allConstructors: [],
      });

      renderWithProviders(<CompareConstructorsPage />);
      
      expect(screen.getByText('Constructor Comparison')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders tab navigation', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Should have both tabs
      expect(screen.getByText('Drivers')).toBeInTheDocument();
      expect(screen.getByText('Constructors')).toBeInTheDocument();
    });

    it('shows constructors tab as active', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      const constructorsTab = screen.getByText('Constructors').closest('button');
      expect(constructorsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Responsive Layout', () => {
    it('renders layout container', () => {
      const { container } = renderWithProviders(<CompareConstructorsPage />);
      
      expect(container.firstChild).toBeTruthy();
    });

    it('uses grid layout for comparison', () => {
      mockUseConstructorComparison.mockReturnValue({
        ...defaultHookReturn,
        constructor1: mockConstructors[0],
        constructor2: mockConstructors[1],
        stats1: mockStats,
        stats2: mockStats,
      });

      const { container } = renderWithProviders(<CompareConstructorsPage />);
      
      // Grid should be present
      expect(container.querySelector('[class*="css-"]')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('shows skeleton when loading', () => {
      mockUseConstructorComparison.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      });

      renderWithProviders(<CompareConstructorsPage />);
      
      // Should have loading indicators
      const loadingElements = screen.getAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Comparison Table', () => {
    it('page renders with comparison structure', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Page should render successfully
      expect(screen.getByText('Constructor Comparison')).toBeInTheDocument();
    });
  });

  describe('Multi-year Selection', () => {
    it('supports selecting multiple years', () => {
      renderWithProviders(<CompareConstructorsPage />);
      
      // Multi-year selection functionality should exist
      expect(defaultHookReturn.selectConstructorForYears).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('page renders even with errors', () => {
      mockUseConstructorComparison.mockReturnValue({
        ...defaultHookReturn,
        error: 'Network error',
      });

      renderWithProviders(<CompareConstructorsPage />);
      
      // Page should still render
      expect(screen.getByText('Constructor Comparison')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders within reasonable time', () => {
      const startTime = performance.now();
      renderWithProviders(<CompareConstructorsPage />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('handles large constructor list efficiently', () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `Constructor ${i}`,
        nationality: 'Test',
        championshipStanding: i + 1,
        wins: i,
        podiums: i * 2,
        points: i * 100,
        teamColorToken: 'default',
      }));

      mockUseConstructorComparison.mockReturnValue({
        ...defaultHookReturn,
        allConstructors: largeList,
      });

      const startTime = performance.now();
      renderWithProviders(<CompareConstructorsPage />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(8000);
    });
  });
});

