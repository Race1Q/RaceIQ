// src/components/FlagsTimeline/FlagsTimeline.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import FlagsTimeline from './FlagsTimeline';

// Mock CSS module
vi.mock('./FlagsTimeline.module.css', () => ({
  default: {
    container: 'container',
    title: 'title',
    timelineContainer: 'timelineContainer',
    timeline: 'timeline',
    segment: 'segment',
    labels: 'labels',
    lapLabel: 'lapLabel',
    legend: 'legend',
    legendTitle: 'legendTitle',
    legendItems: 'legendItems',
    legendItem: 'legendItem',
    legendColor: 'legendColor',
    legendText: 'legendText',
    green: 'green',
    yellow: 'yellow',
    red: 'red',
    safetyCar: 'safetyCar',
    virtualSafetyCar: 'virtualSafetyCar',
  },
}), { virtual: true });

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

// Helpers
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
const hasExactText = (node: Element | null, expected: string) =>
  normalize(node?.textContent || '') === expected;

// Only match nodes that DO NOT have a child with the same exact text
const exactLeaf = (expected: string) => (_: string, node: Element | null) => {
  if (!node) return false;
  if (!hasExactText(node, expected)) return false;
  return !Array.from(node.children).some((c) => hasExactText(c as Element, expected));
};

describe('FlagsTimeline', () => {
  const timeline = [
    { type: 'green', startLap: 1, endLap: 4 },
    { type: 'yellow', startLap: 5, endLap: 7 },
    { type: 'virtual_safety_car', startLap: 8, endLap: 10 },
  ];

  it('renders title, lap labels, legend items, and segments with expected widths', () => {
    renderWithChakra(<FlagsTimeline timeline={timeline as any} />);

    // Title
    expect(screen.getByText(/race timeline/i)).toBeInTheDocument();

    // Lap labels (exact)
    expect(screen.getByText(exactLeaf('Lap 1'))).toBeInTheDocument();
    expect(screen.getByText(exactLeaf('Lap 10'))).toBeInTheDocument();

    // Legend container (scope queries to avoid accidental duplicates)
    const legend = screen.getByText(exactLeaf('Flag Types:')).closest('div')!;
    const lw = within(legend);

    expect(lw.getByText(exactLeaf('Green Flag'))).toBeInTheDocument();
    expect(lw.getByText(exactLeaf('Yellow Flag'))).toBeInTheDocument();
    expect(lw.getByText(exactLeaf('Safety Car'))).toBeInTheDocument();
    expect(lw.getByText(exactLeaf('Virtual Safety Car'))).toBeInTheDocument();

    // Segments (titles + width)
    const seg1 = screen.getByTitle(/Green Flag - Laps 1-4/i) as HTMLElement;
    const seg2 = screen.getByTitle(/Yellow Flag - Laps 5-7/i) as HTMLElement;
    const seg3 = screen.getByTitle(/Virtual Safety Car - Laps 8-10/i) as HTMLElement;

    expect(seg1).toBeInTheDocument();
    expect(seg1).toHaveStyle({ width: '40%' }); // 4/10

    expect(seg2).toBeInTheDocument();
    expect(seg2).toHaveStyle({ width: '30%' }); // 3/10

    expect(seg3).toBeInTheDocument();
    expect(seg3).toHaveStyle({ width: '30%' }); // 3/10
  });

  it('defaults unknown flag type to green (by title)', () => {
    const weird = [{ type: 'purple_mystery', startLap: 1, endLap: 2 }];
    renderWithChakra(<FlagsTimeline timeline={weird as any} />);

    const seg = screen.getByTitle(/Green Flag - Laps 1-2/i) as HTMLElement; // default label
    expect(seg).toBeInTheDocument();
  });

  it('renders the timeline container and items with expected structure', () => {
    renderWithChakra(<FlagsTimeline timeline={timeline as any} />);

    expect(screen.getByText(/race timeline/i)).toBeInTheDocument();
    expect(screen.getAllByTitle(/laps/i).length).toBeGreaterThan(0);
  });
});
