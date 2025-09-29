import { jest, describe, it, expect } from '@jest/globals';
import { Driver } from './drivers.entity';

// Mock all the related entities
jest.mock('../countries/countries.entity', () => ({
  Country: jest.fn()
}));

jest.mock('../race-results/race-results.entity', () => ({
  RaceResult: jest.fn()
}));

jest.mock('../laps/laps.entity', () => ({
  Lap: jest.fn()
}));

jest.mock('../pit-stops/pit-stops.entity', () => ({
  PitStop: jest.fn()
}));

jest.mock('../qualifying-results/qualifying-results.entity', () => ({
  QualifyingResult: jest.fn()
}));

jest.mock('../tire-stints/tire-stints.entity', () => ({
  TireStint: jest.fn()
}));

describe('Driver Entity', () => {
  describe('Class Structure', () => {
    it('should be defined', () => {
      expect(Driver).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof Driver).toBe('function');
    });

    it('should be instantiable', () => {
      expect(() => new Driver()).not.toThrow();
    });
  });

  describe('Entity Properties', () => {
    it('should have all required properties', () => {
      const driver = new Driver();
      
      // Primary properties
      expect(driver).toHaveProperty('id');
      expect(driver).toHaveProperty('ergast_driver_ref');
      expect(driver).toHaveProperty('openf1_driver_ref');
      expect(driver).toHaveProperty('driver_number');
      expect(driver).toHaveProperty('first_name');
      expect(driver).toHaveProperty('last_name');
      expect(driver).toHaveProperty('name_acronym');
      expect(driver).toHaveProperty('country_code');
      expect(driver).toHaveProperty('date_of_birth');
      expect(driver).toHaveProperty('profile_image_url');
      expect(driver).toHaveProperty('bio');
      expect(driver).toHaveProperty('fun_fact');
      
      // Relationship properties
      expect(driver).toHaveProperty('country');
      expect(driver).toHaveProperty('raceResults');
      expect(driver).toHaveProperty('laps');
      expect(driver).toHaveProperty('pitStops');
      expect(driver).toHaveProperty('qualifyingResults');
      expect(driver).toHaveProperty('tireStints');
    });
  });

  describe('Property Assignment', () => {
    it('should allow setting basic properties', () => {
      const driver = new Driver();
      
      driver.id = 1;
      driver.ergast_driver_ref = 'hamilton';
      driver.openf1_driver_ref = 1001;
      driver.driver_number = 44;
      driver.first_name = 'Lewis';
      driver.last_name = 'Hamilton';
      driver.name_acronym = 'HAM';
      driver.country_code = 'GB';
      driver.date_of_birth = new Date('1985-01-07');
      driver.profile_image_url = 'https://example.com/lewis.jpg';
      driver.bio = 'Seven-time World Champion';
      driver.fun_fact = 'Started racing at age 8';
      
      expect(driver.id).toBe(1);
      expect(driver.ergast_driver_ref).toBe('hamilton');
      expect(driver.openf1_driver_ref).toBe(1001);
      expect(driver.driver_number).toBe(44);
      expect(driver.first_name).toBe('Lewis');
      expect(driver.last_name).toBe('Hamilton');
      expect(driver.name_acronym).toBe('HAM');
      expect(driver.country_code).toBe('GB');
      expect(driver.date_of_birth).toEqual(new Date('1985-01-07'));
      expect(driver.profile_image_url).toBe('https://example.com/lewis.jpg');
      expect(driver.bio).toBe('Seven-time World Champion');
      expect(driver.fun_fact).toBe('Started racing at age 8');
    });

    it('should allow setting relationship properties', () => {
      const driver = new Driver();
      
      const mockCountry = { country_code: 'GB', country_name: 'Great Britain' };
      const mockRaceResults = [{ id: 1, position: 1 }];
      const mockLaps = [{ id: 1, lap_number: 1 }];
      const mockPitStops = [{ id: 1, lap: 10 }];
      const mockQualifyingResults = [{ id: 1, position: 1 }];
      const mockTireStints = [{ id: 1, stint: 1 }];
      
      driver.country = mockCountry as any;
      driver.raceResults = mockRaceResults as any;
      driver.laps = mockLaps as any;
      driver.pitStops = mockPitStops as any;
      driver.qualifyingResults = mockQualifyingResults as any;
      driver.tireStints = mockTireStints as any;
      
      expect(driver.country).toEqual(mockCountry);
      expect(driver.raceResults).toEqual(mockRaceResults);
      expect(driver.laps).toEqual(mockLaps);
      expect(driver.pitStops).toEqual(mockPitStops);
      expect(driver.qualifyingResults).toEqual(mockQualifyingResults);
      expect(driver.tireStints).toEqual(mockTireStints);
    });
  });

  describe('Getter Methods', () => {
    it('should return full name when both first and last names exist', () => {
      const driver = new Driver();
      driver.first_name = 'Lewis';
      driver.last_name = 'Hamilton';
      
      expect(driver.full_name).toBe('Lewis Hamilton');
    });

    it('should return first name when last name is missing', () => {
      const driver = new Driver();
      driver.first_name = 'Lewis';
      driver.last_name = null;
      
      expect(driver.full_name).toBe('Lewis');
    });

    it('should return last name when first name is missing', () => {
      const driver = new Driver();
      driver.first_name = null;
      driver.last_name = 'Hamilton';
      
      expect(driver.full_name).toBe('Hamilton');
    });

    it('should return name acronym when both names are missing', () => {
      const driver = new Driver();
      driver.first_name = null;
      driver.last_name = null;
      driver.name_acronym = 'HAM';
      
      expect(driver.full_name).toBe('HAM');
    });

    it('should return default driver name when all name fields are missing', () => {
      const driver = new Driver();
      driver.id = 1;
      driver.first_name = null;
      driver.last_name = null;
      driver.name_acronym = null;
      
      expect(driver.full_name).toBe('Driver 1');
    });

    it('should return given_name as first_name', () => {
      const driver = new Driver();
      driver.first_name = 'Lewis';
      
      expect(driver.given_name).toBe('Lewis');
    });

    it('should return family_name as last_name', () => {
      const driver = new Driver();
      driver.last_name = 'Hamilton';
      
      expect(driver.family_name).toBe('Hamilton');
    });

    it('should return code as name_acronym', () => {
      const driver = new Driver();
      driver.name_acronym = 'HAM';
      
      expect(driver.code).toBe('HAM');
    });

    it('should return current_team_name as null', () => {
      const driver = new Driver();
      expect(driver.current_team_name).toBeNull();
    });

    it('should return image_url as profile_image_url', () => {
      const driver = new Driver();
      driver.profile_image_url = 'https://example.com/image.jpg';
      
      expect(driver.image_url).toBe('https://example.com/image.jpg');
    });

    it('should return team_color as null', () => {
      const driver = new Driver();
      expect(driver.team_color).toBeNull();
    });
  });

  describe('Real-world Driver Examples', () => {
    it('should work with Lewis Hamilton data', () => {
      const driver = new Driver();
      driver.id = 1;
      driver.ergast_driver_ref = 'hamilton';
      driver.openf1_driver_ref = 1001;
      driver.driver_number = 44;
      driver.first_name = 'Lewis';
      driver.last_name = 'Hamilton';
      driver.name_acronym = 'HAM';
      driver.country_code = 'GB';
      driver.date_of_birth = new Date('1985-01-07');
      driver.profile_image_url = 'https://example.com/lewis.jpg';
      driver.bio = 'Seven-time World Champion';
      driver.fun_fact = 'Started racing at age 8';
      
      expect(driver.full_name).toBe('Lewis Hamilton');
      expect(driver.given_name).toBe('Lewis');
      expect(driver.family_name).toBe('Hamilton');
      expect(driver.code).toBe('HAM');
      expect(driver.image_url).toBe('https://example.com/lewis.jpg');
    });

    it('should work with Max Verstappen data', () => {
      const driver = new Driver();
      driver.id = 2;
      driver.ergast_driver_ref = 'verstappen';
      driver.openf1_driver_ref = 1002;
      driver.driver_number = 1;
      driver.first_name = 'Max';
      driver.last_name = 'Verstappen';
      driver.name_acronym = 'VER';
      driver.country_code = 'NL';
      driver.date_of_birth = new Date('1997-09-30');
      driver.profile_image_url = 'https://example.com/max.jpg';
      driver.bio = 'Three-time World Champion';
      driver.fun_fact = 'Youngest F1 driver ever';
      
      expect(driver.full_name).toBe('Max Verstappen');
      expect(driver.given_name).toBe('Max');
      expect(driver.family_name).toBe('Verstappen');
      expect(driver.code).toBe('VER');
      expect(driver.image_url).toBe('https://example.com/max.jpg');
    });

    it('should work with Lando Norris data', () => {
      const driver = new Driver();
      driver.id = 3;
      driver.ergast_driver_ref = 'norris';
      driver.openf1_driver_ref = 1003;
      driver.driver_number = 4;
      driver.first_name = 'Lando';
      driver.last_name = 'Norris';
      driver.name_acronym = 'NOR';
      driver.country_code = 'GB';
      driver.date_of_birth = new Date('1999-11-13');
      driver.profile_image_url = 'https://example.com/lando.jpg';
      driver.bio = 'McLaren driver and sim racing enthusiast';
      driver.fun_fact = 'Popular Twitch streamer';
      
      expect(driver.full_name).toBe('Lando Norris');
      expect(driver.given_name).toBe('Lando');
      expect(driver.family_name).toBe('Norris');
      expect(driver.code).toBe('NOR');
      expect(driver.image_url).toBe('https://example.com/lando.jpg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const driver = new Driver();
      driver.id = 1;
      driver.ergast_driver_ref = null;
      driver.openf1_driver_ref = null;
      driver.driver_number = null;
      driver.first_name = null;
      driver.last_name = null;
      driver.name_acronym = null;
      driver.country_code = null;
      driver.date_of_birth = null;
      driver.profile_image_url = null;
      driver.bio = null;
      driver.fun_fact = null;
      
      expect(driver.ergast_driver_ref).toBeNull();
      expect(driver.openf1_driver_ref).toBeNull();
      expect(driver.driver_number).toBeNull();
      expect(driver.first_name).toBeNull();
      expect(driver.last_name).toBeNull();
      expect(driver.name_acronym).toBeNull();
      expect(driver.country_code).toBeNull();
      expect(driver.date_of_birth).toBeNull();
      expect(driver.profile_image_url).toBeNull();
      expect(driver.bio).toBeNull();
      expect(driver.fun_fact).toBeNull();
    });

    it('should handle undefined values', () => {
      const driver = new Driver();
      driver.id = 1;
      driver.ergast_driver_ref = undefined;
      driver.openf1_driver_ref = undefined;
      driver.driver_number = undefined;
      driver.first_name = undefined;
      driver.last_name = undefined;
      driver.name_acronym = undefined;
      driver.country_code = undefined;
      driver.date_of_birth = undefined;
      driver.profile_image_url = undefined;
      driver.bio = undefined;
      driver.fun_fact = undefined;
      
      expect(driver.ergast_driver_ref).toBeUndefined();
      expect(driver.openf1_driver_ref).toBeUndefined();
      expect(driver.driver_number).toBeUndefined();
      expect(driver.first_name).toBeUndefined();
      expect(driver.last_name).toBeUndefined();
      expect(driver.name_acronym).toBeUndefined();
      expect(driver.country_code).toBeUndefined();
      expect(driver.date_of_birth).toBeUndefined();
      expect(driver.profile_image_url).toBeUndefined();
      expect(driver.bio).toBeUndefined();
      expect(driver.fun_fact).toBeUndefined();
    });

    it('should handle empty strings', () => {
      const driver = new Driver();
      driver.id = 1;
      driver.ergast_driver_ref = '';
      driver.first_name = '';
      driver.last_name = '';
      driver.name_acronym = '';
      driver.country_code = '';
      driver.profile_image_url = '';
      driver.bio = '';
      driver.fun_fact = '';
      
      expect(driver.ergast_driver_ref).toBe('');
      expect(driver.first_name).toBe('');
      expect(driver.last_name).toBe('');
      expect(driver.name_acronym).toBe('');
      expect(driver.country_code).toBe('');
      expect(driver.profile_image_url).toBe('');
      expect(driver.bio).toBe('');
      expect(driver.fun_fact).toBe('');
    });
  });

  describe('Data Types', () => {
    it('should accept string for text fields', () => {
      const driver = new Driver();
      const textFields = [
        'ergast_driver_ref',
        'first_name',
        'last_name',
        'name_acronym',
        'country_code',
        'profile_image_url',
        'bio',
        'fun_fact'
      ];
      
      textFields.forEach(field => {
        driver[field] = 'test string';
        expect(driver[field]).toBe('test string');
        expect(typeof driver[field]).toBe('string');
      });
    });

    it('should accept number for numeric fields', () => {
      const driver = new Driver();
      const numericFields = ['id', 'openf1_driver_ref', 'driver_number'];
      
      numericFields.forEach(field => {
        driver[field] = 123;
        expect(driver[field]).toBe(123);
        expect(typeof driver[field]).toBe('number');
      });
    });

    it('should accept Date for date_of_birth', () => {
      const driver = new Driver();
      const testDate = new Date('1990-01-01');
      
      driver.date_of_birth = testDate;
      expect(driver.date_of_birth).toEqual(testDate);
      expect(driver.date_of_birth).toBeInstanceOf(Date);
    });
  });

  describe('Relationship Arrays', () => {
    it('should handle empty arrays', () => {
      const driver = new Driver();
      const arrayFields = ['raceResults', 'laps', 'pitStops', 'qualifyingResults', 'tireStints'];
      
      arrayFields.forEach(field => {
        driver[field] = [];
        expect(driver[field]).toEqual([]);
        expect(Array.isArray(driver[field])).toBe(true);
      });
    });

    it('should handle arrays with multiple items', () => {
      const driver = new Driver();
      
      const mockRaceResults = [
        { id: 1, position: 1 },
        { id: 2, position: 2 },
        { id: 3, position: 3 }
      ];
      
      driver.raceResults = mockRaceResults as any;
      
      expect(driver.raceResults).toHaveLength(3);
      expect(driver.raceResults[0].id).toBe(1);
      expect(driver.raceResults[1].id).toBe(2);
      expect(driver.raceResults[2].id).toBe(3);
    });
  });

  describe('TypeORM Integration', () => {
    it('should have proper entity structure for TypeORM', () => {
      const driver = new Driver();
      
      // Test that the entity has the expected structure
      expect(driver).toHaveProperty('id');
      expect(driver).toHaveProperty('ergast_driver_ref');
      expect(driver).toHaveProperty('openf1_driver_ref');
      expect(driver).toHaveProperty('driver_number');
      expect(driver).toHaveProperty('first_name');
      expect(driver).toHaveProperty('last_name');
      expect(driver).toHaveProperty('name_acronym');
      expect(driver).toHaveProperty('country_code');
      expect(driver).toHaveProperty('date_of_birth');
      expect(driver).toHaveProperty('profile_image_url');
      expect(driver).toHaveProperty('bio');
      expect(driver).toHaveProperty('fun_fact');
    });

    it('should support relationship mapping', () => {
      const driver = new Driver();
      const mockCountry = { country_code: 'GB', country_name: 'Great Britain' };
      const mockRaceResults = [{ id: 1, position: 1 }];
      
      driver.country = mockCountry as any;
      driver.raceResults = mockRaceResults as any;
      
      expect(driver.country).toEqual(mockCountry);
      expect(driver.raceResults).toEqual(mockRaceResults);
    });
  });

  describe('Performance', () => {
    it('should create multiple instances without issues', () => {
      const drivers: Driver[] = [];
      
      for (let i = 0; i < 100; i++) {
        const driver = new Driver();
        driver.id = i + 1;
        driver.first_name = `Driver${i + 1}`;
        driver.last_name = 'Test';
        driver.driver_number = i + 1;
        drivers.push(driver);
      }
      
      expect(drivers).toHaveLength(100);
      expect(drivers[0].id).toBe(1);
      expect(drivers[99].id).toBe(100);
    });

    it('should handle large relationship arrays', () => {
      const driver = new Driver();
      const largeRaceResultsArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        position: (i % 20) + 1
      }));
      
      driver.raceResults = largeRaceResultsArray as any;
      expect(driver.raceResults).toHaveLength(1000);
      expect(driver.raceResults[0].id).toBe(1);
      expect(driver.raceResults[999].id).toBe(1000);
    });
  });

  describe('Immutability and References', () => {
    it('should maintain separate instances', () => {
      const driver1 = new Driver();
      const driver2 = new Driver();
      
      driver1.first_name = 'Lewis';
      driver2.first_name = 'Max';
      
      expect(driver1.first_name).toBe('Lewis');
      expect(driver2.first_name).toBe('Max');
      expect(driver1.first_name).not.toBe(driver2.first_name);
    });

    it('should handle object references correctly', () => {
      const driver = new Driver();
      const raceResults = [{ id: 1, position: 1 }];
      
      driver.raceResults = raceResults as any;
      
      // The driver should have the race results array
      expect(driver.raceResults).toHaveLength(1);
      expect(driver.raceResults[0].id).toBe(1);
      
      // Modifying the original array should affect the driver's race results
      raceResults.push({ id: 2, position: 2 });
      expect(driver.raceResults).toHaveLength(2);
    });
  });
});
