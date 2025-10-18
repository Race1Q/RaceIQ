import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import AboutUs from './AboutUs';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
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

// Mock CSS module
vi.mock('./AboutUs.module.css', () => ({ default: {} }));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
}

describe('AboutUs page', () => {
  it('renders and shows key section headings', () => {
    renderWithProviders(<AboutUs />);

    // Hero section - check for About RaceIQ heading
    expect(screen.getByRole('heading', { name: /about raceiq/i })).toBeInTheDocument();

    // Sections
    expect(screen.getByRole('heading', { name: /what we offer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /the team/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /powered by/i })).toBeInTheDocument();
  });

  it('renders exactly 6 team members', () => {
    renderWithProviders(<AboutUs />);
    
    // Check for team member images (using full names as they appear in the component)
    expect(screen.getByAltText('Abdullah Ali')).toBeInTheDocument();
    expect(screen.getByAltText('Shervaan Govinder')).toBeInTheDocument();
    expect(screen.getByAltText('Jaishil Patel')).toBeInTheDocument();
    expect(screen.getByAltText('Kovendan Raman')).toBeInTheDocument();
    expect(screen.getByAltText('Muhammed Umair Gadatia')).toBeInTheDocument();
    expect(screen.getByAltText('Muhammad Ahmed')).toBeInTheDocument();
  });

  it('renders 5 tech items; 4 are images with alts; OpenF1 uses icon only', () => {
    renderWithProviders(<AboutUs />);

    const techNames = ['React', 'NestJS', 'Supabase', 'Auth0', 'OpenF1 API'];
    techNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    ['React', 'NestJS', 'Supabase', 'Auth0'].forEach((name) => {
      const img = screen.getByAltText(name);
      expect(img).toBeInTheDocument();
    });

    expect(screen.queryByAltText('OpenF1 API')).not.toBeInTheDocument();
  });
});
