// frontend/src/components/TeamCard/TeamCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import { TeamCard } from './TeamCard';
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

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('TeamCard', () => {
  it('renders without crashing', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(
      <TeamCard
        teamKey="red_bull"
        countryName="Austria"
        countryFlagEmoji="🇦🇹"
        points={100}
        maxPoints={200}
        wins={5}
        podiums={10}
        carImage="/test-car.png"
        onClick={mockOnClick}
      />
    );
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('renders with custom team name override', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(
      <TeamCard
        teamKey="historical"
        teamName="Lotus"
        countryName="British"
        countryFlagEmoji="🇬🇧"
        points={50}
        maxPoints={200}
        wins={2}
        podiums={5}
        carImage="/test-car.png"
        onClick={mockOnClick}
      />
    );
    expect(screen.getByText('Lotus')).toBeInTheDocument();
  });
});

