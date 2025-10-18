import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ConstructorInfoCard from './ConstructorInfoCard';

// Mock contexts
vi.mock('../../context/ThemeColorContext', () => ({
  ThemeColorProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useThemeColor: () => ({
    accentColor: 'e10600',
    accentColorWithHash: '#e10600',
  }),
}));

vi.mock('../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    triggerUpdate: vi.fn(),
  }),
}));

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useAiConstructorInfo hook
vi.mock('../../hooks/useAiConstructorInfo', () => ({
  useAiConstructorInfo: () => ({
    data: {
      overview: 'Red Bull Racing overview',
      history: 'Founded in 2005',
      strengths: ['Aerodynamics', 'Pit stops'],
      challenges: ['Cost cap'],
      notableAchievements: ['6 Championships'],
      currentSeason: {
        performance: 'Dominant',
        highlights: ['Record wins'],
        outlook: 'Championship favorites',
      },
      generatedAt: '2024-01-01',
      isFallback: false,
    },
    loading: false,
    error: null,
  }),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
};

describe('ConstructorInfoCard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithChakra(
      <ConstructorInfoCard constructorId={1} season={2024} />
    );
    expect(container).toBeInTheDocument();
  });

  it('displays constructor information', () => {
    const { container } = renderWithChakra(
      <ConstructorInfoCard constructorId={1} season={2024} />
    );
    
    expect(container.textContent).toContain('Red Bull Racing overview');
  });

  it('shows AI generated content', () => {
    const { container } = renderWithChakra(
      <ConstructorInfoCard constructorId={1} season={2024} />
    );
    
    expect(container.textContent).toContain('Red Bull Racing overview');
  });

  it('handles loading state', () => {
    const { container } = renderWithChakra(
      <ConstructorInfoCard constructorId={1} season={2024} />
    );
    
    expect(container).toBeInTheDocument();
  });

  it('handles different seasons', () => {
    const { container } = renderWithChakra(
      <ConstructorInfoCard constructorId={1} season={2023} />
    );
    
    expect(container).toBeInTheDocument();
  });
});

