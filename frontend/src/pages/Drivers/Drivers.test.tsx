import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Drivers from './Drivers';

// --- Mock environment variables ---
vi.mock('import.meta', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000',
    VITE_AUTH0_AUDIENCE: 'https://test-audience.com',
  },
}));

// --- CSS module must export default with the class names used in the component ---
vi.mock('./Drivers.module.css', () => ({
  default: {
    tabsContainer: 'tabsContainer',
    tab: 'tab',
    activeTab: 'activeTab',
    teamsContainer: 'teamsContainer',
    teamSection: 'teamSection',
    driverRow: 'driverRow',
    errorState: 'errorState',
    noDrivers: 'noDrivers',
  },
}), { virtual: true });

// --- Mock child components to keep tests fast & isolated ---
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="spinner">{text}</div>,
}));
vi.mock('../../components/DriverProfileCard/DriverProfileCard', () => ({
  default: ({ driver }: any) => (
    <article role="article" data-testid="driver-card">
      <span>{driver.name}</span>
      <span>{driver.team}</span>
      <span>{driver.number}</span>
    </article>
  ),
}));
vi.mock('../../components/TeamBanner/TeamBanner', () => ({
  default: ({ teamName }: any) => (
    <header data-testid="team-banner">
      <h2>{teamName}</h2>
    </header>
  ),
}));

// --- Mock lib maps (minimal; avoid depending on real files) ---
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '#1E5BC6',
    Ferrari: '#E10600',
    Default: '#999999',
  },
}));
vi.mock('../../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Max Verstappen': 'max.png',
    'Charles Leclerc': 'charles.png',
    'Carlos Sainz': 'carlos.png',
  },
}));
vi.mock('../../lib/teamAssets', () => ({
  teamLogoMap: {
    'Red Bull Racing': 'rbr.svg',
    Ferrari: 'ferrari.svg',
  },
}));

// --- Mock Auth0 so no real auth happens ---
const mockGetAccessTokenSilently = vi.fn().mockResolvedValue('fake-token');
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

// --- Mock Chakra useToast to capture errors without real toasts ---
const toastMock = vi.fn();
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useToast: () => toastMock,
  };
});

// --- Test helpers ---
function renderWithProviders(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

const mockDrivers = [
  // Team: Red Bull Racing (1 driver)
  { id: 1, full_name: 'Max Verstappen', driver_number: 1, country_code: 'NL', team_name: 'Red Bull Racing' },
  // Team: Ferrari (2 drivers)
  { id: 2, full_name: 'Charles Leclerc', driver_number: 16, country_code: 'MC', team_name: 'Ferrari' },
  { id: 3, full_name: 'Carlos Sainz', driver_number: 55, country_code: 'ES', team_name: 'Ferrari' },
];

// --- Global fetch mock (no real network) ---
const fetchMock = vi.fn();

beforeEach(() => {
  // @ts-ignore
  global.fetch = fetchMock;
  fetchMock.mockReset();
  toastMock.mockReset();
  mockGetAccessTokenSilently.mockReset();
  mockGetAccessTokenSilently.mockResolvedValue('fake-token');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Drivers page', () => {
  it('shows spinner while loading and then renders teams & driver cards after success', async () => {
    // Arrange: successful fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDrivers,
    } as any);

    renderWithProviders(<Drivers />);

    // Spinner visible initially
    expect(screen.getByTestId('spinner')).toHaveTextContent('Loading Drivers...');

    // Wait for fetch to be called and spinner to go away
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 3000 });
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument(), { timeout: 3000 });

    // Tabs should include "All" + deduped team names in arrival order
    const tabsRow = screen.getByRole('button', { name: 'All' }).closest('div')!;
    const tabs = within(tabsRow).getAllByRole('button');
    const tabLabels = tabs.map((t) => t.textContent);
    expect(tabLabels).toEqual(['All', 'Red Bull Racing', 'Ferrari']);

    // Team banners
    const banners = screen.getAllByTestId('team-banner');
    const bannerTitles = banners.map((b) => within(b).getByRole('heading').textContent);
    expect(bannerTitles).toEqual(['Red Bull Racing', 'Ferrari']);

    // Driver cards count = 3 (1 RBR + 2 Ferrari)
    const cards = screen.getAllByTestId('driver-card');
    expect(cards).toHaveLength(3);

    // Spot-check a driver
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    // Check for Ferrari team banner specifically - use getAllByRole to see how many headings exist
    const ferrariHeadings = screen.getAllByRole('heading', { name: 'Ferrari' });
    expect(ferrariHeadings).toHaveLength(1);
  });

  it('filters by team when clicking a tab (CSS classes present)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDrivers,
    } as any);

    renderWithProviders(<Drivers />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 3000 });
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument(), { timeout: 3000 });

    // Initially "All" should show both teams (3 cards)
    expect(screen.getAllByTestId('driver-card')).toHaveLength(3);

    // Click the "Ferrari" tab
    const ferrariTab = screen.getByRole('button', { name: 'Ferrari' });
    fireEvent.click(ferrariTab);

    // After filtering: only Ferrari drivers (2 cards), and active tab class present
    await waitFor(() => {
      const cards = screen.getAllByTestId('driver-card');
      expect(cards).toHaveLength(2);
    }, { timeout: 3000 });

    // Ensure the activeTab CSS class is applied to the selected tab
    expect(ferrariTab.className).toContain('activeTab');

    // And the banner shown is only Ferrari
    const banners = screen.getAllByTestId('team-banner');
    const names = banners.map((b) => within(b).getByRole('heading').textContent);
    expect(names).toEqual(['Ferrari']);
  });

  it('shows error state and triggers toast when fetch fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      text: async () => 'Boom',
    } as any);

    renderWithProviders(<Drivers />);

    // Spinner visible initially
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Wait for fetch + error UI
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 3000 });

    // Error text rendered
    const errorDiv = await screen.findByText(/Failed to fetch data: 500 Server Error - Boom/i, {}, { timeout: 3000 });
    expect(errorDiv).toBeInTheDocument();
    // Has errorState class from CSS module
    expect(errorDiv.className).toContain('errorState');

    // Spinner gone
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();

    // Toast called with expected title/description/status
    expect(toastMock).toHaveBeenCalled();
    const [toastArgs] = toastMock.mock.calls[0];
    expect(toastArgs.title).toMatch(/Error fetching drivers/i);
    expect(toastArgs.description).toMatch(/Failed to fetch data: 500 Server Error - Boom/i);
    expect(toastArgs.status).toBe('error');
  });

  it('renders "No drivers found." when API returns empty list', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as any);

    renderWithProviders(<Drivers />);

    // Wait for the request to complete and the spinner to stop
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument(), { timeout: 3000 });

    // Now, with the loading state gone, we can expect the empty message
    const emptyMsg = await screen.findByText(/No drivers found./i);
    expect(emptyMsg).toBeInTheDocument();

    // Sanity: no driver cards in empty state
    expect(screen.queryByTestId('driver-card')).not.toBeInTheDocument();
  });
});
 