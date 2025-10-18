// frontend/src/components/SegmentTabs/SegmentTabs.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { SegmentTabs } from './SegmentTabs';
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

describe('SegmentTabs', () => {
  it('renders without crashing', () => {
    const mockOnChange = vi.fn();
    renderWithProviders(<SegmentTabs value="active" onChange={mockOnChange} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

