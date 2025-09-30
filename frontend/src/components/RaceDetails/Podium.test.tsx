import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Podium from './Podium';

// Minimal theme (project likely has custom tokens like text-muted; provide safe fallbacks)
const testTheme = extendTheme({
  colors: {
    text: {
      muted: '#666666',
    },
  },
});

// Helper to wrap component with ChakraProvider
function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider theme={testTheme}>{ui}</ChakraProvider>);
}

// Provide deterministic test data (intentionally unsorted to verify internal position selection)
const BASE_PODIUM = [
  { position: 3, driver_name: 'Driver Three', driver_id: 103, team_name: 'Team C' },
  { position: 1, driver_name: 'Driver One', driver_id: 101, team_name: 'Team A' },
  { position: 2, driver_name: 'Driver Two', driver_id: 102, team_name: 'Team B' },
];

describe('Podium component', () => {
  it('renders three podium drivers when valid data provided (order: 2,1,3 visually)', () => {
    renderWithChakra(<Podium podiumData={BASE_PODIUM} />);

    // All three driver names should be present
    expect(screen.getByText('Driver One')).toBeInTheDocument();
    expect(screen.getByText('Driver Two')).toBeInTheDocument();
    expect(screen.getByText('Driver Three')).toBeInTheDocument();
  });

  it('shows fallback message when fewer than 3 drivers supplied', () => {
    renderWithChakra(<Podium podiumData={BASE_PODIUM.slice(0, 2)} />);
    expect(screen.getByText(/Podium data not available/i)).toBeInTheDocument();
  });

  it('renders nothing when 3+ entries but one of positions 1,2,3 is missing', () => {
    // Remove the position 2 driver but still length >= 3
    const invalid = [
      { position: 1, driver_name: 'Driver One', driver_id: 101, team_name: 'Team A' },
      { position: 3, driver_name: 'Driver Three', driver_id: 103, team_name: 'Team C' },
      { position: 4, driver_name: 'Driver Four', driver_id: 104, team_name: 'Team D' },
    ];
    const { container } = renderWithChakra(<Podium podiumData={invalid} />);
    // Should not render fallback text (since length >=3) and also no driver names
    expect(screen.queryByText(/Podium data not available/i)).toBeNull();
    expect(container.textContent).not.toMatch(/Driver One|Driver Three|Driver Four/);
  });

  it('handles missing optional fields (driver_code/team_name) gracefully', () => {
    const minimal = [
      { position: 1, driver_id: 1 },
      { position: 2, driver_id: 2 },
      { position: 3, driver_id: 3 },
    ];
    renderWithChakra(<Podium podiumData={minimal} />);
    // Fallback to driver_id string representation (query headings to avoid duplicate numeric Text elements)
    expect(screen.getByRole('heading', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '3' })).toBeInTheDocument();
  });
});
