import { describe, it, expect } from 'vitest';
import { fallbackDriverDetails } from './driverDetails';

describe('fallbackDriverDetails', () => {
  it('contains valid driver data', () => {
    expect(fallbackDriverDetails).toBeDefined();
    expect(fallbackDriverDetails.id).toBe(609);
    expect(fallbackDriverDetails.fullName).toBe('Oscar Piastri');
  });

  it('has required personal information fields', () => {
    expect(fallbackDriverDetails.firstName).toBe('Oscar');
    expect(fallbackDriverDetails.lastName).toBe('Piastri');
    expect(fallbackDriverDetails.countryCode).toBe('AUS');
    expect(fallbackDriverDetails.dateOfBirth).toBeTruthy();
  });

  it('has team information', () => {
    expect(fallbackDriverDetails.teamName).toBe('McLaren');
    expect(fallbackDriverDetails.number).toBe(81);
  });

  it('has career statistics', () => {
    expect(fallbackDriverDetails.wins).toBeGreaterThanOrEqual(0);
    expect(fallbackDriverDetails.podiums).toBeGreaterThanOrEqual(0);
    expect(fallbackDriverDetails.points).toBeGreaterThanOrEqual(0);
    expect(fallbackDriverDetails.championshipStanding).toBeTruthy();
  });

  it('has current season stats array', () => {
    expect(Array.isArray(fallbackDriverDetails.currentSeasonStats)).toBe(true);
    expect(fallbackDriverDetails.currentSeasonStats.length).toBeGreaterThan(0);
    
    fallbackDriverDetails.currentSeasonStats.forEach(stat => {
      expect(stat).toHaveProperty('label');
      expect(stat).toHaveProperty('value');
    });
  });

  it('has career stats array', () => {
    expect(Array.isArray(fallbackDriverDetails.careerStats)).toBe(true);
    expect(fallbackDriverDetails.careerStats.length).toBeGreaterThan(0);
    
    fallbackDriverDetails.careerStats.forEach(stat => {
      expect(stat).toHaveProperty('label');
      expect(stat).toHaveProperty('value');
    });
  });

  it('has wins per season data', () => {
    expect(Array.isArray(fallbackDriverDetails.winsPerSeason)).toBe(true);
    expect(fallbackDriverDetails.winsPerSeason.length).toBeGreaterThan(0);
    
    fallbackDriverDetails.winsPerSeason.forEach(seasonWins => {
      expect(seasonWins).toHaveProperty('season');
      expect(seasonWins).toHaveProperty('wins');
    });
  });

  it('has first race information', () => {
    expect(fallbackDriverDetails.firstRace).toBeDefined();
    expect(fallbackDriverDetails.firstRace.year).toBeTruthy();
    expect(fallbackDriverDetails.firstRace.event).toBeTruthy();
  });

  it('has fun fact', () => {
    expect(fallbackDriverDetails.funFact).toBeTruthy();
    expect(typeof fallbackDriverDetails.funFact).toBe('string');
  });

  it('has image URL', () => {
    expect(fallbackDriverDetails.imageUrl).toBeTruthy();
    expect(fallbackDriverDetails.imageUrl).toContain('http');
  });

  it('has valid world championships count', () => {
    expect(typeof fallbackDriverDetails.worldChampionships).toBe('number');
    expect(fallbackDriverDetails.worldChampionships).toBeGreaterThanOrEqual(0);
  });

  it('has grands prix entered', () => {
    expect(typeof fallbackDriverDetails.grandsPrixEntered).toBe('number');
    expect(fallbackDriverDetails.grandsPrixEntered).toBeGreaterThan(0);
  });
});

