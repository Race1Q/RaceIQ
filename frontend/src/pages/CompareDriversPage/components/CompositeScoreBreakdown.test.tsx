import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComparisonTable } from './ComparisonTable';

// Minimal driver details
const driver = {
  id: '1',
  fullName: 'Driver One',
  teamName: 'Team A',
  championshipStanding: 1,
  wins: 10,
  podiums: 20,
  points: 300,
  imageUrl: '',
  teamColorToken: '#ff0000'
};
const driver2 = { ...driver, id: '2', fullName: 'Driver Two', teamName: 'Team B', wins: 5, podiums: 12, points: 180 };

const baseStats = {
  driverId: 1,
  year: null,
  career: {
    wins: 10,
    podiums: 20,
    fastestLaps: 3,
    points: 300,
    dnfs: 2,
    sprintWins: 1,
    sprintPodiums: 2,
  },
  yearStats: null
};
const baseStats2 = {
  driverId: 2,
  year: null,
  career: {
    wins: 5,
    podiums: 12,
    fastestLaps: 1,
    points: 180,
    dnfs: 4,
    sprintWins: 0,
    sprintPodiums: 1,
  },
  yearStats: null
};

const enabledMetrics = {
  wins: true,
  podiums: true,
  fastestLaps: true,
  points: true,
  sprintWins: true,
  sprintPodiums: true,
  dnfs: true,
  poles: true,
};

// Precomputed simplistic composite score mimic (just to satisfy props; actual values not tested here)
const score = {
  d1: 80,
  d2: 60,
  perMetric: {
    wins: [1, 0.5],
    podiums: [1, 0.6],
    fastestLaps: [1, 0.33],
    points: [1, 0.6],
    sprintWins: [1, 0],
    sprintPodiums: [1, 0.5],
    dnfs: [1, 0.5],
    poles: [0.5, 0.5]
  }
};

describe('CompositeScoreBreakdown UI', () => {
  it('renders composite score and toggles breakdown', () => {
    render(
      <ComparisonTable
        driver1={driver as any}
        driver2={driver2 as any}
        stats1={baseStats as any}
        stats2={baseStats2 as any}
        enabledMetrics={enabledMetrics as any}
        selection1={{ driverId: '1', year: 'career' }}
        selection2={{ driverId: '2', year: 'career' }}
        score={score as any}
      />
    );

    expect(screen.getByText(/Composite Score/i)).toBeInTheDocument();
    // Score values
    expect(screen.getByText(/80\/100/)).toBeInTheDocument();
    expect(screen.getByText(/60\/100/)).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /show score breakdown/i });
    fireEvent.click(toggleBtn);
    // After expand, formula text should appear
    expect(screen.getByText(/Formula/i)).toBeInTheDocument();
  });
});
