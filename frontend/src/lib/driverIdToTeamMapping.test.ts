import { describe, it, expect } from 'vitest';
import { driverIdToTeamMapping, getTeamNameFromDriverId } from './driverIdToTeamMapping';

describe('driverIdToTeamMapping', () => {
  describe('driverIdToTeamMapping object', () => {
    it('contains mappings for 2025 drivers', () => {
      expect(driverIdToTeamMapping['1']).toBe('Red Bull Racing'); // Max Verstappen
      expect(driverIdToTeamMapping['2']).toBe('McLaren'); // Lando Norris
      expect(driverIdToTeamMapping['3']).toBe('Ferrari'); // Charles Leclerc
      expect(driverIdToTeamMapping['4']).toBe('McLaren'); // Oscar Piastri
    });

    it('includes all major teams', () => {
      const teams = Object.values(driverIdToTeamMapping);
      expect(teams).toContain('Red Bull Racing');
      expect(teams).toContain('Ferrari');
      expect(teams).toContain('McLaren');
      expect(teams).toContain('Mercedes');
      expect(teams).toContain('Aston Martin');
      expect(teams).toContain('Alpine');
      expect(teams).toContain('Williams');
      expect(teams).toContain('Haas');
      expect(teams).toContain('Sauber');
      expect(teams).toContain('RB F1 Team');
    });

    it('has unique driver IDs', () => {
      const ids = Object.keys(driverIdToTeamMapping);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('getTeamNameFromDriverId', () => {
    it('returns correct team for valid driver ID', () => {
      expect(getTeamNameFromDriverId('1')).toBe('Red Bull Racing');
      expect(getTeamNameFromDriverId('2')).toBe('McLaren');
      expect(getTeamNameFromDriverId('3')).toBe('Ferrari');
    });

    it('returns "Default" for undefined driver ID', () => {
      expect(getTeamNameFromDriverId(undefined)).toBe('Default');
    });

    it('returns "Default" for unknown driver ID', () => {
      expect(getTeamNameFromDriverId('9999')).toBe('Default');
    });

    it('handles empty string', () => {
      expect(getTeamNameFromDriverId('')).toBe('Default');
    });

    it('works with all mapped drivers', () => {
      Object.keys(driverIdToTeamMapping).forEach(driverId => {
        const teamName = getTeamNameFromDriverId(driverId);
        expect(teamName).toBeTruthy();
        expect(teamName).not.toBe('Default');
      });
    });

    it('returns correct teams for 2024 historical drivers', () => {
      expect(getTeamNameFromDriverId('21')).toBe('Red Bull Racing'); // Sergio Perez
      expect(getTeamNameFromDriverId('22')).toBe('Williams'); // Logan Sargeant
    });
  });
});

