import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfilePage from './ProfilePage';

// ---- Mock CSS module ----
vi.mock('./ProfilePage.module.css', () => ({
  default: {
    profilePage: 'profilePage',
    settingsCard: 'settingsCard',
  },
}), { virtual: true });

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

// ---- Mock Chakra toast ----
const toastMock = vi.fn();
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useToast: () => toastMock,
  };
});

// ---- Mock chakra-react-select -> native <select> ----
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
function renderWithProviders(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
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

// Utility to set up the three initial GET requests
function setupInitialFetches() {
  fetchMock
    // GET /api/users/me
    .mockResolvedValueOnce({
      ok: true,
      json: async () => profileResponse,
    } as any)
    // GET /api/constructors
    .mockResolvedValueOnce({
      ok: true,
      json: async () => constructorsResponse,
    } as any)
    // GET /api/drivers
    .mockResolvedValueOnce({
      ok: true,
      json: async () => driversResponse,
    } as any);
}

describe('ProfilePage', () => {
  it('loads profile, pre-fills fields, and composes full API URLs', async () => {
    setupInitialFetches();

    renderWithProviders(<ProfilePage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.example.com/api/users/me',
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.example.com/api/constructors',
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://api.example.com/api/drivers',
      expect.any(Object)
    );

    const usernameInput = screen.getByPlaceholderText('Enter your username') as HTMLInputElement;
    expect(usernameInput.value).toBe('K-Money');

    expect(screen.getByTestId('Search and select your favorite team-selected').textContent)
      .toBe('Red Bull Racing');
    expect(screen.getByTestId('Search and select your favorite driver-selected').textContent)
      .toBe('Max Verstappen');

    expect(screen.getByText('Alice Tester')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('shows a warning toast when clicking "Delete Account"', async () => {
    setupInitialFetches();
    renderWithProviders(<ProfilePage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'warning',
          title: expect.stringMatching(/account deletion/i),
        })
      )
    );
  });

  it('toggles email notifications switch', async () => {
    setupInitialFetches();
    renderWithProviders(<ProfilePage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const switchEl = screen.getByRole('checkbox', {
      name: /receive occasional email updates and newsletters/i,
    }) as HTMLInputElement;

    expect(switchEl.checked).toBe(false);
    fireEvent.click(switchEl);
    expect(switchEl.checked).toBe(true);
  });
});
