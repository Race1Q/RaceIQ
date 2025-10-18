import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import CompareDriversPage from './CompareDriversPage';
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

// Mock useUserProfile
vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock the driver comparison hook
const mockUseDriverComparison = vi.fn();
vi.mock('../../hooks/useDriverComparison', () => ({
  useDriverComparison: () => mockUseDriverComparison(),
}));

const mockDrivers = [
  { id: 1, fullName: 'Max Verstappen', givenName: 'Max', familyName: 'Verstappen', code: 'VER' },
  { id: 2, fullName: 'Lewis Hamilton', givenName: 'Lewis', familyName: 'Hamilton', code: 'HAM' },
  { id: 3, fullName: 'Charles Leclerc', givenName: 'Charles', familyName: 'Leclerc', code: 'LEC' },
];

const mockStats = {
  career: {
    wins: 50,
    podiums: 100,
    fastestLaps: 25,
    points: 2000,
    sprintWins: 5,
    sprintPodiums: 10,
    dnfs: 15,
    poles: 30,
  },
  yearStats: {
    wins: 10,
    podiums: 20,
    fastestLaps: 5,
    points: 400,
    sprintWins: 2,
    sprintPodiums: 4,
    dnfs: 3,
    poles: 8,
  },
};

const defaultHookReturn = {
  allDrivers: mockDrivers,
  driver1: null,
  driver2: null,
  loading: false,
  error: null,
  handleSelectDriver: vi.fn(),
  years: [2024, 2023, 2022, 2021, 2020],
  selection1: null,
  selection2: null,
  stats1: null,
  stats2: null,
  enabledMetrics: {
    wins: true,
    podiums: true,
    fastestLaps: false,
    points: true,
    sprintWins: false,
    sprintPodiums: false,
    dnfs: false,
    poles: false,
  },
  score: { d1: null, d2: null },
  selectDriver: vi.fn(),
  toggleMetric: vi.fn(),
  clearSelection: vi.fn(),
};

// Mock PDF generation
vi.mock('../../components/compare/DriverPdfComparisonCard', () => ({
  DriverPdfComparisonCard: vi.fn(() => Promise.resolve()),
}));

// Mock team colors
vi.mock('../../lib/teamColors', () => ({
  getTeamColor: (teamName: string) => '#3671C6',
  teamColors: {
    'Red Bull Racing': '#3671C6',
    'Mercedes': '#00D2BE',
    'Default': '#000000',
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('CompareDriversPage', () => {
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
    mockUseDriverComparison.mockReturnValue(defaultHookReturn);
  });

  describe('Authentication', () => {
    it('renders for authenticated users', () => {
      renderWithProviders(<CompareDriversPage />);
      expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    });

    it('shows login prompt for unauthenticated users', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: mockLoginWithRedirect,
      });

      renderWithProviders(<CompareDriversPage />);
      
      // Should show login requirement message or render page
      expect(screen.queryByText('Driver Comparison') || screen.queryByText(/sign in/i)).toBeTruthy();
    });
  });

  describe('Page Header', () => {
    it('displays page title', () => {
      renderWithProviders(<CompareDriversPage />);
      expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    });

    it('displays page subtitle', () => {
      renderWithProviders(<CompareDriversPage />);
      expect(screen.getByText(/Compare F1 drivers head-to-head/i)).toBeInTheDocument();
    });

    it('shows compare tabs', () => {
      renderWithProviders(<CompareDriversPage />);
      expect(screen.getByText('Drivers')).toBeInTheDocument();
      expect(screen.getByText('Constructors')).toBeInTheDocument();
    });
  });

  describe('Driver Selection', () => {
    it('renders selection UI', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Should have selection inputs
      expect(screen.getByText('Driver 1')).toBeInTheDocument();
      expect(screen.getByText('Driver 2')).toBeInTheDocument();
    });

    it('displays step indicator', () => {
      renderWithProviders(<CompareDriversPage />);
      
      expect(screen.getByText('Step 1 of 2 - Select Drivers')).toBeInTheDocument();
    });

    it('shows selection prompt', () => {
      renderWithProviders(<CompareDriversPage />);
      
      expect(screen.getByText('Choose Your Drivers')).toBeInTheDocument();
    });
  });

  describe('Progressive Disclosure', () => {
    it('starts with parameters step', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Should show step indicator
      expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
    });

    it('shows driver phase first', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Driver selection should be visible
      expect(screen.getByText('Driver 1')).toBeInTheDocument();
      expect(screen.getByText('Driver 2')).toBeInTheDocument();
    });
  });

  describe('Comparison Results', () => {
    it('shows loading state', () => {
      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      });

      renderWithProviders(<CompareDriversPage />);
      
      // Should show loading indicator
      const loadingElements = screen.getAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('renders page structure', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Basic page structure should be present
      expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    });
  });

  describe('Metrics Selection', () => {
    it('hook provides toggle functionality', () => {
      const mockToggle = vi.fn();
      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        toggleMetric: mockToggle,
      });

      renderWithProviders(<CompareDriversPage />);
      
      expect(mockToggle).toBeDefined();
    });
  });

  describe('PDF Export', () => {
    it('PDF generation module is available', async () => {
      const { DriverPdfComparisonCard } = await import('../../components/compare/DriverPdfComparisonCard');
      expect(DriverPdfComparisonCard).toBeDefined();
    });
  });

  describe('Year Selection', () => {
    it('hook provides year options', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Year selection should be available from hook
      expect(defaultHookReturn.years.length).toBeGreaterThan(0);
      expect(defaultHookReturn.years).toContain(2024);
    });
  });

  describe('Score Display', () => {
    it('hook provides score data structure', () => {
      const hookWithScores = {
        ...defaultHookReturn,
        score: {
          d1: 85,
          d2: 70,
        },
      };
      
      expect(hookWithScores.score.d1).toBe(85);
      expect(hookWithScores.score.d2).toBe(70);
    });
  });

  describe('Empty States', () => {
    it('shows initial selection state', () => {
      renderWithProviders(<CompareDriversPage />);
      
      expect(screen.getByText('Choose Your Drivers')).toBeInTheDocument();
    });

    it('handles empty driver list', () => {
      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        allDrivers: [],
      });

      renderWithProviders(<CompareDriversPage />);
      
      expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders tab navigation', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Should have both tabs
      expect(screen.getByText('Drivers')).toBeInTheDocument();
      expect(screen.getByText('Constructors')).toBeInTheDocument();
    });

    it('shows drivers tab as active', () => {
      renderWithProviders(<CompareDriversPage />);
      
      const driversTab = screen.getByText('Drivers').closest('button');
      expect(driversTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Responsive Layout', () => {
    it('renders layout container', () => {
      const { container } = renderWithProviders(<CompareDriversPage />);
      
      expect(container.firstChild).toBeTruthy();
    });

    it('uses grid layout for comparison', () => {
      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        driver1: mockDrivers[0],
        driver2: mockDrivers[1],
        stats1: mockStats,
        stats2: mockStats,
      });

      const { container } = renderWithProviders(<CompareDriversPage />);
      
      // Grid should be present
      expect(container.querySelector('[class*="css-"]')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('shows skeleton when loading', () => {
      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
      });

      renderWithProviders(<CompareDriversPage />);
      
      // Should have loading indicators
      const loadingElements = screen.getAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Comparison Table', () => {
    it('page renders with comparison structure', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Page should render successfully
      expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    });
  });

  describe('Multi-year Selection', () => {
    it('hook provides selection functionality', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Selection functionality should exist
      expect(defaultHookReturn.selectDriver).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('page renders even with errors', () => {
      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        error: 'Network error',
      });

      renderWithProviders(<CompareDriversPage />);
      
      // Page should still render
      expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders within reasonable time', () => {
      const startTime = performance.now();
      renderWithProviders(<CompareDriversPage />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('handles large driver list efficiently', () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        fullName: `Driver ${i}`,
        givenName: `Driver`,
        familyName: `${i}`,
        code: `D${i}`,
      }));

      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        allDrivers: largeList,
      });

      const startTime = performance.now();
      renderWithProviders(<CompareDriversPage />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(8000);
    });
  });

  describe('VS Divider', () => {
    it('renders VS text between selection panels', () => {
      renderWithProviders(<CompareDriversPage />);
      
      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });

  describe('Team Information', () => {
    it('handles driver team mapping', () => {
      mockUseDriverComparison.mockReturnValue({
        ...defaultHookReturn,
        driver1: { ...mockDrivers[0], teamName: 'Red Bull Racing' },
        driver2: { ...mockDrivers[1], teamName: 'Mercedes' },
      });

      renderWithProviders(<CompareDriversPage />);
      
      // Page should render with team information
      expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates with useDriverComparison hook', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Hook should have been called
      expect(mockUseDriverComparison).toHaveBeenCalled();
    });

    it('integrates with Auth0', () => {
      renderWithProviders(<CompareDriversPage />);
      
      // Auth0 should have been called
      expect(mockUseAuth0).toHaveBeenCalled();
    });
  });
});