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

  it('applies background image when no backgroundColor is provided', () => {
    const url =
      'https://upload.wikimedia.org/wikipedia/commons/8/88/Sebastian_Vettel_Red_Bull_Racing_2013_Silverstone_F1_Test_009.jpg';

    const { container } = renderWithChakra(<HeroSection title="t" subtitle="s" />);
    const outer = container.firstElementChild as HTMLElement; // outer <Box>

    expect(outer).toBeInTheDocument();
    expect(outer.style.backgroundImage).toContain(url);
    expect(outer.style.backgroundColor).toBe('');
  });

  it('uses backgroundColor and disables backgroundImage when backgroundColor is provided', () => {
    const { container } = renderWithChakra(
      <HeroSection title="t" subtitle="s" backgroundColor="rebeccapurple" />
    );
    const outer = container.firstElementChild as HTMLElement;

    expect(outer).toBeInTheDocument();
    expect(outer.style.backgroundColor).toBe('rebeccapurple');
    expect(outer.style.backgroundImage).toBe('none'); // component sets 'none'
  });

  it('disables overlay background when disableOverlay is true', () => {
    const { container } = renderWithChakra(
      <HeroSection title="t" subtitle="s" disableOverlay />
    );
    const outer = container.firstElementChild as HTMLElement;
    const overlay = outer?.firstElementChild as HTMLElement;

    expect(overlay).toBeInTheDocument();
    expect(overlay.style.background).toBe('none');
  });

  it('keeps overlay background when disableOverlay is false (default)', () => {
    const { container } = renderWithChakra(<HeroSection title="t" subtitle="s" />);
    const outer = container.firstElementChild as HTMLElement;
    const overlay = outer?.firstElementChild as HTMLElement;

    expect(overlay).toBeInTheDocument();
    // CSS module provides gradient via class; since it's mocked, inline style is empty string.
    // We only assert it's not explicitly "none".
    expect(overlay.style.background).not.toBe('none');
  });
});
