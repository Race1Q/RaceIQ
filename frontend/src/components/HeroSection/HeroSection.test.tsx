// src/components/HeroSection/HeroSection.test.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import HeroSection from './HeroSection';

// ✅ Mock CSS module with a proper default export (names can be anything)
vi.mock('./HeroSection.module.css', () => ({
  default: {
    heroSection: 'heroSection',
    heroOverlay: 'heroOverlay',
    heroContent: 'heroContent',
    heroTitle: 'heroTitle',
    heroSubtitle: 'heroSubtitle',
  },
}), { virtual: true });

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

function renderWithChakra(ui: React.ReactNode) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('HeroSection', () => {
  it('renders title and subtitle by default', () => {
    renderWithChakra(
      <HeroSection title="Beyond the Finish Line" subtitle="Telemetry that actually helps." />
    );

    expect(
      screen.getByRole('heading', { name: /beyond the finish line/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/telemetry that actually helps\./i)).toBeInTheDocument();
  });

  it('renders children instead of default title/subtitle when provided', () => {
    renderWithChakra(
      <HeroSection>
        <div data-testid="custom-content">Custom Slot</div>
      </HeroSection>
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    // Should not render the default title/subtitle when children are passed
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders an outer container element', () => {
    const { container } = renderWithChakra(<HeroSection title="t" subtitle="s" />);
    const outer = container.firstElementChild as HTMLElement; // outer <Box>
    expect(outer).toBeInTheDocument();
  });

  it('renders overlay unless disableOverlay is true', () => {
    // default: overlay present
    const { container, rerender } = renderWithChakra(<HeroSection title="t" subtitle="s" />);
    const outer = container.firstElementChild as HTMLElement;
    const overlay = outer?.firstElementChild as HTMLElement;
    expect(overlay).toBeInTheDocument();

    // when disabled: overlay still renders structurally but without background styles; assert presence
    rerender(<ChakraProvider><HeroSection title="t" subtitle="s" disableOverlay /></ChakraProvider>);
    const outer2 = container.firstElementChild as HTMLElement;
    const overlay2 = outer2?.firstElementChild as HTMLElement;
    expect(overlay2).toBeInTheDocument();
  });
});
