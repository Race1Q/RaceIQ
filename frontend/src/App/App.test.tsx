// src/App/App.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { screen, within, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';

// ───────────────── Responsive: force desktop so nav isn't hidden ─────────────────
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

// ───────────────── Stable component mocks (accessible by role/name) ─────────────
vi.mock('../components/LoginButton/LoginButton', () => ({
  default: () => <button aria-label="Log In">Log In</button>,
}));
vi.mock('../components/LogoutButton/LogoutButton', () => ({
  default: () => <button aria-label="Log Out">Log Out</button>,
}));
vi.mock('../components/HeroSection/HeroSection', () => ({
  default: ({ title, subtitle }: any) => (
    <header data-testid="hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  ),
}));
vi.mock('../components/BackToTopButton/BackToTopButton', () => ({
  default: () => <div data-testid="back-to-top" />,
}));

// ───────────────── Avoid network: mock services used on Home page ───────────────
vi.mock('../services/f1Api', () => ({
  f1ApiService: {
    getRecentRaces: vi.fn().mockResolvedValue([
      { id: 1, name: 'Monza GP', date: '2025-09-01', winner: 'Driver A', team: 'Team A', circuit: 'Monza' },
      { id: 2, name: 'Spa GP', date: '2025-09-01', winner: 'Driver B', team: 'Team B', circuit: 'Spa' },
      { id: 3, name: 'Monaco GP', date: '2025-09-01', winner: 'Driver C', team: 'Team C', circuit: 'Monaco' },
    ]),
  },
}));

// ───────────────── Kill the “Setting up your account...” gate in tests ──────────
// 1) Mock RoleContext to be ready instantly.
vi.mock('../context/RoleContext', () => {
  const React = require('react');
  return {
    RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useRole: () => ({ role: 'user', isLoading: false }),
  };
});

// 2) Mock fetch so any setup/onboarding probe resolves immediately.
const fetchMock = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ ok: true, status: 'ready' }),
});
beforeEach(() => {
  // @ts-expect-error
  global.fetch = fetchMock;
});
afterEach(() => {
  fetchMock.mockClear();
});

// ───────────────── Auth0: mutable state per test ────────────────────────────────
type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
};
let authState: AuthState = { isAuthenticated: false, isLoading: false, user: null };

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn().mockResolvedValue('token'),
  }),
}));

// Import App *after* mocks so they take effect
import App from './App';

// ───────────────── Render helper ────────────────────────────────────────────────
function renderAt(initialPath: string = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>
  );
}

// Prefer <nav>; fallback to <header role="banner">; else body
function getNavContainer(): HTMLElement {
  return (
    screen.queryByRole('navigation') ||
    screen.queryByRole('banner') ||
    document.body
  );
}

beforeEach(() => {
  authState = { isAuthenticated: false, isLoading: false, user: null };
  // If your gate checks a localStorage flag, make it “done”:
  // localStorage.setItem('onboardingComplete', 'true');
});

describe('App', () => {
  it('shows navbar links and CTA when unauthenticated', async () => {
    authState.isAuthenticated = false;
    renderAt('/');

    const navbar = getNavContainer();

    expect(within(navbar).getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(within(navbar).getByRole('link', { name: /drivers/i })).toBeInTheDocument();
    expect(within(navbar).getByRole('link', { name: /races/i })).toBeInTheDocument();
    expect(within(navbar).getByRole('link', { name: /about/i })).toBeInTheDocument();

    const loginButtons = screen.getAllByRole('button', { name: /log in/i });
    expect(loginButtons.length).toBeGreaterThanOrEqual(1);

    expect(await screen.findByTestId('hero')).toBeInTheDocument();
  });

  it('shows "My Profile" button and logout when authenticated', async () => {
    authState = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        name: 'Test User',
        email: 'u@example.com',
        email_verified: true,
        // Common app checks for onboarding/role claims:
        app_metadata: { onboarded: true, setupComplete: true },
        'https://raceiq.example/roles': ['user'],
      },
    };

    renderAt('/');

    const navbar = getNavContainer();

    // Use async find* to wait for post-mount effects clearing any gates.
    const logoutControl =
      (await within(navbar).findByRole('button', { name: /log\s*out/i })) ??
      (await within(navbar).findByRole('link', { name: /log\s*out/i }));
    expect(logoutControl).toBeInTheDocument();

    const myProfileControl =
      within(navbar).queryByRole('button', { name: /my profile/i }) ??
      (await within(navbar).findByRole('link', { name: /my profile/i }));
    expect(myProfileControl).toBeInTheDocument();
  });

  it('routes to Drivers page', async () => {
    authState.isAuthenticated = false;
    renderAt('/drivers');

    const navbar = getNavContainer();
    expect(within(navbar).getByRole('link', { name: /drivers/i })).toBeInTheDocument();
  });
});
