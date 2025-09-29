import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { extendTheme } from '@chakra-ui/react';

expect.extend(matchers);
afterEach(() => cleanup());

// matchMedia polyfill for Chakra
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},            // legacy
      removeListener: () => {},         // legacy
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// optional: ResizeObserver noop
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// default stub for fetch in UI tests (override per test if needed)
if (!(global as any).fetch) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })));
}

// Global theme for all tests to prevent theme.colors.brand.red errors
const globalTestTheme = extendTheme({
  colors: {
    brand: {
      red: '#FF0000',
    },
  },
});

// Make the theme available globally for tests
(global as any).__CHAKRA_TEST_THEME__ = globalTestTheme;

// IntersectionObserver polyfill for react-intersection-observer
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}
