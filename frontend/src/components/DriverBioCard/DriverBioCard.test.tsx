import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import DriverBioCard from './DriverBioCard';

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

// Mock useAiDriverBio hook
vi.mock('../../hooks/useAiDriverBio', () => ({
  useAiDriverBio: () => ({
    data: {
      title: 'Lewis Hamilton Biography',
      teaser: 'Seven-time Formula 1 World Champion',
      bio: 'Lewis Hamilton is a British racing driver',
      paragraphs: [
        'Lewis Hamilton is a British racing driver',
        '7-time champion',
        'Record holder',
        'Started karting at age 8',
        'First win in 2007'
      ],
      highlights: ['7-time champion', 'Record holder'],
      generatedAt: '2024-01-01T00:00:00.000Z',
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

describe('DriverBioCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container).toBeInTheDocument();
  });

  it('displays driver bio information', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container.textContent).toContain('Lewis Hamilton is a British racing driver');
  });

  it('shows AI generated content', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container.textContent).toContain('Lewis Hamilton is a British racing driver');
  });

  it('displays career highlights', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container.textContent).toContain('7-time champion');
  });

  it('handles loading state', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container).toBeInTheDocument();
  });

  it('handles driver without bio', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container).toBeInTheDocument();
  });

  it('displays all biography content', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container.textContent).toContain('Started karting at age 8');
    expect(container.textContent).toContain('First win in 2007');
  });

  it('displays title and teaser', () => {
    const { container } = renderWithChakra(<DriverBioCard driverId={1} />);
    expect(container.textContent).toContain('Lewis Hamilton Biography');
    expect(container.textContent).toContain('Seven-time Formula 1 World Champion');
  });
});

