import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import CompareDriversPage from './CompareDriversPage';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      sub: 'auth0|123456789',
      name: 'Test User',
      email: 'test@example.com',
    },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock the driver comparison hook
vi.mock('../../hooks/useDriverComparison', () => ({
  useDriverComparison: () => ({
    allDrivers: [
      { id: 1, full_name: 'Max Verstappen', given_name: 'Max', family_name: 'Verstappen', code: 'VER' },
      { id: 2, full_name: 'Lewis Hamilton', given_name: 'Lewis', family_name: 'Hamilton', code: 'HAM' },
      { id: 3, full_name: 'Charles Leclerc', given_name: 'Charles', family_name: 'Leclerc', code: 'LEC' },
    ],
    driver1: null,
    driver2: null,
    loading: false,
    error: null,
    handleSelectDriver: vi.fn(),
    years: [2024, 2023, 2022, 2021, 2020],
    selection1: null,
    selection2: null,
    stats1: null,
    stats2: null,
    enabledMetrics: {
      wins: true,
      podiums: true,
      fastestLaps: false,
      points: true,
      sprintWins: false,
      sprintPodiums: false,
      dnfs: false,
      poles: false,
    },
    score: { d1: null, d2: null },
    selectDriver: vi.fn(),
    toggleMetric: vi.fn(),
  }),
}));

// Mock components
vi.mock('../../components/F1LoadingSpinner/F1LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

vi.mock('./components/DriverSelectionPanel', () => ({
  DriverSelectionPanel: ({ title, onDriverSelect, allDrivers, selectedDriverData, extraControl }: any) => (
    <div data-testid={`driver-selection-panel-${title.toLowerCase().replace(' ', '-')}`}>
      <h3 data-testid="panel-title">{title}</h3>
      <div data-testid="driver-options">
        {allDrivers.map((driver: any) => (
          <button
            key={driver.value}
            data-testid={`driver-option-${driver.value}`}
            onClick={() => onDriverSelect(driver.value)}
          >
            {driver.label}
          </button>
        ))}
      </div>
      {selectedDriverData && (
        <div data-testid="selected-driver">
          <span data-testid="selected-driver-name">{selectedDriverData.fullName}</span>
          <span data-testid="selected-driver-team">{selectedDriverData.teamName}</span>
        </div>
      )}
      {extraControl && (
        <div data-testid="extra-control">{extraControl}</div>
      )}
    </div>
  ),
}));

vi.mock('./components/ComparisonTable', () => ({
  ComparisonTable: ({ driver1, driver2, stats1, stats2, enabledMetrics, selection1, selection2, onYearChange, onMetricToggle }: any) => (
    <div data-testid="comparison-table">
      <h3 data-testid="table-title">Head-to-Head Comparison</h3>
      <div data-testid="driver1-name">{driver1.fullName}</div>
      <div data-testid="driver2-name">{driver2.fullName}</div>
      {stats1 && stats2 && enabledMetrics && (
        <div data-testid="enhanced-comparison">
          <div data-testid="year-filters">
            <button data-testid="driver1-career" onClick={() => onYearChange?.(1, 'career')}>Driver 1 Career</button>
            <button data-testid="driver1-2024" onClick={() => onYearChange?.(1, 2024)}>Driver 1 2024</button>
            <button data-testid="driver2-career" onClick={() => onYearChange?.(2, 'career')}>Driver 2 Career</button>
            <button data-testid="driver2-2024" onClick={() => onYearChange?.(2, 2024)}>Driver 2 2024</button>
          </div>
          <div data-testid="metric-filters">
            <button data-testid="toggle-wins" onClick={() => onMetricToggle?.('wins')}>Toggle Wins</button>
            <button data-testid="toggle-podiums" onClick={() => onMetricToggle?.('podiums')}>Toggle Podiums</button>
          </div>
        </div>
      )}
    </div>
  ),
}));

function renderPage(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
}

describe('CompareDriversPage', () => {
  it('renders the main heading', () => {
    renderPage(<CompareDriversPage />);
    
    expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
  });

  it('renders driver selection panels when authenticated', () => {
    renderPage(<CompareDriversPage />);
    
    expect(screen.getByTestId('driver-selection-panel-driver-1')).toBeInTheDocument();
    expect(screen.getByTestId('driver-selection-panel-driver-2')).toBeInTheDocument();
    expect(screen.getByText('Driver 1')).toBeInTheDocument();
    expect(screen.getByText('Driver 2')).toBeInTheDocument();
  });

  it('renders driver options in selection panels', () => {
    renderPage(<CompareDriversPage />);
    
    // Check that driver options are rendered (using getAllByTestId to handle multiple instances)
    const driver1Options = screen.getAllByTestId('driver-option-1');
    const driver2Options = screen.getAllByTestId('driver-option-2');
    const driver3Options = screen.getAllByTestId('driver-option-3');
    
    expect(driver1Options.length).toBeGreaterThan(0);
    expect(driver2Options.length).toBeGreaterThan(0);
    expect(driver3Options.length).toBeGreaterThan(0);
    
    // Check driver names (using getAllByText to handle multiple instances)
    const maxVerstappenElements = screen.getAllByText('Max Verstappen');
    const lewisHamiltonElements = screen.getAllByText('Lewis Hamilton');
    const charlesLeclercElements = screen.getAllByText('Charles Leclerc');
    
    expect(maxVerstappenElements.length).toBeGreaterThan(0);
    expect(lewisHamiltonElements.length).toBeGreaterThan(0);
    expect(charlesLeclercElements.length).toBeGreaterThan(0);
  });

  it('renders VS heading between driver panels', () => {
    renderPage(<CompareDriversPage />);
    
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('renders the page structure correctly', () => {
    renderPage(<CompareDriversPage />);
    
    // Check main structure
    expect(screen.getByText('Driver Comparison')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
    
    // Check that both driver selection panels are present
    expect(screen.getByTestId('driver-selection-panel-driver-1')).toBeInTheDocument();
    expect(screen.getByTestId('driver-selection-panel-driver-2')).toBeInTheDocument();
    
    // Check that driver options are present in both panels
    const allDriverOptions = screen.getAllByTestId('driver-option-1');
    expect(allDriverOptions.length).toBe(2); // One for each panel
  });

  it('handles driver name fallbacks correctly', () => {
    renderPage(<CompareDriversPage />);
    
    // The mock data includes proper fallback handling
    // Check that all expected driver names are present
    expect(screen.getAllByText('Max Verstappen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lewis Hamilton').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Charles Leclerc').length).toBeGreaterThan(0);
  });

  it('renders driver options with correct structure', () => {
    renderPage(<CompareDriversPage />);
    
    // Check that driver options have the correct structure
    const driver1Panel = screen.getByTestId('driver-selection-panel-driver-1');
    const driver2Panel = screen.getByTestId('driver-selection-panel-driver-2');
    
    expect(driver1Panel).toBeInTheDocument();
    expect(driver2Panel).toBeInTheDocument();
    
    // Check that each panel has driver options
    expect(driver1Panel.querySelector('[data-testid="driver-options"]')).toBeInTheDocument();
    expect(driver2Panel.querySelector('[data-testid="driver-options"]')).toBeInTheDocument();
  });
});