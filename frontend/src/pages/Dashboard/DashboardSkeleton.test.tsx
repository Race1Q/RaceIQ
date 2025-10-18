import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import DashboardSkeleton from './DashboardSkeleton';

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

const renderWithChakra = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
};

describe('DashboardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = renderWithChakra(<DashboardSkeleton />);
    expect(container).toBeInTheDocument();
  });

  it('displays skeleton loading elements', () => {
    const { container } = renderWithChakra(<DashboardSkeleton />);
    
    // Check for custom skeleton elements (not Chakra skeletons)
    const boxElements = container.querySelectorAll('[class*="css-"]');
    expect(boxElements.length).toBeGreaterThan(0);
  });

  it('maintains dashboard layout structure', () => {
    const { container, getByText } = renderWithChakra(<DashboardSkeleton />);
    
    expect(container.firstChild).toBeTruthy();
    expect(getByText('Loading your personalized dashboard...')).toBeInTheDocument();
  });
});

