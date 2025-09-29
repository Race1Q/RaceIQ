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

  // @ts-expect-error
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

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

// Keep ColorModeScript real; no-op ChakraProvider
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

  // Remove any previous env stubs
  vi.unstubAllEnvs?.();
});

afterEach(() => {
  cleanupDomRoot();
  vi.unstubAllEnvs?.();
});

// ——— Utilities ———
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

describe('main.tsx bootstrap', () => {
  it('Branch A: uses import.meta.env when available and sets expected Auth0 props', async () => {
    // Force ENV branch
    vi.stubEnv('VITE_AUTH0_DOMAIN', 'env-domain');
    vi.stubEnv('VITE_AUTH0_CLIENT_ID', 'env-client-id');
    vi.stubEnv('VITE_AUTH0_AUDIENCE', 'env-audience');

    await import('./main');

    expect(renderedTree).toBeTruthy();
    const auth0El = findAuth0Provider(renderedTree);
    expect(auth0El).toBeTruthy();

    const { domain, clientId, authorizationParams, useRefreshTokens, cacheLocation } = auth0El!.props;

    expect(domain).toBe('env-domain');
    expect(clientId).toBe('env-client-id');
    expect(authorizationParams).toMatchObject({
      redirect_uri: window.location.origin,
      audience: 'env-audience',
      scope: expect.stringContaining('read:drivers'),
    });
    expect(useRefreshTokens).toBe(true);
    expect(cacheLocation).toBe('localstorage');
  } ,20000);

  it('Branch B: falls back to window.VITE_* when env is absent', async () => {
    vi.resetModules();
    vi.unstubAllEnvs?.();
  
    // Make env keys explicitly falsy so the env-branch is skipped
    vi.stubEnv('VITE_AUTH0_DOMAIN', '');
    vi.stubEnv('VITE_AUTH0_CLIENT_ID', '');
    vi.stubEnv('VITE_AUTH0_AUDIENCE', '');
  
    // Provide window fallbacks
    (window as any).VITE_AUTH0_DOMAIN = 'win-domain';
    (window as any).VITE_AUTH0_CLIENT_ID = 'win-client-id';
    (window as any).VITE_AUTH0_AUDIENCE = 'win-audience';
  
    await import('./main');
  
    expect(renderedTree).toBeTruthy();
    const auth0El = findAuth0Provider(renderedTree);
    expect(auth0El).toBeTruthy();
  
    const { domain, clientId, authorizationParams } = auth0El!.props;
    expect(domain).toBe('win-domain');
    expect(clientId).toBe('win-client-id');
    expect(authorizationParams).toMatchObject({
      redirect_uri: window.location.origin,
      audience: 'win-audience',
      scope: expect.stringContaining('read:drivers'),
    });
  } ,20000);
  
  it('Branch C: throws when neither env nor window config is provided', async () => {
    vi.resetModules();
    vi.unstubAllEnvs?.();
  
    // Explicitly falsy env keys
    vi.stubEnv('VITE_AUTH0_DOMAIN', '');
    vi.stubEnv('VITE_AUTH0_CLIENT_ID', '');
    vi.stubEnv('VITE_AUTH0_AUDIENCE', '');
  
    // Ensure no window fallbacks
    delete (window as any).VITE_AUTH0_DOMAIN;
    delete (window as any).VITE_AUTH0_CLIENT_ID;
    delete (window as any).VITE_AUTH0_AUDIENCE;
  
    await expect(import('./main')).rejects.toThrow(/Auth0 configuration is required/i);
    expect(renderedTree).toBeNull();
  } ,20000);
});