import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

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
// @ts-expect-error
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// default stub for fetch in UI tests (override per test if needed)
if (!(global as any).fetch) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })));
}
