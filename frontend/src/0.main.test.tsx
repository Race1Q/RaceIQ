// src/main.test.tsx
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ——— Captured render tree ———
let renderedTree: any = null;

// ——— DOM root setup ———
const ROOT_ID = 'root';
function setupDomRoot() {
  const el = document.createElement('div');
  el.id = ROOT_ID;
  document.body.appendChild(el);
  return el;
}
function cleanupDomRoot() {
  const el = document.getElementById(ROOT_ID);
  if (el) el.remove();
}

// ——— Polyfills/stubs helpful during bootstrap ———
function installGlobals() {
  // Responsive queries → desktop
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

  // Chakra/layout libs sometimes use ResizeObserver
  // @ts-expect-error
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Prevent accidental network during bootstrap
  if (!(global as any).fetch || (global as any).fetch === undefined) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
  }
}

// ——— Mocks that must exist BEFORE importing ./main ———
const renderSpy = vi.fn((node: any) => {
  renderedTree = node;
});

vi.mock('react-dom/client', () => {
  return {
    createRoot: vi.fn(() => ({ render: renderSpy })),
  };
});

vi.mock('./App/App.tsx', () => ({
  default: () => <div data-testid="app">App</div>,
}));

vi.mock('./theme', () => ({
  default: { config: { initialColorMode: 'light' } },
}));

// Represent providers/elements as host strings so we can find them by type
vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: 'auth0-provider',
}));

// ✅ Use vi.importActual (Vitest-safe) to keep ColorModeScript while noop-ing ChakraProvider
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<any>('@chakra-ui/react');
  return {
    ...actual,
    ChakraProvider: 'chakra-provider',
    ColorModeScript: actual.ColorModeScript,
  };
});

vi.mock('react-router-dom', () => ({
  BrowserRouter: 'browser-router',
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  renderedTree = null;

  cleanupDomRoot();
  setupDomRoot();
  installGlobals();

  // Clean window vars each time
  delete (window as any).VITE_AUTH0_DOMAIN;
  delete (window as any).VITE_AUTH0_CLIENT_ID;
  delete (window as any).VITE_AUTH0_AUDIENCE;

  // Note: import.meta.env is provided by Vite. We won't mutate it here; tests adapt to presence/absence.
});

afterEach(() => {
  cleanupDomRoot();
  vi.unstubAllEnvs?.();
});

function findAuth0Provider(el: any): any | null {
  if (!el) return null;
  const children = Array.isArray(el?.props?.children)
    ? el.props.children
    : el?.props?.children
      ? [el.props.children]
      : [];
  for (const child of children) {
    if (!child) continue;
    if (child.type === 'auth0-provider') return child;
    const nested = findAuth0Provider(child);
    if (nested) return nested;
  }
  return null;
}

function getEnvAuth0() {
  // eslint-disable-next-line no-undef
  const env = (import.meta as any).env ?? {};
  const domain = env.VITE_AUTH0_DOMAIN;
  const clientId = env.VITE_AUTH0_CLIENT_ID;
  const audience = env.VITE_AUTH0_AUDIENCE;
  return { domain, clientId, audience };
}

describe('main.tsx bootstrap', () => {
  it(
    'uses import.meta.env when available and sets expected Auth0 props',
    async () => {
      // Import AFTER mocks are in place
      await import('./main');

      expect(renderedTree).toBeTruthy();
      const auth0El = findAuth0Provider(renderedTree);
      expect(auth0El).toBeTruthy();

      const { domain, clientId, authorizationParams, useRefreshTokens, cacheLocation } = auth0El!.props;

      const env = getEnvAuth0();
      if (env.domain && env.clientId) {
        expect(domain).toBe(env.domain);
        expect(clientId).toBe(env.clientId);
        if (env.audience) {
          expect(authorizationParams).toMatchObject({
            redirect_uri: window.location.origin,
            audience: env.audience,
            scope: expect.stringContaining('read:drivers'),
          });
        } else {
          expect(authorizationParams).toMatchObject({
            redirect_uri: window.location.origin,
            scope: expect.stringContaining('read:drivers'),
          });
        }
      } else {
        // If env is absent, app might fall back to window.* (not set here).
        // At minimum, domain/clientId should exist from some config.
        expect(domain).toBeTruthy();
        expect(clientId).toBeTruthy();
      }
      expect(useRefreshTokens).toBe(true);
      expect(cacheLocation).toBe('localstorage');
    },
    15000
  );

  it(
    'falls back to window.VITE_* when env is not present (or else uses env if present)',
    async () => {
      const env = getEnvAuth0();

      if (!env.domain || !env.clientId) {
        // Simulate window fallback only when env is absent
        (window as any).VITE_AUTH0_DOMAIN = 'win-domain';
        (window as any).VITE_AUTH0_CLIENT_ID = 'win-client-id';
        (window as any).VITE_AUTH0_AUDIENCE = 'win-audience';
      }

      await import('./main');

      expect(renderedTree).toBeTruthy();
      const auth0El = findAuth0Provider(renderedTree);
      expect(auth0El).toBeTruthy();

      const { domain, clientId, authorizationParams } = auth0El!.props;

      if (!env.domain || !env.clientId) {
        // Expect window fallback values
        expect(domain).toBe('win-domain');
        expect(clientId).toBe('win-client-id');
        expect(authorizationParams).toMatchObject({
          redirect_uri: window.location.origin,
          audience: 'win-audience',
          scope: expect.stringContaining('read:drivers'),
        });
      } else {
        // Env already present—assert we still used env (consistent behavior)
        expect(domain).toBe(env.domain);
        expect(clientId).toBe(env.clientId);
        if (env.audience) {
          expect(authorizationParams).toMatchObject({
            redirect_uri: window.location.origin,
            audience: env.audience,
            scope: expect.stringContaining('read:drivers'),
          });
        }
      }
    },
    15000
  );

  it(
    'throws a clear error if neither env nor window config is provided (only when both truly absent)',
    async () => {
      const env = getEnvAuth0();

      if (env.domain || env.clientId) {
        // Env provided by the runner—nothing to throw. Just assert import succeeds.
        await expect(import('./main')).resolves.toBeTruthy();
        expect(renderedTree).not.toBeNull();
        return;
      }

      // Ensure window vars are absent
      delete (window as any).VITE_AUTH0_DOMAIN;
      delete (window as any).VITE_AUTH0_CLIENT_ID;
      delete (window as any).VITE_AUTH0_AUDIENCE;

      await expect(import('./main')).rejects.toThrow(/Auth0 configuration is required/i);
      expect(renderedTree).toBeNull();
    },
    15000
  );
});
