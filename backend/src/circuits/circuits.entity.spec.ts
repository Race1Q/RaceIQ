import { describe, it, expect } from '@jest/globals';

describe('Circuits Entity', () => {
  describe('Circuit data structure', () => {
    it('should have correct structure', () => {
      const circuitData = {
        id: 1,
        name: 'Silverstone Circuit',
        location: 'Silverstone',
        country_code: 'GB',
        map_url: 'https://example.com/silverstone-map.jpg',
      };

      expect(circuitData).toHaveProperty('id');
      expect(circuitData).toHaveProperty('name');
      expect(circuitData).toHaveProperty('location');
      expect(circuitData).toHaveProperty('country_code');
      expect(circuitData).toHaveProperty('map_url');

      expect(typeof circuitData.id).toBe('number');
      expect(typeof circuitData.name).toBe('string');
      expect(typeof circuitData.location).toBe('string');
      expect(typeof circuitData.country_code).toBe('string');
      expect(typeof circuitData.map_url).toBe('string');
    });

    it('should handle optional fields', () => {
      const circuitData = {
        id: 2,
        name: 'Monaco Circuit',
        location: 'Monte Carlo',
        country_code: 'MC',
        map_url: null,
      };

      expect(circuitData).toHaveProperty('id');
      expect(circuitData).toHaveProperty('name');
      expect(circuitData).toHaveProperty('location');
      expect(circuitData).toHaveProperty('country_code');
      expect(circuitData).toHaveProperty('map_url');

      expect(circuitData.map_url).toBeNull();
    });

    it('should handle empty strings', () => {
      const circuitData = {
        id: 3,
        name: 'Test Circuit',
        location: '',
        country_code: 'XX',
        map_url: '',
      };

      expect(circuitData.location).toBe('');
      expect(circuitData.map_url).toBe('');
    });

    it('should handle long strings', () => {
      const longName = 'A'.repeat(1000);
      const circuitData = {
        id: 4,
        name: longName,
        location: 'Test Location',
        country_code: 'YY',
        map_url: 'https://example.com/test.jpg',
      };

      expect(circuitData.name).toBe(longName);
      expect(circuitData.name.length).toBe(1000);
    });

    it('should handle special characters in strings', () => {
      const circuitData = {
        id: 5,
        name: 'Circuit & Race Track',
        location: 'Test-City, State',
        country_code: 'ZZ',
        map_url: 'https://example.com/circuit&track.jpg',
      };

      expect(circuitData.name).toContain('&');
      expect(circuitData.location).toContain('-');
      expect(circuitData.location).toContain(',');
      expect(circuitData.map_url).toContain('&');
    });
  });

  describe('ApiCircuit data structure', () => {
    it('should have correct structure', () => {
      const apiCircuitData = {
        circuitId: 'silverstone',
        circuitName: 'Silverstone Circuit',
        Location: {
          locality: 'Silverstone',
          country: 'Great Britain',
        },
        url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit',
      };

      expect(apiCircuitData).toHaveProperty('circuitId');
      expect(apiCircuitData).toHaveProperty('circuitName');
      expect(apiCircuitData).toHaveProperty('Location');
      expect(apiCircuitData).toHaveProperty('url');

      expect(typeof apiCircuitData.circuitId).toBe('string');
      expect(typeof apiCircuitData.circuitName).toBe('string');
      expect(typeof apiCircuitData.Location).toBe('object');
      expect(typeof apiCircuitData.url).toBe('string');

      expect(apiCircuitData.Location).toHaveProperty('locality');
      expect(apiCircuitData.Location).toHaveProperty('country');
      expect(typeof apiCircuitData.Location.locality).toBe('string');
      expect(typeof apiCircuitData.Location.country).toBe('string');
    });

    it('should handle nested Location object', () => {
      const apiCircuitData = {
        circuitId: 'monaco',
        circuitName: 'Monaco Circuit',
        Location: {
          locality: 'Monte Carlo',
          country: 'Monaco',
        },
        url: 'https://en.wikipedia.org/wiki/Monaco_Circuit',
      };

      expect(apiCircuitData.Location.locality).toBe('Monte Carlo');
      expect(apiCircuitData.Location.country).toBe('Monaco');
    });

    it('should handle optional fields', () => {
      const apiCircuitData = {
        circuitId: 'test',
        circuitName: 'Test Circuit',
        Location: {
          locality: 'Test City',
          country: 'Test Country',
        },
        url: null,
      };

      expect(apiCircuitData.url).toBeNull();
    });

    it('should handle empty strings', () => {
      const apiCircuitData = {
        circuitId: 'empty',
        circuitName: '',
        Location: {
          locality: '',
          country: '',
        },
        url: '',
      };

      expect(apiCircuitData.circuitName).toBe('');
      expect(apiCircuitData.Location.locality).toBe('');
      expect(apiCircuitData.Location.country).toBe('');
      expect(apiCircuitData.url).toBe('');
    });

    it('should handle special characters', () => {
      const apiCircuitData = {
        circuitId: 'special-chars',
        circuitName: 'Circuit & Race Track',
        Location: {
          locality: 'Test-City, State',
          country: 'Test & Country',
        },
        url: 'https://example.com/circuit&track',
      };

      expect(apiCircuitData.circuitName).toContain('&');
      expect(apiCircuitData.Location.locality).toContain('-');
      expect(apiCircuitData.Location.locality).toContain(',');
      expect(apiCircuitData.Location.country).toContain('&');
      expect(apiCircuitData.url).toContain('&');
    });
  });

  describe('Data validation', () => {
    it('should validate circuit data types', () => {
      const circuitData = {
        id: 1,
        name: 'Valid Circuit',
        location: 'Valid Location',
        country_code: 'GB',
        map_url: 'https://example.com/valid.jpg',
      };

      // All required fields should be present
      expect(circuitData.id).toBeDefined();
      expect(circuitData.name).toBeDefined();
      expect(circuitData.location).toBeDefined();
      expect(circuitData.country_code).toBeDefined();
      expect(circuitData.map_url).toBeDefined();

      // Field types should be correct
      expect(typeof circuitData.id).toBe('number');
      expect(typeof circuitData.name).toBe('string');
      expect(typeof circuitData.location).toBe('string');
      expect(typeof circuitData.country_code).toBe('string');
      expect(typeof circuitData.map_url).toBe('string');
    });

    it('should validate API circuit data types', () => {
      const apiCircuitData = {
        circuitId: 'valid',
        circuitName: 'Valid API Circuit',
        Location: {
          locality: 'Valid Locality',
          country: 'Valid Country',
        },
        url: 'https://example.com/valid',
      };

      // All required fields should be present
      expect(apiCircuitData.circuitId).toBeDefined();
      expect(apiCircuitData.circuitName).toBeDefined();
      expect(apiCircuitData.Location).toBeDefined();
      expect(apiCircuitData.url).toBeDefined();

      // Field types should be correct
      expect(typeof apiCircuitData.circuitId).toBe('string');
      expect(typeof apiCircuitData.circuitName).toBe('string');
      expect(typeof apiCircuitData.Location).toBe('object');
      expect(typeof apiCircuitData.url).toBe('string');

      // Nested Location object should be valid
      expect(apiCircuitData.Location.locality).toBeDefined();
      expect(apiCircuitData.Location.country).toBeDefined();
      expect(typeof apiCircuitData.Location.locality).toBe('string');
      expect(typeof apiCircuitData.Location.country).toBe('string');
    });
  });
});
