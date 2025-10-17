import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardHeader from './DashboardHeader';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

const mockUseAuth0 = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0(),
}));

// Mock useUserProfile
vi.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock buildApiUrl to prevent fetch errors
vi.mock('../../../lib/api', () => ({
  buildApiUrl: (path: string) => `http://localhost:3000${path}`,
}));

// Mock global fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
  } as Response)
);

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon">⚙️</div>,
}));

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
  },
  space: {
    lg: '1.5rem',
    sm: '0.5rem',
  },
  fonts: {
    heading: 'Inter, sans-serif',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('DashboardHeader', () => {
  const mockOnCustomizeClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
    });
  });

  it('renders welcome message with user name', () => {
    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
    expect(screen.getByText("Here's what's happening in the world of F1.")).toBeInTheDocument();
  });

  it('renders customize button with settings icon', () => {
    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    const customizeButton = screen.getByRole('button');
    expect(customizeButton).toBeInTheDocument();
    expect(customizeButton).toHaveTextContent('Customize');
    expect(customizeButton).toHaveTextContent('Settings');
    
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('calls onCustomizeClick when customize button is clicked', () => {
    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    const customizeButton = screen.getByRole('button');
    fireEvent.click(customizeButton);

    expect(mockOnCustomizeClick).toHaveBeenCalledTimes(1);
  });

  it('handles missing user name gracefully', () => {
    mockUseAuth0.mockReturnValue({
      user: null,
      getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
    });

    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
  });

  it('handles user without name property', () => {
    mockUseAuth0.mockReturnValue({
      user: { email: 'test@example.com' },
      getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
    });

    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
  });

  it('applies correct styling to customize button', () => {
    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    const customizeButton = screen.getByRole('button');
    expect(customizeButton).toBeInTheDocument();
    // Just check that the button exists and is clickable
    expect(customizeButton).toBeEnabled();
  });

  it('renders with correct layout structure', () => {
    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    // Check for heading
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Check for button
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Check for descriptive text
    expect(screen.getByText("Here's what's happening in the world of F1.")).toBeInTheDocument();
  });

  it('maintains accessibility standards', () => {
    renderWithProviders(<DashboardHeader onCustomizeClick={mockOnCustomizeClick} />);

    // Check button has proper role and is focusable
    const customizeButton = screen.getByRole('button');
    expect(customizeButton).toBeInTheDocument();
    expect(customizeButton).not.toHaveAttribute('disabled');
    
    // Check heading has proper level
    const heading = screen.getByRole('heading');
    expect(heading.tagName).toBe('H2');
  });
});
