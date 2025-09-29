import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Mock Auth0 - simple approach like existing tests
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock the home page data hook - simple approach
vi.mock('../../hooks/useHomePageData', () => ({
  useHomePageData: () => ({
    featuredDriver: {
      id: 1,
      fullName: 'Max Verstappen',
      driverNumber: 1,
      countryCode: 'NED',
      teamName: 'Red Bull Racing',
      seasonPoints: 310,
      seasonWins: 10,
      position: 1,
      careerStats: {
        wins: 61,
        podiums: 110,
        poles: 42,
        totalPoints: 2700,
        fastestLaps: 32,
        racesCompleted: 190,
      },
      recentForm: [
        { position: 1, raceName: 'Italian Grand Prix', countryCode: 'ITA' },
        { position: 2, raceName: 'Dutch Grand Prix', countryCode: 'NLD' },
      ],
    },
    seasonSchedule: [
      {
        id: 1,
        name: 'Bahrain Grand Prix',
        round: 1,
        date: '2024-03-02',
        circuit: {
          id: 1,
          name: 'Bahrain International Circuit',
          country_code: 'BHR',
        },
        podium: null,
      },
      {
        id: 2,
        name: 'Saudi Arabian Grand Prix',
        round: 2,
        date: '2024-03-09',
        circuit: {
          id: 2,
          name: 'Jeddah Corniche Circuit',
          country_code: 'SAU',
        },
        podium: null,
      },
    ],
    loading: false,
    error: null,
  }),
}));

// Mock all the components to avoid complex rendering
vi.mock('../../components/HeroSection/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero Section</div>,
}));

vi.mock('../../components/FeaturedDriverSection/FeaturedDriverSection', () => ({
  default: ({ featuredDriver, isError }: any) => (
    <div data-testid="featured-driver-section">
      Featured Driver: {featuredDriver?.fullName || 'No driver'}
      {isError && ' (Error)'}
    </div>
  ),
}));

vi.mock('../../components/ComparePreviewSection/ComparePreviewSection', () => ({
  default: () => <div data-testid="compare-preview-section">Compare Preview</div>,
}));

vi.mock('../../components/RaceSlider/RaceSlider', () => ({
  RaceSlider: ({ seasonSchedule }: any) => (
    <div data-testid="race-slider">
      Races: {seasonSchedule?.length || 0}
    </div>
  ),
}));

vi.mock('../../components/LoginButton/LoginButton', () => ({
  default: () => <button data-testid="login-button">Login</button>,
}));

vi.mock('../../components/ScrollAnimationWrapper/ScrollAnimationWrapper', () => ({
  default: ({ children }: any) => <div data-testid="scroll-wrapper">{children}</div>,
}));

vi.mock('../../components/SectionConnector/SectionConnector', () => ({
  default: () => <div data-testid="section-connector">Section Connector</div>,
}));

vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

function renderPage(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section for all users', () => {
    renderPage(<HomePage />);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders featured driver section for unauthenticated users', () => {
    renderPage(<HomePage />);

    expect(screen.getByTestId('featured-driver-section')).toBeInTheDocument();
    expect(screen.getByText(/Featured Driver: Max Verstappen/)).toBeInTheDocument();
  });

  it('renders compare preview section for unauthenticated users', () => {
    renderPage(<HomePage />);

    expect(screen.getByTestId('compare-preview-section')).toBeInTheDocument();
  });

  it('renders recent races section for all users', () => {
    renderPage(<HomePage />);

    expect(screen.getByText('Recent Races')).toBeInTheDocument();
    expect(screen.getByTestId('race-slider')).toBeInTheDocument();
    expect(screen.getByText('Races: 2')).toBeInTheDocument();
  });

  it('renders login CTA for unauthenticated users', () => {
    renderPage(<HomePage />);

    expect(screen.getByText('Create your free account and get more from every race.')).toBeInTheDocument();
    expect(screen.getByText('Track your favorite drivers, get personalized insights, and never miss a race.')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('calls window.scrollTo on mount', () => {
    renderPage(<HomePage />);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('renders scroll animation wrappers for unauthenticated users', () => {
    renderPage(<HomePage />);

    const scrollWrappers = screen.getAllByTestId('scroll-wrapper');
    expect(scrollWrappers).toHaveLength(2);
    expect(screen.getByTestId('section-connector')).toBeInTheDocument();
  });

  it('renders proper heading structure', () => {
    renderPage(<HomePage />);

    // Check that the Recent Races heading is properly structured
    const recentRacesHeading = screen.getByRole('heading', { name: 'Recent Races' });
    expect(recentRacesHeading).toBeInTheDocument();
    expect(recentRacesHeading.tagName).toBe('H4');
  });

  it('renders all main sections for unauthenticated users', () => {
    renderPage(<HomePage />);

    // Check all main sections are present
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('featured-driver-section')).toBeInTheDocument();
    expect(screen.getByTestId('compare-preview-section')).toBeInTheDocument();
    expect(screen.getByTestId('race-slider')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('renders correct number of scroll animation wrappers', () => {
    renderPage(<HomePage />);

    const scrollWrappers = screen.getAllByTestId('scroll-wrapper');
    expect(scrollWrappers).toHaveLength(2);
    
    // Check that section connector is present
    expect(screen.getByTestId('section-connector')).toBeInTheDocument();
  });
});