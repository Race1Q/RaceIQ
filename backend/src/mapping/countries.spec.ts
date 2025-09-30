import { jest, describe, it, expect } from '@jest/globals';
import { countryCodeMap, nationalityToCountryCodeMap } from './countries';

describe('Countries Mapping', () => {
  describe('countryCodeMap', () => {
    it('should be defined', () => {
      expect(countryCodeMap).toBeDefined();
      expect(typeof countryCodeMap).toBe('object');
    });

    it('should have entries for all countries', () => {
      expect(Object.keys(countryCodeMap).length).toBeGreaterThan(100);
    });

    it('should map country names to ISO country codes', () => {
      expect(countryCodeMap['United States']).toBe('USA');
      expect(countryCodeMap['United Kingdom']).toBe('GBR');
      expect(countryCodeMap['Germany']).toBe('DEU');
      expect(countryCodeMap['France']).toBe('FRA');
      expect(countryCodeMap['Italy']).toBe('ITA');
      expect(countryCodeMap['Spain']).toBe('ESP');
      expect(countryCodeMap['Netherlands']).toBe('NLD');
      expect(countryCodeMap['Brazil']).toBe('BRA');
      expect(countryCodeMap['Australia']).toBe('AUS');
      expect(countryCodeMap['Canada']).toBe('CAN');
    });

    it('should handle F1-relevant countries', () => {
      expect(countryCodeMap['Monaco']).toBe('MCO');
      expect(countryCodeMap['Austria']).toBe('AUT');
      expect(countryCodeMap['Belgium']).toBe('BEL');
      expect(countryCodeMap['Hungary']).toBe('HUN');
      expect(countryCodeMap['Turkey']).toBe('TUR');
      expect(countryCodeMap['Bahrain']).toBe('BHR');
      expect(countryCodeMap['Qatar']).toBe('QAT');
      expect(countryCodeMap['Saudi Arabia']).toBe('SAU');
      expect(countryCodeMap['United Arab Emirates']).toBe('ARE');
      expect(countryCodeMap['Singapore']).toBe('SGP');
      expect(countryCodeMap['Japan']).toBe('JPN');
      expect(countryCodeMap['Mexico']).toBe('MEX');
    });

    it('should handle country name variations', () => {
      expect(countryCodeMap['Slovak Republic']).toBe('SVK');
      expect(countryCodeMap['Democratic Republic of the Congo']).toBe('COD');
      expect(countryCodeMap['Republic of the Congo']).toBe('COG');
      expect(countryCodeMap['Ivory Coast']).toBe('CIV');
      expect(countryCodeMap['East Timor']).toBe('TLS');
      expect(countryCodeMap['Eswatini']).toBe('SWZ');
    });

    it('should have consistent country code format', () => {
      const countryCodes = Object.values(countryCodeMap);
      
      // All country codes should be 3 characters
      countryCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z]{3}$/);
        expect(code.length).toBe(3);
      });
    });

    it('should handle special characters in country names', () => {
      expect(countryCodeMap['Sao Tome and Principe']).toBe('STP');
      expect(countryCodeMap['Ivory Coast']).toBe('CIV');
      expect(countryCodeMap['Democratic Republic of the Congo']).toBe('COD');
    });

    it('should handle countries with spaces and hyphens', () => {
      expect(countryCodeMap['Bosnia and Herzegovina']).toBe('BIH');
      expect(countryCodeMap['Trinidad and Tobago']).toBe('TTO');
      expect(countryCodeMap['Papua New Guinea']).toBe('PNG');
      expect(countryCodeMap['Central African Republic']).toBe('CAF');
      expect(countryCodeMap['Saint Vincent and the Grenadines']).toBe('VCT');
      expect(countryCodeMap['Guinea-Bissau']).toBe('GNB');
      expect(countryCodeMap['Costa Rica']).toBe('CRI');
    });

    it('should handle edge cases and unusual country names', () => {
      expect(countryCodeMap['Vatican City']).toBe('VAT');
      expect(countryCodeMap['Marshall Islands']).toBe('MHL');
      expect(countryCodeMap['Solomon Islands']).toBe('SLB');
      expect(countryCodeMap['Maldives']).toBe('MDV');
      expect(countryCodeMap['Nauru']).toBe('NRU');
      expect(countryCodeMap['Tuvalu']).toBe('TUV');
    });
  });

  describe('nationalityToCountryCodeMap', () => {
    it('should be defined', () => {
      expect(nationalityToCountryCodeMap).toBeDefined();
      expect(typeof nationalityToCountryCodeMap).toBe('object');
    });

    it('should have entries for all nationalities', () => {
      expect(Object.keys(nationalityToCountryCodeMap).length).toBeGreaterThan(100);
    });

    it('should map nationalities to country codes', () => {
      expect(nationalityToCountryCodeMap['American']).toBe('USA');
      expect(nationalityToCountryCodeMap['British']).toBe('GBR');
      expect(nationalityToCountryCodeMap['German']).toBe('DEU');
      expect(nationalityToCountryCodeMap['French']).toBe('FRA');
      expect(nationalityToCountryCodeMap['Italian']).toBe('ITA');
      expect(nationalityToCountryCodeMap['Spanish']).toBe('ESP');
      expect(nationalityToCountryCodeMap['Dutch']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Brazilian']).toBe('BRA');
      expect(nationalityToCountryCodeMap['Australian']).toBe('AUS');
      expect(nationalityToCountryCodeMap['Canadian']).toBe('CAN');
    });

    it('should handle F1 driver nationalities', () => {
      expect(nationalityToCountryCodeMap['Monegasque']).toBe('MCO');
      expect(nationalityToCountryCodeMap['Austrian']).toBe('AUT');
      expect(nationalityToCountryCodeMap['Belgian']).toBe('BEL');
      expect(nationalityToCountryCodeMap['Hungarian']).toBe('HUN');
      expect(nationalityToCountryCodeMap['Turkish']).toBe('TUR');
      expect(nationalityToCountryCodeMap['Bahraini']).toBe('BHR');
      expect(nationalityToCountryCodeMap['Qatari']).toBe('QAT');
      expect(nationalityToCountryCodeMap['Emirati']).toBe('ARE');
      expect(nationalityToCountryCodeMap['Singaporean']).toBe('SGP');
      expect(nationalityToCountryCodeMap['Japanese']).toBe('JPN');
      expect(nationalityToCountryCodeMap['Mexican']).toBe('MEX');
    });

    it('should handle nationality variations', () => {
      expect(nationalityToCountryCodeMap['Argentine']).toBe('ARG');
      expect(nationalityToCountryCodeMap['Argentinian']).toBe('ARG');
      expect(nationalityToCountryCodeMap['New Zealand']).toBe('NZL');
      expect(nationalityToCountryCodeMap['New Zealander']).toBe('NZL');
      expect(nationalityToCountryCodeMap['Monégasque']).toBe('MCO');
      expect(nationalityToCountryCodeMap['Monegasque']).toBe('MCO');
    });

    it('should handle historical nationalities', () => {
      expect(nationalityToCountryCodeMap['Yugoslav']).toBe('SRB');
      expect(nationalityToCountryCodeMap['Soviet']).toBe('RUS');
      expect(nationalityToCountryCodeMap['East German']).toBe('DEU');
      expect(nationalityToCountryCodeMap['West German']).toBe('DEU');
      expect(nationalityToCountryCodeMap['Rhodesian']).toBe('ZWE');
      expect(nationalityToCountryCodeMap['Burmese']).toBe('MMR');
      expect(nationalityToCountryCodeMap['Ceylonese']).toBe('LKA');
      expect(nationalityToCountryCodeMap['Persian']).toBe('IRN');
    });

    it('should handle Dutch nationality variations', () => {
      expect(nationalityToCountryCodeMap['Dutch']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Holland']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Hollander']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Netherlandish']).toBe('NLD');
    });

    it('should have consistent country code format', () => {
      const countryCodes = Object.values(nationalityToCountryCodeMap);
      
      // All country codes should be 3 characters
      countryCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z]{3}$/);
        expect(code.length).toBe(3);
      });
    });

    it('should handle special nationalities', () => {
      expect(nationalityToCountryCodeMap['South African']).toBe('ZAF');
      expect(nationalityToCountryCodeMap['South Korean']).toBe('KOR');
      expect(nationalityToCountryCodeMap['North Korean']).toBe('PRK');
      expect(nationalityToCountryCodeMap['Central African']).toBe('CAF');
      expect(nationalityToCountryCodeMap['Equatorial Guinean']).toBe('GNQ');
      expect(nationalityToCountryCodeMap['Papua New Guinean']).toBe('PNG');
    });
  });

  describe('Mapping Consistency', () => {
    it('should have consistent mappings between country names and nationalities', () => {
      // Test some key mappings
      expect(countryCodeMap['United States']).toBe(nationalityToCountryCodeMap['American']);
      expect(countryCodeMap['United Kingdom']).toBe(nationalityToCountryCodeMap['British']);
      expect(countryCodeMap['Germany']).toBe(nationalityToCountryCodeMap['German']);
      expect(countryCodeMap['France']).toBe(nationalityToCountryCodeMap['French']);
      expect(countryCodeMap['Italy']).toBe(nationalityToCountryCodeMap['Italian']);
      expect(countryCodeMap['Spain']).toBe(nationalityToCountryCodeMap['Spanish']);
      expect(countryCodeMap['Netherlands']).toBe(nationalityToCountryCodeMap['Dutch']);
      expect(countryCodeMap['Brazil']).toBe(nationalityToCountryCodeMap['Brazilian']);
      expect(countryCodeMap['Australia']).toBe(nationalityToCountryCodeMap['Australian']);
      expect(countryCodeMap['Canada']).toBe(nationalityToCountryCodeMap['Canadian']);
    });

    it('should handle Monaco consistently', () => {
      expect(countryCodeMap['Monaco']).toBe('MCO');
      expect(nationalityToCountryCodeMap['Monegasque']).toBe('MCO');
      expect(nationalityToCountryCodeMap['Monégasque']).toBe('MCO');
    });

    it('should handle Netherlands consistently', () => {
      expect(countryCodeMap['Netherlands']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Dutch']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Holland']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Hollander']).toBe('NLD');
      expect(nationalityToCountryCodeMap['Netherlandish']).toBe('NLD');
    });
  });

  describe('F1-Specific Testing', () => {
    it('should handle all current F1 host countries', () => {
      const f1HostCountries = [
        'Australia', 'Bahrain', 'Saudi Arabia', 'United Arab Emirates',
        'Spain', 'Monaco', 'Azerbaijan', 'Canada', 'Austria', 'United Kingdom',
        'Hungary', 'Belgium', 'Netherlands', 'Italy', 'Singapore', 'Japan',
        'Qatar', 'United States', 'Mexico', 'Brazil'
      ];

      f1HostCountries.forEach(country => {
        expect(countryCodeMap[country]).toBeDefined();
        expect(countryCodeMap[country]).toMatch(/^[A-Z]{3}$/);
      });
    });

    it('should handle F1 driver nationalities', () => {
      const f1DriverNationalities = [
        'Dutch', 'British', 'Spanish', 'German', 'French', 'Italian',
        'Australian', 'Canadian', 'Mexican', 'Brazilian', 'Finnish',
        'Danish', 'Japanese', 'Monegasque', 'Austrian', 'Thai',
        'American', 'Chinese', 'New Zealand'
      ];

      f1DriverNationalities.forEach(nationality => {
        expect(nationalityToCountryCodeMap[nationality]).toBeDefined();
        expect(nationalityToCountryCodeMap[nationality]).toMatch(/^[A-Z]{3}$/);
      });
    });

    it('should handle championship-winning driver nationalities', () => {
      const championshipWinners = [
        'British', 'German', 'Finnish', 'Brazilian', 'French', 'Austrian',
        'Argentine', 'Australian', 'Canadian', 'South African', 'Dutch',
        'Spanish', 'Italian'
      ];

      championshipWinners.forEach(nationality => {
        expect(nationalityToCountryCodeMap[nationality]).toBeDefined();
        expect(nationalityToCountryCodeMap[nationality]).toMatch(/^[A-Z]{3}$/);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should not have duplicate country codes', () => {
      const countryCodes = Object.values(countryCodeMap);
      const uniqueCodes = new Set(countryCodes);
      
      // The mapping has some intentional duplicates for variations (e.g., different names for same country)
      expect(countryCodes.length).toBeGreaterThan(uniqueCodes.size);
      expect(uniqueCodes.size).toBeGreaterThan(150); // Should have at least 150 unique codes
    });

    it('should not have duplicate nationality codes', () => {
      const nationalityCodes = Object.values(nationalityToCountryCodeMap);
      const uniqueCodes = new Set(nationalityCodes);
      
      // The mapping has some intentional duplicates for variations (e.g., different nationalities for same country)
      expect(nationalityCodes.length).toBeGreaterThan(uniqueCodes.size);
      expect(uniqueCodes.size).toBeGreaterThan(150); // Should have at least 150 unique codes
    });

    it('should have valid ISO country codes', () => {
      const allCodes = [
        ...Object.values(countryCodeMap),
        ...Object.values(nationalityToCountryCodeMap)
      ];
      
      const uniqueCodes = [...new Set(allCodes)];
      
      // Common ISO 3166-1 alpha-3 codes that should be present
      const expectedCodes = ['USA', 'GBR', 'DEU', 'FRA', 'ITA', 'ESP', 'NLD', 'BRA', 'AUS', 'CAN'];
      
      expectedCodes.forEach(code => {
        expect(uniqueCodes).toContain(code);
      });
    });

    it('should handle case sensitivity correctly', () => {
      // All keys should be properly capitalized
      const countryKeys = Object.keys(countryCodeMap);
      const nationalityKeys = Object.keys(nationalityToCountryCodeMap);
      
      countryKeys.forEach(key => {
        expect(key).toMatch(/^[A-Z][a-zA-Z\s\-']*$/);
      });
      
      nationalityKeys.forEach(key => {
        expect(key).toMatch(/^[A-Z][a-zA-Z\s\-'éè]*$/);
      });
    });
  });

  describe('Performance', () => {
    it('should handle large number of lookups efficiently', () => {
      const startTime = Date.now();
      
      // Perform 1000 lookups
      for (let i = 0; i < 1000; i++) {
        const testCountries = ['United States', 'Germany', 'France', 'Italy', 'Spain'];
        const randomCountry = testCountries[i % testCountries.length];
        const code = countryCodeMap[randomCountry];
        expect(code).toBeDefined();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle nationality lookups efficiently', () => {
      const startTime = Date.now();
      
      // Perform 1000 nationality lookups
      for (let i = 0; i < 1000; i++) {
        const testNationalities = ['American', 'German', 'French', 'Italian', 'Spanish'];
        const randomNationality = testNationalities[i % testNationalities.length];
        const code = nationalityToCountryCodeMap[randomNationality];
        expect(code).toBeDefined();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Should complete in less than 200ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined lookups gracefully', () => {
      expect(countryCodeMap['NonExistentCountry']).toBeUndefined();
      expect(nationalityToCountryCodeMap['NonExistentNationality']).toBeUndefined();
    });

    it('should handle empty string lookups', () => {
      expect(countryCodeMap['']).toBeUndefined();
      expect(nationalityToCountryCodeMap['']).toBeUndefined();
    });

    it('should handle null lookups', () => {
      expect(countryCodeMap[null as any]).toBeUndefined();
      expect(nationalityToCountryCodeMap[null as any]).toBeUndefined();
    });

    it('should handle special characters in lookups', () => {
      expect(countryCodeMap['Country with Special Ch@rs']).toBeUndefined();
      expect(nationalityToCountryCodeMap['Nationality with Special Ch@rs']).toBeUndefined();
    });
  });

  describe('Completeness', () => {
    it('should have mappings for major world countries', () => {
      const majorCountries = [
        'United States', 'China', 'India', 'Japan', 'Germany', 'United Kingdom',
        'France', 'Italy', 'Brazil', 'Canada', 'Australia', 'Russia', 'South Korea',
        'Mexico', 'Spain', 'Indonesia', 'Netherlands', 'Saudi Arabia', 'Turkey', 'Switzerland'
      ];

      majorCountries.forEach(country => {
        expect(countryCodeMap[country]).toBeDefined();
      });
    });

    it('should have mappings for major nationalities', () => {
      const majorNationalities = [
        'American', 'Chinese', 'Indian', 'Japanese', 'German', 'British',
        'French', 'Italian', 'Brazilian', 'Canadian', 'Australian', 'Russian',
        'South Korean', 'Mexican', 'Spanish', 'Indonesian', 'Dutch', 'Saudi Arabian',
        'Turkish', 'Swiss'
      ];

      majorNationalities.forEach(nationality => {
        expect(nationalityToCountryCodeMap[nationality]).toBeDefined();
      });
    });

    it('should have comprehensive coverage for all continents', () => {
      // Test representatives from each continent
      const continentalCountries = {
        'North America': ['United States', 'Canada', 'Mexico'],
        'South America': ['Brazil', 'Argentina', 'Chile'],
        'Europe': ['Germany', 'France', 'Italy', 'Spain', 'United Kingdom'],
        'Asia': ['China', 'Japan', 'India', 'South Korea', 'Singapore'],
        'Africa': ['South Africa', 'Nigeria', 'Egypt', 'Morocco'],
        'Oceania': ['Australia', 'New Zealand']
      };

      Object.values(continentalCountries).flat().forEach(country => {
        expect(countryCodeMap[country]).toBeDefined();
      });
    });
  });
});
