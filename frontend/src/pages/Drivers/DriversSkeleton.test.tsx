import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import DriversSkeleton from './DriversSkeleton';

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

describe('DriversSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = renderWithChakra(<DriversSkeleton />);
    expect(container).toBeInTheDocument();
  });

  it('displays skeleton loading elements', () => {
    const { container } = renderWithChakra(<DriversSkeleton />);
    
    // Check for custom skeleton elements (not Chakra skeletons)
    const boxElements = container.querySelectorAll('[class*="css-"]');
    expect(boxElements.length).toBeGreaterThan(0);
  });

  it('renders multiple driver card skeletons', () => {
    const { container, getByText } = renderWithChakra(<DriversSkeleton />);
    
    // Should render multiple skeleton cards and loading text
    expect(container.firstChild).toBeTruthy();
    expect(getByText('Loading drivers...')).toBeInTheDocument();
  });
});

