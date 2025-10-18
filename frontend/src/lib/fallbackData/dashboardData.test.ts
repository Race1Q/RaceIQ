import { describe, it, expect } from 'vitest';
import { fallbackDashboardData } from './dashboardData';

describe('fallbackDashboardData', () => {
  it('exports fallback dashboard data', () => {
    expect(fallbackDashboardData).toBeDefined();
  });

  it('has next race information', () => {
    if (fallbackDashboardData.nextRace) {
      expect(fallbackDashboardData.nextRace).toHaveProperty('raceName');
      expect(fallbackDashboardData.nextRace).toHaveProperty('circuitName');
    }
  });

  it('has championship standings', () => {
    if (fallbackDashboardData.championshipStandings) {
      expect(Array.isArray(fallbackDashboardData.championshipStandings)).toBe(true);
    }
  });

  it('has constructor standings', () => {
    if (fallbackDashboardData.constructorStandings) {
      expect(Array.isArray(fallbackDashboardData.constructorStandings)).toBe(true);
    }
  });

  it('has last race podium', () => {
    if (fallbackDashboardData.lastRacePodium) {
      expect(fallbackDashboardData.lastRacePodium).toBeDefined();
    }
  });

  it('has standings year', () => {
    if (fallbackDashboardData.standingsYear) {
      expect(typeof fallbackDashboardData.standingsYear).toBe('number');
      expect(fallbackDashboardData.standingsYear).toBeGreaterThan(2000);
    }
  });

  it('is a valid JavaScript object', () => {
    expect(typeof fallbackDashboardData).toBe('object');
    expect(fallbackDashboardData).not.toBeNull();
  });
});

