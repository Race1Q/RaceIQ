import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DriverList from './DriverList';

// --- Mock CSS module with class names used in the component ---
vi.mock('./DriverList.module.css', () => ({
  default: {
    container: 'container',
    searchContainer: 'searchContainer',
    searchWrapper: 'searchWrapper',
    searchIcon: 'searchIcon',
    searchInput: 'searchInput',
    driverList: 'driverList',
    driverItem: 'driverItem',
    active: 'active',
    driverNumber: 'driverNumber',
    driverInfo: 'driverInfo',
    driverName: 'driverName',
    driverTeam: 'driverTeam',
  },
}), { virtual: true });

// --- Mock lucide icon to keep DOM minimal ---
vi.mock('lucide-react', () => ({
  Search: (props: any) => <svg data-testid="icon-search" {...props} />,
}));

// --- Mock teamColors source used by this component ---
vi.mock('../../lib/assets', () => ({
  teamColors: {
    Ferrari: '#E10600',
    'Red Bull Racing': '#1E5BC6',
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

const DRIVERS = [
  { id: 'max', name: 'Max Verstappen', number: '1', team: 'Red Bull Racing', nationality: 'NL' },
  { id: 'charles', name: 'Charles Leclerc', number: '16', team: 'Ferrari', nationality: 'MC' },
  { id: 'unknown', name: 'Mystery Driver', number: '99', team: 'Unknown Team', nationality: '??' },
];

describe('DriverList', () => {
  let selectedId = '';
  const setSelectedDriverId = vi.fn((id: string) => { selectedId = id; });

  beforeEach(() => {
    selectedId = '';
    setSelectedDriverId.mockClear();
  });

  it('renders all drivers with number and team', () => {
    renderWithProviders(
      <DriverList
        drivers={DRIVERS}
        selectedDriverId=""
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    // Names
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Mystery Driver')).toBeInTheDocument();

    // Numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();

    // Teams
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Unknown Team')).toBeInTheDocument();

    // Has a search input & icon
    expect(screen.getByPlaceholderText(/search drivers/i)).toBeInTheDocument();
    expect(screen.getByTestId('icon-search')).toBeInTheDocument();
  });

  it('filters drivers by search term (name or team)', () => {
    renderWithProviders(
      <DriverList
        drivers={DRIVERS}
        selectedDriverId=""
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    const input = screen.getByPlaceholderText(/search drivers/i);
    fireEvent.change(input, { target: { value: 'Ferrari' } });

    // Should show only Ferrari driver
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
    expect(screen.queryByText('Mystery Driver')).not.toBeInTheDocument();

    // Clear and search by name
    fireEvent.change(input, { target: { value: 'Mystery' } });
    expect(screen.getByText('Mystery Driver')).toBeInTheDocument();
    expect(screen.queryByText('Charles Leclerc')).not.toBeInTheDocument();
    expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
  });

  it('calls setSelectedDriverId when a driver row is clicked', () => {
    renderWithProviders(
      <DriverList
        drivers={DRIVERS}
        selectedDriverId=""
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    // Click on Charles row (click on text bubbles to parent Box onClick)
    fireEvent.click(screen.getByText('Charles Leclerc'));
    expect(setSelectedDriverId).toHaveBeenCalledWith('charles');
  });

  it('applies active class & team-colored left border for selected driver (known team)', () => {
    renderWithProviders(
      <DriverList
        drivers={DRIVERS}
        selectedDriverId="charles"
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    const nameEl = screen.getByText('Charles Leclerc');
    // Find the row container via CSS class (we mocked class names)
    const row = nameEl.closest('.driverItem') as HTMLElement;
    expect(row).toBeTruthy();

    // Should have 'active' class when selected
    expect(row!.className).toContain('active');

    // Inline style should set border-left-color to Ferrari red (#E10600)
    // JSDOM lower-cases CSS property names
    const style = (row as HTMLDivElement).style as CSSStyleDeclaration;
    expect(style.borderLeftColor).toBe('rgb(225, 6, 0)'); // #E10600 in rgb

    // Driver number color uses the team color too
    const numberEl = within(row!).getByText('16');
    const numberColor = getComputedStyle(numberEl).color;
    // getComputedStyle may not reflect inline style on the number (we set it inline),
    // but jsdom reports computed rgb; verify it's red-ish (E10600)
    expect(numberColor).toBe('rgb(225, 6, 0)');
  });

  it('uses default #FF1801 left border when team is unknown', () => {
    renderWithProviders(
      <DriverList
        drivers={DRIVERS}
        selectedDriverId="unknown"
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    const nameEl = screen.getByText('Mystery Driver');
    const row = nameEl.closest('.driverItem') as HTMLElement;
    expect(row).toBeTruthy();
    expect(row!.className).toContain('active');

    // Fallback color is #FF1801
    // In rgb that is rgb(255, 24, 1)
    expect((row as HTMLDivElement).style.borderLeftColor).toBe('rgb(255, 24, 1)');
  });
});
