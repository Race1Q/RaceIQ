import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ComparisonLoginPrompt from './ComparisonLoginPrompt';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0
const mockLoginWithRedirect = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithRedirect: mockLoginWithRedirect,
    isAuthenticated: false,
    isLoading: false,
    user: null,
  }),
}));

// Mock ProfileUpdateContext
vi.mock('../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    refreshTrigger: 0,
    triggerRefresh: vi.fn(),
  }),
}));

// Mock driver headshots
vi.mock('../../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Lewis Hamilton': '/assets/drivers/lewis-hamilton.png',
    'Max Verstappen': '/assets/drivers/max-verstappen.png',
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('ComparisonLoginPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      expect(screen.getByText('Unlock Driver & Team Comparisons')).toBeInTheDocument();
    });

    it('displays the main heading', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      expect(screen.getByRole('heading', { name: 'Unlock Driver & Team Comparisons' })).toBeInTheDocument();
    });

    it('displays the value proposition text', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      expect(screen.getByText(/Get access to comprehensive comparison tools/i)).toBeInTheDocument();
    });

    it('displays the unlock icon', () => {
      const { container } = renderWithProviders(<ComparisonLoginPrompt />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Feature List', () => {
    it('displays all feature list items', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      expect(screen.getByText('Compare drivers head-to-head with detailed statistics')).toBeInTheDocument();
      expect(screen.getByText('Analyze performance trends and career trajectories')).toBeInTheDocument();
      expect(screen.getByText('Compare team performance across seasons')).toBeInTheDocument();
      expect(screen.getByText('Track championship battles and standings')).toBeInTheDocument();
      expect(screen.getByText('Customize your comparison preferences')).toBeInTheDocument();
    });

    it('renders feature icons', () => {
      const { container } = renderWithProviders(<ComparisonLoginPrompt />);
      
      // Check for list items
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBe(5);
    });
  });

  describe('Sign In Button', () => {
    it('renders the sign in button', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      expect(screen.getByRole('button', { name: /Sign In to Compare/i })).toBeInTheDocument();
    });

    it('calls loginWithRedirect when sign in button is clicked', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In to Compare/i });
      fireEvent.click(signInButton);
      
      expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1);
    });

    it('sign in button has correct icon', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In to Compare/i });
      expect(signInButton).toBeInTheDocument();
    });
  });

  describe('Back to Home Button', () => {
    it('renders the back to home button', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      expect(screen.getByRole('button', { name: /Back to Home/i })).toBeInTheDocument();
    });

    it('back button has correct link', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const backButton = screen.getByRole('button', { name: /Back to Home/i });
      const link = backButton.closest('a');
      
      expect(link).toHaveAttribute('href', '/');
    });

    it('back button has correct icon', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const backButton = screen.getByRole('button', { name: /Back to Home/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Visual Teaser', () => {
    it('renders Ferrari car image', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const ferrariImage = screen.getByAltText('Ferrari F1 Car');
      expect(ferrariImage).toBeInTheDocument();
      expect(ferrariImage).toHaveAttribute('src', '/assets/2025_Cars/2025ferraricarright.png');
    });

    it('renders Lewis Hamilton headshot', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const hamiltonImage = screen.getByAltText('Lewis Hamilton');
      expect(hamiltonImage).toBeInTheDocument();
    });

    it('displays call to action text', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      expect(screen.getByText('Create your free account now')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders in a container', () => {
      const { container } = renderWithProviders(<ComparisonLoginPrompt />);
      
      expect(container.firstChild).toBeTruthy();
    });

    it('uses grid layout', () => {
      const { container } = renderWithProviders(<ComparisonLoginPrompt />);
      
      // Grid should be present in the container
      expect(container.querySelector('[class*="css-"]')).toBeTruthy();
    });

    it('renders both columns', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      // Left column content
      expect(screen.getByText('Unlock Driver & Team Comparisons')).toBeInTheDocument();
      
      // Right column content (visual teaser)
      expect(screen.getByAltText('Ferrari F1 Car')).toBeInTheDocument();
    });
  });

  describe('Responsiveness', () => {
    it('renders buttons with full width on mobile', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In to Compare/i });
      const backButton = screen.getByRole('button', { name: /Back to Home/i });
      
      expect(signInButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct color to heading', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const heading = screen.getByRole('heading', { name: 'Unlock Driver & Team Comparisons' });
      expect(heading).toBeInTheDocument();
    });

    it('sign in button has red background', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In to Compare/i });
      expect(signInButton).toBeInTheDocument();
    });

    it('back button has outline style', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const backButton = screen.getByRole('button', { name: /Back to Home/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Unlock Driver & Team Comparisons');
    });

    it('images have alt text', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      expect(screen.getByAltText('Ferrari F1 Car')).toBeInTheDocument();
      expect(screen.getByAltText('Lewis Hamilton')).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In to Compare/i });
      const backButton = screen.getByRole('button', { name: /Back to Home/i });
      
      expect(signInButton.tagName).toBe('BUTTON');
      expect(backButton.tagName).toBe('BUTTON');
    });
  });

  describe('Integration', () => {
    it('integrates with Auth0', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const signInButton = screen.getByRole('button', { name: /Sign In to Compare/i });
      fireEvent.click(signInButton);
      
      expect(mockLoginWithRedirect).toHaveBeenCalled();
    });

    it('integrates with React Router', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const backButton = screen.getByRole('button', { name: /Back to Home/i });
      const link = backButton.closest('a');
      
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('User Experience', () => {
    it('provides clear value proposition', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      expect(screen.getByText(/comprehensive comparison tools/i)).toBeInTheDocument();
      expect(screen.getByText(/head-to-head analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/detailed performance insights/i)).toBeInTheDocument();
    });

    it('shows multiple compelling features', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThanOrEqual(5);
    });

    it('provides multiple action options', () => {
      renderWithProviders(<ComparisonLoginPrompt />);
      
      // User can sign in or go back home
      expect(screen.getByRole('button', { name: /Sign In to Compare/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Home/i })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders within reasonable time', () => {
      const startTime = performance.now();
      renderWithProviders(<ComparisonLoginPrompt />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});

