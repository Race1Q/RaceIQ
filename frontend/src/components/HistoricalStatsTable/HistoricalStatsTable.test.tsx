// src/components/HistoricalStatsTable/HistoricalStatsTable.test.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import HistoricalStatsTable from './HistoricalStatsTable';

vi.mock('./HistoricalStatsTable.module.css', () => ({
  default: {
    container: 'container',
    title: 'title',
    tableContainer: 'tableContainer',
    table: 'table',
    headerCell: 'headerCell',
    cell: 'cell',
    cellContent: 'cellContent',
    icon: 'icon',
    cellText: 'cellText',
    cellValue: 'cellValue',
    cellSubtext: 'cellSubtext',
  },
}), { virtual: true });

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

function renderWithChakra(ui: React.ReactNode) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('HistoricalStatsTable', () => {
  const sampleStats = {
    lapRecord: { time: '1:18.750', driver: 'Max Verstappen' },
    previousWinner: 'Lando Norris',
  };

  it('renders the title and table headers', () => {
    renderWithChakra(<HistoricalStatsTable stats={sampleStats as any} />);

    expect(screen.getByText(/historical statistics/i)).toBeInTheDocument();

    const table = screen.getByRole('table');
    // ✅ Assert headers directly — avoids ambiguous rowgroup
    expect(within(table).getByRole('columnheader', { name: /statistic/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /value/i })).toBeInTheDocument();
  });

  it('renders Lap Record row with time and driver subtext', () => {
    renderWithChakra(<HistoricalStatsTable stats={sampleStats as any} />);

    expect(screen.getByText(/lap record/i)).toBeInTheDocument();
    expect(screen.getByText('1:18.750')).toBeInTheDocument();
    expect(screen.getByText(/by max verstappen/i)).toBeInTheDocument();
  });

  it('renders Previous Winner row with correct value', () => {
    renderWithChakra(<HistoricalStatsTable stats={sampleStats as any} />);

    expect(screen.getByText(/previous winner/i)).toBeInTheDocument();
    expect(screen.getByText('Lando Norris')).toBeInTheDocument();
  });

  it('has exactly two data rows under tbody', () => {
    const { container } = renderWithChakra(<HistoricalStatsTable stats={sampleStats as any} />);
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeTruthy();

    const rows = tbody?.querySelectorAll('tr') ?? [];
    expect(rows.length).toBe(2);
  });

  it('smoke-checks that icons render within the appropriate rows', () => {
    const { container } = renderWithChakra(<HistoricalStatsTable stats={sampleStats as any} />);
    const tbody = container.querySelector('tbody')!;
    const lapRecordRow = within(tbody).getByText(/lap record/i).closest('tr')!;
    const prevWinnerRow = within(tbody).getByText(/previous winner/i).closest('tr')!;

    expect(lapRecordRow.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);
    expect(prevWinnerRow.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);
  });
});
