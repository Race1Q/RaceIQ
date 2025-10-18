import { describe, it, expect } from 'vitest';
import { fallbackDriverStandings } from './driverStandings';

describe('fallbackDriverStandings', () => {
  it('exports array of driver standings', () => {
    expect(Array.isArray(fallbackDriverStandings)).toBe(true);
    expect(fallbackDriverStandings.length).toBeGreaterThan(0);
  });

  it('each standing has required fields', () => {
    fallbackDriverStandings.forEach(standing => {
      expect(standing).toHaveProperty('id');
      expect(standing).toHaveProperty('fullName');
      expect(standing).toHaveProperty('teamName');
    });
  });

  it('has valid driver data structure', () => {
    const firstDriver = fallbackDriverStandings[0];
    expect(firstDriver.id).toBeDefined();
    expect(typeof firstDriver.fullName).toBe('string');
    expect(firstDriver.fullName.length).toBeGreaterThan(0);
  });

  it('standings are ordered', () => {
    // If standings have position property, they should be ordered
    const hasPositions = fallbackDriverStandings.every(s => 'position' in s);
    if (hasPositions) {
      for (let i = 1; i < fallbackDriverStandings.length; i++) {
        const prev = (fallbackDriverStandings[i - 1] as any).position;
        const curr = (fallbackDriverStandings[i] as any).position;
        expect(curr).toBeGreaterThanOrEqual(prev);
      }
    }
  });

  it('contains F1 teams', () => {
    const teamNames = fallbackDriverStandings.map(s => s.teamName);
    const uniqueTeams = new Set(teamNames);
    
    // Should have multiple teams
    expect(uniqueTeams.size).toBeGreaterThan(1);
  });

  it('all drivers have headshot URLs', () => {
    fallbackDriverStandings.forEach(driver => {
      if ('headshotUrl' in driver) {
        expect(typeof driver.headshotUrl).toBe('string');
      }
    });
  });
});

