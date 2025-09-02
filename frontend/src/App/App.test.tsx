import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
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

function renderWithProviders(ui: React.ReactNode, initialRoute = '/') {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>
    </ChakraProvider>
  );
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
  it('shows navbar links and CTA when unauthenticated', async () => {
    await setAuth({ isAuthenticated: false, isLoading: false, user: undefined });
    renderWithProviders(<App />, '/');

    const navbar = await screen.findByRole('navigation');
    expect(navbar).toBeInTheDocument();

    const loginBtnOrLink =
      within(navbar).queryByRole('button', { name: /log\s*in/i }) ||
      within(navbar).queryByRole('link', { name: /log\s*in/i });
    expect(loginBtnOrLink).toBeTruthy();

    const ctaHeading = await screen.findByRole('heading', {
      name: /create your free account and get more from every race/i,
    });
    expect(ctaHeading).toBeInTheDocument();
  });

  it('shows "My Profile" button and logout when authenticated', async () => {
    await setAuth({
      isAuthenticated: true,
      isLoading: false,
      user: { sub: 'auth0|123', name: 'Test User', email: 'test@example.com' },
    });
    renderWithProviders(<App />, '/');

    const navbar = await screen.findByRole('navigation');
    expect(navbar).toBeInTheDocument();

    const logoutControl =
      (await within(navbar).findByRole('button', { name: /log\s*out/i })) ||
      (await within(navbar).findByRole('link', { name: /log\s*out/i }));
    expect(logoutControl).toBeInTheDocument();

    const myProfile =
      within(navbar).queryByRole('button', { name: /my\s*profile/i }) ||
      within(navbar).queryByRole('link', { name: /my\s*profile/i });
    expect(myProfile).toBeTruthy();
  });

  it('routes to Drivers page', async () => {
    await setAuth({ isAuthenticated: true, isLoading: false, user: { sub: 'auth0|123' } });
    renderWithProviders(<App />, '/');

    const navbar = await screen.findByRole('navigation');

    // Deterministically select the Drivers nav item
    const navLinks = within(navbar).queryAllByRole('link') as HTMLAnchorElement[];
    let driversLink = navLinks.find(a => (a.getAttribute('href') || '').endsWith('/drivers'))
      || navLinks.find(a => (a.getAttribute('href') || '').includes('/drivers'))
      || null;

    // Fallback: a button rendered as a nav control
    if (!driversLink) {
      const btn = within(navbar).queryByRole('button', { name: /^drivers$/i });
      if (btn) driversLink = btn as unknown as HTMLAnchorElement;
    }

    // Last resort: exact text inside navbar, then climb to anchor
    if (!driversLink) {
      const textCandidates = within(navbar).queryAllByText(/^drivers$/i);
      const anchor = textCandidates.map(n => n.closest('a') as HTMLAnchorElement | null).find(Boolean);
      if (anchor) driversLink = anchor;
    }

    expect(driversLink).toBeTruthy();
    (driversLink as HTMLElement).click();

    await waitFor(() => {
      expect(screen.queryByText(/please signup\s*\/\s*login/i)).not.toBeInTheDocument();
    });
  });
});
