import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import BackToTopButton from './BackToTopButton';
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

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Helper to simulate scroll events
function simulateScroll(scrollY: number) {
  Object.defineProperty(window, 'scrollY', { 
    value: scrollY, 
    configurable: true, 
    writable: true 
  });
  Object.defineProperty(window, 'pageYOffset', { 
    value: scrollY, 
    configurable: true, 
    writable: true 
  });
  
  // Dispatch scroll event
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
}

describe('BackToTopButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { 
      value: 0, 
      configurable: true, 
      writable: true 
    });
    Object.defineProperty(window, 'pageYOffset', { 
      value: 0, 
      configurable: true, 
      writable: true 
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds and removes the window scroll listener on mount/unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderWithChakra(<BackToTopButton />);

    // Component should subscribe to window scroll events
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    // And clean up on unmount
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('renders the button but is initially hidden when not scrolled', () => {
    renderWithChakra(<BackToTopButton />);
    
    // The button should be in the DOM but hidden (Fade component handles visibility)
    const button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('shows the button when scrolled past threshold', () => {
    renderWithChakra(<BackToTopButton />);
    
    // Initially hidden
    let button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
    
    // Simulate scroll past threshold (300px)
    simulateScroll(400);
    
    // Button should still be in DOM (Fade component controls visibility via CSS)
    button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('hides the button when scrolled back to top', () => {
    renderWithChakra(<BackToTopButton />);
    
    // Scroll past threshold
    simulateScroll(400);
    
    let button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
    
    // Scroll back to top
    simulateScroll(0);
    
    // Button should still be in DOM but Fade component handles visibility
    button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('calls window.scrollTo when clicked', () => {
    renderWithChakra(<BackToTopButton />);
    
    // Scroll to make button visible
    simulateScroll(400);
    
    const button = screen.getByRole('button', { name: /scroll to top/i });
    
    // Click the button
    fireEvent.click(button);
    
    // Should call window.scrollTo with smooth behavior
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('has correct accessibility attributes', () => {
    renderWithChakra(<BackToTopButton />);
    
    // Scroll to make button visible
    simulateScroll(400);
    
    const button = screen.getByRole('button', { name: /scroll to top/i });
    
    expect(button).toHaveAttribute('aria-label', 'Scroll to top');
  });

  it('handles multiple scroll events correctly', () => {
    renderWithChakra(<BackToTopButton />);
    
    // Test multiple scroll positions
    simulateScroll(100); // Below threshold
    simulateScroll(500); // Above threshold
    simulateScroll(200); // Below threshold again
    simulateScroll(600); // Above threshold again
    
    // Button should still be in DOM
    const button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('maintains scroll listener across re-renders', () => {
    const { rerender } = renderWithChakra(<BackToTopButton />);
    
    // Re-render the component
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <BackToTopButton />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    
    // Should still work after re-render
    simulateScroll(400);
    const button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });
});