import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import DriversList from './DriverList';

// CSS module safety
vi.mock('./DriversList.module.css', () => ({
  default: new Proxy({}, { get: (_t, k) => String(k) }),
}));

// Mock the teamColors dependency
vi.mock('../../lib/teamColors', () => ({
  teamColors: {
    'Red Bull': '#E10600',
    'Ferrari': '#DC0000',
    'Unknown': '#666666',
  },
}));

function renderWithProviders(ui: React.ReactNode, initialEntries: string[] = ['/']) {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </ChakraProvider>
  );
}

const sampleDrivers = [
  { id: 1, full_name: 'Max Verstappen', driver_number: 1, team_name: 'Red Bull' },
  { id: 2, full_name: 'Charles Leclerc', driver_number: 16, team_name: 'Ferrari' },
  { id: 3, full_name: 'Mystery Driver', driver_number: 99, team_name: 'Unknown' },
];

describe('DriverList', () => {
  let setSelectedDriverId: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setSelectedDriverId = vi.fn();
  });

  it('renders all drivers with number, name, and team', () => {
    renderWithProviders(
      <DriversList
        drivers={sampleDrivers}
        selectedDriverId={null}
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    expect(screen.getByText(/select a driver/i)).toBeInTheDocument();

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();
    expect(screen.getByText('Mystery Driver')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('calls setSelectedDriverId when a driver row is clicked', () => {
    renderWithProviders(
      <DriversList
        drivers={sampleDrivers}
        selectedDriverId={null}
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    fireEvent.click(screen.getByText('Charles Leclerc'));
    expect(setSelectedDriverId).toHaveBeenCalledWith(2);
  });

  it('applies active class & team-colored left border for selected driver (known team)', () => {
    renderWithProviders(
      <DriversList
        drivers={sampleDrivers}
        selectedDriverId={2}
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    const nameEl = screen.getByText('Charles Leclerc');
    const row = nameEl.closest('li') as HTMLElement;
    expect(row).toBeTruthy();

    expect(row.className).toMatch(/selected/i);

    const style = row.getAttribute('style') || '';
    expect(style).toMatch(/--team-color-border/i);
  });

  it('uses default #666666 left border when team is unknown', () => {
    renderWithProviders(
      <DriversList
        drivers={sampleDrivers}
        selectedDriverId={3}
        setSelectedDriverId={setSelectedDriverId}
      />
    );

    const nameEl = screen.getByText('Mystery Driver');
    const row = nameEl.closest('li') as HTMLElement;
    expect(row).toBeTruthy();

    const style = (row.getAttribute('style') || '').toLowerCase();
    expect(style).toContain('#666666');
  });
});
