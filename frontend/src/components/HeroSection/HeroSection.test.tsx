// src/components/HeroSection/HeroSection.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import HeroSection from './HeroSection';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    loginWithRedirect: vi.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
  })),
}));

// Mock useParallax hook
vi.mock('../../hooks/useParallax', () => ({
  useParallax: vi.fn(() => 0), // Return 0 for predictable testing
}));

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));

vi.mock('gsap/ScrollToPlugin', () => ({
  ScrollToPlugin: {},
}));

// Mock Chakra UI icons
vi.mock('@chakra-ui/icons', () => ({
  ChevronDownIcon: (props: any) => (
    <svg {...props} data-testid="chevron-down-icon">
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor" />
    </svg>
  ),
}));

// Force predictable responsive behavior (Chakra sometimes checks matchMedia)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock window.innerHeight for scroll functionality
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 800,
});

function renderWithChakra(ui: React.ReactNode) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and subtitle by default', () => {
    renderWithChakra(
      <HeroSection title="Beyond the Finish Line" subtitle="Telemetry that actually helps." />
    );

    expect(
      screen.getByRole('heading', { name: /beyond the finish line/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/telemetry that actually helps\./i)).toBeInTheDocument();
  });

  it('renders default title and subtitle when no props provided', () => {
    renderWithChakra(<HeroSection />);

    expect(
      screen.getByRole('heading', { name: /track every f1 appearance/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/view race results and appearances/i)).toBeInTheDocument();
  });

  it('renders custom title and subtitle when provided', () => {
    renderWithChakra(
      <HeroSection title="Custom Title" subtitle="Custom Subtitle" />
    );

    expect(screen.getByRole('heading', { name: /custom title/i })).toBeInTheDocument();
    expect(screen.getByText(/custom subtitle/i)).toBeInTheDocument();
  });

  it('renders an outer container element', () => {
    const { container } = renderWithChakra(<HeroSection title="t" subtitle="s" />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toBeInTheDocument();
  });

  it('renders background image overlay', () => {
    const { container } = renderWithChakra(<HeroSection title="t" subtitle="s" />);
    const outer = container.firstElementChild as HTMLElement;
    const overlay = outer?.firstElementChild as HTMLElement;
    expect(overlay).toBeInTheDocument();
  });

  it('renders ChevronDownIcon', () => {
    renderWithChakra(<HeroSection />);
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
  });

  it('calls gsap.to when ChevronDownIcon is clicked', async () => {
    const { gsap } = await import('gsap');
    renderWithChakra(<HeroSection />);
    
    const chevronIcon = screen.getByTestId('chevron-down-icon');
    fireEvent.click(chevronIcon.closest('div')!);
    
    expect(vi.mocked(gsap.to)).toHaveBeenCalledWith(window, {
      duration: 1.2,
      scrollTo: 700, // window.innerHeight (800) - headerOffsetPx (100)
      ease: 'power2.inOut'
    });
  });

  it('renders with correct heading level (h1)', () => {
    renderWithChakra(<HeroSection title="Test Title" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Title');
  });

  it('renders with responsive text alignment', () => {
    const { container } = renderWithChakra(<HeroSection />);
    const vstack = container.querySelector('.chakra-stack');
    expect(vstack).toBeInTheDocument();
  });

  it('renders container with max width', () => {
    const { container } = renderWithChakra(<HeroSection />);
    const containerElement = container.querySelector('.chakra-container');
    expect(containerElement).toBeInTheDocument();
  });

  it('handles empty title gracefully', () => {
    renderWithChakra(<HeroSection title="" subtitle="Test subtitle" />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('');
  });

  it('handles empty subtitle gracefully', () => {
    renderWithChakra(<HeroSection title="Test title" subtitle="" />);
    const textElements = screen.getAllByRole('paragraph');
    expect(textElements).toHaveLength(1);
    expect(textElements[0]).toHaveTextContent('');
  });

  it('handles prop changes correctly', () => {
    renderWithChakra(<HeroSection title="Title 1" subtitle="Subtitle 1" />);
    
    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.getByText('Subtitle 1')).toBeInTheDocument();
    
    // Test that component can handle different props without crashing
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('paragraph')).toBeInTheDocument();
  });

  it('renders multiple instances correctly', () => {
    const { unmount: unmount1 } = renderWithChakra(<HeroSection title="First" />);
    expect(screen.getByText('First')).toBeInTheDocument();
    
    unmount1();
    
    const { unmount: unmount2 } = renderWithChakra(<HeroSection title="Second" />);
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    
    unmount2();
  });
});
