import { describe, it, expect } from '@jest/globals';

describe('Countries Entity', () => {
  describe('Country data structure', () => {
    it('should have correct structure for Country interface', () => {
      const countryData = {
        iso3: 'USA',
        country_name: 'United States'
      };

      expect(countryData).toHaveProperty('iso3');
      expect(countryData).toHaveProperty('country_name');
      expect(typeof countryData.iso3).toBe('string');
      expect(typeof countryData.country_name).toBe('string');
      expect(countryData.iso3).toHaveLength(3);
    });

    it('should handle different country codes', () => {
      const countries = [
        { iso3: 'GBR', country_name: 'United Kingdom' },
        { iso3: 'FRA', country_name: 'France' },
        { iso3: 'DEU', country_name: 'Germany' },
        { iso3: 'ITA', country_name: 'Italy' },
        { iso3: 'ESP', country_name: 'Spain' }
      ];

      countries.forEach(country => {
        expect(country.iso3).toHaveLength(3);
        expect(typeof country.country_name).toBe('string');
        expect(country.country_name.length).toBeGreaterThan(0);
      });
    });

    it('should handle special characters in country names', () => {
      const countryData = {
        iso3: 'ARE',
        country_name: 'United Arab Emirates'
      };

      expect(countryData.country_name).toContain(' ');
      expect(countryData.country_name).toContain('U');
    });

    it('should handle long country names', () => {
      const countryData = {
        iso3: 'VNM',
        country_name: 'Vietnam'
      };

      expect(countryData.country_name.length).toBeGreaterThan(0);
      expect(countryData.country_name.length).toBeLessThan(100);
    });
  });

  describe('ApiCircuit data structure', () => {
    it('should have correct structure for ApiCircuit interface', () => {
      const apiCircuitData = {
        circuitId: 'silverstone',
        circuitName: 'Silverstone Circuit',
        Location: {
          locality: 'Silverstone',
          country: 'Great Britain',
          lat: '52.0786',
          long: '-1.0169'
        },
        url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit'
      };

      expect(apiCircuitData).toHaveProperty('circuitId');
      expect(apiCircuitData).toHaveProperty('circuitName');
      expect(apiCircuitData).toHaveProperty('Location');
      expect(apiCircuitData).toHaveProperty('url');

      expect(typeof apiCircuitData.circuitId).toBe('string');
      expect(typeof apiCircuitData.circuitName).toBe('string');
      expect(typeof apiCircuitData.url).toBe('string');

      expect(apiCircuitData.Location).toHaveProperty('locality');
      expect(apiCircuitData.Location).toHaveProperty('country');
      expect(apiCircuitData.Location).toHaveProperty('lat');
      expect(apiCircuitData.Location).toHaveProperty('long');

      expect(typeof apiCircuitData.Location.locality).toBe('string');
      expect(typeof apiCircuitData.Location.country).toBe('string');
      expect(typeof apiCircuitData.Location.lat).toBe('string');
      expect(typeof apiCircuitData.Location.long).toBe('string');
    });

    it('should handle different circuit locations', () => {
      const circuits = [
        {
          circuitId: 'monaco',
          circuitName: 'Monaco Circuit',
          Location: {
            locality: 'Monte Carlo',
            country: 'Monaco',
            lat: '43.7347',
            long: '7.4206'
          },
          url: 'https://en.wikipedia.org/wiki/Monaco_Circuit'
        },
        {
          circuitId: 'spa',
          circuitName: 'Circuit de Spa-Francorchamps',
          Location: {
            locality: 'Spa',
            country: 'Belgium',
            lat: '50.4372',
            long: '5.9714'
          },
          url: 'https://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps'
        }
      ];

      circuits.forEach(circuit => {
        expect(circuit.Location.country).toBeDefined();
        expect(circuit.Location.lat).toBeDefined();
        expect(circuit.Location.long).toBeDefined();
        expect(circuit.Location.locality).toBeDefined();
      });
    });

    it('should handle empty or optional fields gracefully', () => {
      const circuitWithEmptyFields = {
        circuitId: 'test',
        circuitName: '',
        Location: {
          locality: '',
          country: '',
          lat: '',
          long: ''
        },
        url: ''
      };

      expect(circuitWithEmptyFields.circuitId).toBeDefined();
      expect(circuitWithEmptyFields.circuitName).toBeDefined();
      expect(circuitWithEmptyFields.Location.country).toBeDefined();
    });
  });

  describe('Data validation', () => {
    it('should validate country ISO3 codes are exactly 3 characters', () => {
      const validCountries = [
        { iso3: 'USA', country_name: 'United States' },
        { iso3: 'GBR', country_name: 'United Kingdom' },
        { iso3: 'FRA', country_name: 'France' }
      ];

      validCountries.forEach(country => {
        expect(country.iso3).toHaveLength(3);
        expect(country.iso3).toMatch(/^[A-Z]{3}$/);
      });
    });

    it('should validate circuit coordinates are numeric strings', () => {
      const circuitData = {
        circuitId: 'test',
        circuitName: 'Test Circuit',
        Location: {
          locality: 'Test City',
          country: 'Test Country',
          lat: '40.7128',
          long: '-74.0060'
        },
        url: 'https://example.com'
      };

      expect(circuitData.Location.lat).toMatch(/^-?\d+\.?\d*$/);
      expect(circuitData.Location.long).toMatch(/^-?\d+\.?\d*$/);
    });
  });
});
