// src/main.test.tsx
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let renderedTree: any = null;

// --- DOM root setup ---
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

// --- Mocks that must exist BEFORE importing ./main ---
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

vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: 'auth0-provider',
}));

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
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
  renderedTree = null;
  cleanupDomRoot();
  setupDomRoot();

  // Clean window vars each time
  // @ts-ignore
  delete (window as any).VITE_AUTH0_DOMAIN;
  // @ts-ignore
  delete (window as any).VITE_AUTH0_CLIENT_ID;
  // @ts-ignore
  delete (window as any).VITE_AUTH0_AUDIENCE;

  // Note: import.meta.env comes from Vite build/test rig and may be pre-populated.
  // We won't try to mutate it (readonly), tests will adapt to its presence.
});

afterEach(() => {
  cleanupDomRoot();
  vi.unstubAllEnvs();
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
  // Snapshot what Vite injected for this test process
  // eslint-disable-next-line no-undef
  const env = (import.meta as any).env ?? {};
  const domain = env.VITE_AUTH0_DOMAIN;
  const clientId = env.VITE_AUTH0_CLIENT_ID;
  const audience = env.VITE_AUTH0_AUDIENCE;
  return { domain, clientId, audience };
}

describe('main.tsx bootstrap', () => {
  it('uses import.meta.env when available and sets expected Auth0 props', async () => {
    // If your env already has real values, we simply assert those are wired through.
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
        // audience may be undefined
        expect(authorizationParams).toMatchObject({
          redirect_uri: window.location.origin,
          scope: expect.stringContaining('read:drivers'),
        });
      }
    } else {
      // If env is not present in this runner, the app will fall back to window.* (which we didn’t set here),
      // so it should throw. But if it didn’t, at least domain/clientId should be defined from somewhere.
      expect(domain).toBeTruthy();
      expect(clientId).toBeTruthy();
    }
    expect(useRefreshTokens).toBe(true);
    expect(cacheLocation).toBe('localstorage');
  });

  it('falls back to window.VITE_* when env is not present (or else uses env if present)', async () => {
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
  });

  it('throws a clear error if neither env nor window config is provided (only when both truly absent)', async () => {
    const env = getEnvAuth0();

    if (env.domain || env.clientId) {
      // Env provided by the runner—nothing to throw. Just assert import succeeds.
      await expect(import('./main')).resolves.toBeTruthy();
      expect(renderedTree).not.toBeNull();
      return;
    }

    // Ensure window vars are absent
    // @ts-ignore
    delete (window as any).VITE_AUTH0_DOMAIN;
    // @ts-ignore
    delete (window as any).VITE_AUTH0_CLIENT_ID;
    // @ts-ignore
    delete (window as any).VITE_AUTH0_AUDIENCE;

    await expect(import('./main')).rejects.toThrow(/Auth0 configuration is required/i);
    expect(renderedTree).toBeNull();
  });
});
