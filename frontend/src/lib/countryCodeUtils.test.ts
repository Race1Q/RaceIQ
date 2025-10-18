import { describe, it, expect } from 'vitest';
import { countryCodeMap, getCountryFlagUrl } from './countryCodeUtils';

describe('countryCodeUtils', () => {
  describe('countryCodeMap', () => {
    it('contains common F1 country mappings', () => {
      expect(countryCodeMap['GBR']).toBe('GB');
      expect(countryCodeMap['NED']).toBe('NL');
      expect(countryCodeMap['MON']).toBe('MC');
      expect(countryCodeMap['GER']).toBe('DE');
      expect(countryCodeMap['ITA']).toBe('IT');
    });

    it('maps 3-letter codes to 2-letter codes', () => {
      expect(countryCodeMap['USA']).toBe('US');
      expect(countryCodeMap['FRA']).toBe('FR');
      expect(countryCodeMap['ESP']).toBe('ES');
    });

    it('has all major F1 countries', () => {
      expect(countryCodeMap['NED']).toBeTruthy(); // Netherlands
      expect(countryCodeMap['MON']).toBeTruthy(); // Monaco
      expect(countryCodeMap['FIN']).toBeTruthy(); // Finland
      expect(countryCodeMap['JPN']).toBeTruthy(); // Japan
      expect(countryCodeMap['AUS']).toBeTruthy(); // Australia
    });
  });

  describe('getCountryFlagUrl', () => {
    it('returns flag URL for valid 3-letter codes', () => {
      const url = getCountryFlagUrl('GBR');
      expect(url).toBe('https://flagcdn.com/w40/gb.png');
    });

    it('returns flag URL for Netherlands', () => {
      const url = getCountryFlagUrl('NED');
      expect(url).toBe('https://flagcdn.com/w40/nl.png');
    });

    it('returns empty string for null input', () => {
      const url = getCountryFlagUrl(null);
      expect(url).toBe('');
    });

    it('returns empty string for unknown codes', () => {
      const url = getCountryFlagUrl('ZZZ');
      expect(url).toBe('');
    });

    it('is case insensitive', () => {
      const urlUpper = getCountryFlagUrl('GBR');
      const urlLower = getCountryFlagUrl('gbr');
      expect(urlUpper).toBe(urlLower);
    });

    it('returns correct URL format', () => {
      const url = getCountryFlagUrl('USA');
      expect(url).toContain('https://flagcdn.com/w40/');
      expect(url).toContain('.png');
    });
  });
});

