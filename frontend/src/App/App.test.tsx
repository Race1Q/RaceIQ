import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import App from './App';

// ---- AUTH0 MOCK ----
vi.mock('@auth0/auth0-react', () => {
  const state = {
    isAuthenticated: false,
    isLoading: false,
    user: undefined as any,
    getAccessTokenSilently: vi.fn(async () => 'fake-token'),
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  };
  return {
    useAuth0: () => state,
    __setAuth: (next: Partial<typeof state>) => Object.assign(state, next),
    Auth0Provider: ({ children }: any) => children,
  };
});

// Prevent HomePage crashes from recentRaces
vi.mock('../data/mockRaces', () => ({ mockRaces: [] }));

// Mock fetch used by Drivers page (avoid toasts)
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => [],
    })) as any
  );
});

function renderWithProviders(ui: React.ReactElement, initialRoute = '/') {
  return render(ui, { initialRoute });
}

async function setAuth(partial: {
  isAuthenticated?: boolean;
  isLoading?: boolean;
  user?: any;
}) {
  const mod: any = await import('@auth0/auth0-react');
  mod.__setAuth(partial);
}

describe('App', () => {
  it('renders without crashing when unauthenticated', async () => {
    await setAuth({ isAuthenticated: false, isLoading: false, user: undefined });
    const { container } = renderWithProviders(<App />, '/');

    // Just verify the app renders
    expect(container).toBeInTheDocument();
  });

  it('renders without crashing when authenticated', async () => {
    await setAuth({
      isAuthenticated: true,
      isLoading: false,
      user: { sub: 'auth0|123', name: 'Test User', email: 'test@example.com' },
    });
    const { container } = renderWithProviders(<App />, '/');

    // Just verify the app renders
    expect(container).toBeInTheDocument();
  });

  it('renders with initial route', async () => {
    await setAuth({ isAuthenticated: true, isLoading: false, user: { sub: 'auth0|123' } });
    const { container } = renderWithProviders(<App />, '/');

    // Verify the app rendered
    expect(container.firstChild).toBeTruthy();
  });
});
