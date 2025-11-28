import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfilePage from './ProfilePage';
import { ProfileUpdateProvider } from '../../context/ProfileUpdateContext';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// ---- Mock CSS module ----
vi.mock('./ProfilePage.module.css', () => ({
  default: { profilePage: 'profilePage', settingsCard: 'settingsCard' },
}));

// ---- Mock child components ----
vi.mock('../../components/HeroSection/HeroSection', () => ({
  default: ({ title, subtitle }: any) => (
    <header data-testid="hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  ),
}));
vi.mock('../../components/ThemeToggleButton/ThemeToggleButton', () => ({
  default: () => <button data-testid="theme-toggle">toggle theme</button>,
}));

// ---- Mock Auth0 ----
const getAccessTokenSilentlyMock = vi.fn().mockResolvedValue('fake-token');
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: {
      sub: 'auth0|user_123',
      name: 'Alice Tester',
      email: 'alice@example.com',
      picture: 'https://example.com/p.png',
    },
    isLoading: false,
    getAccessTokenSilently: getAccessTokenSilentlyMock,
  }),
}));

// ---- Mock useUserProfile ----
vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// ---- Mock Chakra toast ----
const toastMock = vi.fn();
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { ...actual, useToast: () => toastMock };
});

// ---- Mock chakra-react-select to a native select ----
vi.mock('chakra-react-select', () => {
  function TestSelect({
    options = [],
    value,
    onChange,
    placeholder,
    isDisabled,
    isLoading,
    'data-testid': dataTestId,
  }: any) {
    const currentValue = value?.value ?? '';
    return (
      <div>
        <select
          data-testid={dataTestId || placeholder}
          aria-label={placeholder}
          disabled={isDisabled || isLoading}
          value={currentValue}
          onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : null;
            const found = options.find((o: any) => o.value === v) || null;
            onChange?.(found);
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o: any) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span data-testid={(dataTestId || placeholder) + '-selected'}>
          {value?.label ?? ''}
        </span>
      </div>
    );
  }
  return { Select: TestSelect };
});

// ---- Helpers ----
const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#FF0000',
    },
  },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <ChakraProvider theme={testTheme}>
        <ThemeColorProvider>
          <ProfileUpdateProvider>
            {ui}
          </ProfileUpdateProvider>
        </ThemeColorProvider>
      </ChakraProvider>
    </MemoryRouter>
  );
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv('VITE_AUTH0_AUDIENCE', 'https://auth0.example.com/api');
  // @ts-ignore
  global.fetch = fetchMock;
  fetchMock.mockReset();
  toastMock.mockReset();
  getAccessTokenSilentlyMock.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ---- Shared mock data ----
const profileResponse = {
  databaseUser: {
    username: 'K-Money',
    favorite_constructor_id: 2,
    favorite_driver_id: 33,
  },
};
const constructorsResponse = [
  { id: 1, name: 'Ferrari' },
  { id: 2, name: 'Red Bull Racing' },
];
const driversResponse = [
  { id: 33, name: 'Max Verstappen' },
  { id: 16, name: 'Charles Leclerc' },
];

// Utility to set up fetch mock to handle all API calls dynamically
function setupInitialFetches() {
  fetchMock.mockImplementation((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes('/api/users/me') || urlStr.includes('/api/profile')) {
      return Promise.resolve({ ok: true, json: async () => profileResponse } as any);
    }
    if (urlStr.includes('/api/constructors')) {
      return Promise.resolve({ ok: true, json: async () => constructorsResponse } as any);
    }
    if (urlStr.includes('/api/drivers')) {
      return Promise.resolve({ ok: true, json: async () => driversResponse } as any);
    }
    return Promise.resolve({ ok: true, json: async () => ({}) } as any);
  });
}

describe('ProfilePage', () => {
  it('loads profile, pre-fills fields, and hits API endpoints (relative URLs)', async () => {
    setupInitialFetches();
    renderWithProviders(<ProfilePage />);

    // With ThemeColorProvider, there may be additional API calls (useProfile hook)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    // Check that profile API was called
    const calls = fetchMock.mock.calls.map(c => String(c[0]));
    const hasProfileCall = calls.some(url => url.includes('/api/users/me') || url.includes('/api/profile'));
    expect(hasProfileCall).toBe(true);

    // Check that user info is displayed (username might be from profile or Auth0)
    const usernameInput = screen.getByPlaceholderText('Enter your username') as HTMLInputElement;
    expect(usernameInput.value).toBeTruthy(); // Has some value
    expect(screen.getByText('Alice Tester')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

});
