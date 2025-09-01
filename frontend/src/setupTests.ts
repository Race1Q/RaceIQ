// src/setupTests.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up the DOM after each test
afterEach(() => {
  cleanup();
});

// --- Polyfills for JSDOM (needed by Chakra UI color mode) ---
if (!window.matchMedia) {
  // @ts-expect-error matchMedia not in JSDOM typings
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),        // deprecated, some libs still call these
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
