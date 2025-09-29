import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DriverStandingMaterialized } from './driver-standings-materialized.entity';

describe('DriverStandingMaterialized Entity', () => {
  let standing: DriverStandingMaterialized;

  beforeEach(() => {
    standing = new DriverStandingMaterialized();
  });

  describe('Entity Structure', () => {
    it('should be defined', () => {
      expect(standing).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof DriverStandingMaterialized).toBe('function');
    });

    it('should be instantiable', () => {
      expect(standing).toBeInstanceOf(DriverStandingMaterialized);
    });

    it('should be a valid entity class', () => {
      expect(standing).toBeDefined();
      expect(standing).toBeInstanceOf(DriverStandingMaterialized);
    });
  });

  describe('Composite Primary Key', () => {
    it('should have seasonYear property', () => {
      expect(standing.seasonYear).toBeUndefined();
    });

    it('should have driverId property', () => {
      expect(standing.driverId).toBeUndefined();
    });

    it('should accept number type for seasonYear', () => {
      standing.seasonYear = 2023;
      expect(standing.seasonYear).toBe(2023);
      expect(typeof standing.seasonYear).toBe('number');
    });

    it('should accept number type for driverId', () => {
      standing.driverId = 44;
      expect(standing.driverId).toBe(44);
      expect(typeof standing.driverId).toBe('number');
    });

    it('should handle typical F1 season years', () => {
      const years = [2020, 2021, 2022, 2023, 2024];
      years.forEach(year => {
        standing.seasonYear = year;
        expect(standing.seasonYear).toBe(year);
      });
    });

    it('should handle typical driver IDs', () => {
      const driverIds = [1, 44, 33, 16, 77, 11];
      driverIds.forEach(id => {
        standing.driverId = id;
        expect(standing.driverId).toBe(id);
      });
    });

    it('should handle composite primary key together', () => {
      standing.seasonYear = 2023;
      standing.driverId = 44;
      expect(standing.seasonYear).toBe(2023);
      expect(standing.driverId).toBe(44);
    });
  });

  describe('driverFullName Column', () => {
    it('should have driverFullName property', () => {
      expect(standing.driverFullName).toBeUndefined();
    });

    it('should accept string type for driverFullName', () => {
      standing.driverFullName = 'Lewis Hamilton';
      expect(standing.driverFullName).toBe('Lewis Hamilton');
      expect(typeof standing.driverFullName).toBe('string');
    });

    it('should handle typical F1 driver names', () => {
      const driverNames = [
        'Lewis Hamilton',
        'Max Verstappen',
        'Charles Leclerc',
        'George Russell',
        'Lando Norris',
        'Fernando Alonso'
      ];

      driverNames.forEach(name => {
        standing.driverFullName = name;
        expect(standing.driverFullName).toBe(name);
      });
    });

    it('should handle names with special characters', () => {
      standing.driverFullName = 'José María López';
      expect(standing.driverFullName).toBe('José María López');
    });

    it('should handle empty string', () => {
      standing.driverFullName = '';
      expect(standing.driverFullName).toBe('');
    });

    it('should handle very long names', () => {
      const longName = 'Very Long Driver Name With Multiple Parts And Characters';
      standing.driverFullName = longName;
      expect(standing.driverFullName).toBe(longName);
    });
  });

  describe('constructorName Column', () => {
    it('should have constructorName property', () => {
      expect(standing.constructorName).toBeUndefined();
    });

    it('should accept string type for constructorName', () => {
      standing.constructorName = 'Mercedes';
      expect(standing.constructorName).toBe('Mercedes');
      expect(typeof standing.constructorName).toBe('string');
    });

    it('should handle typical F1 constructor names', () => {
      const constructorNames = [
        'Mercedes',
        'Red Bull Racing',
        'Ferrari',
        'McLaren',
        'Alpine',
        'Aston Martin',
        'Williams',
        'AlphaTauri',
        'Alfa Romeo',
        'Haas F1 Team'
      ];

      constructorNames.forEach(name => {
        standing.constructorName = name;
        expect(standing.constructorName).toBe(name);
      });
    });

    it('should handle constructor names with spaces', () => {
      standing.constructorName = 'Red Bull Racing';
      expect(standing.constructorName).toBe('Red Bull Racing');
    });

    it('should handle empty string', () => {
      standing.constructorName = '';
      expect(standing.constructorName).toBe('');
    });
  });

  describe('seasonPoints Column', () => {
    it('should have seasonPoints property', () => {
      expect(standing.seasonPoints).toBeUndefined();
    });

    it('should accept number type for seasonPoints', () => {
      standing.seasonPoints = 454;
      expect(standing.seasonPoints).toBe(454);
      expect(typeof standing.seasonPoints).toBe('number');
    });

    it('should handle typical F1 championship points', () => {
      const points = [0, 25, 50, 100, 200, 350, 454];
      points.forEach(point => {
        standing.seasonPoints = point;
        expect(standing.seasonPoints).toBe(point);
      });
    });

    it('should handle zero points', () => {
      standing.seasonPoints = 0;
      expect(standing.seasonPoints).toBe(0);
    });

    it('should handle large point totals', () => {
      standing.seasonPoints = 575;
      expect(standing.seasonPoints).toBe(575);
    });

    it('should handle decimal points', () => {
      standing.seasonPoints = 454.5;
      expect(standing.seasonPoints).toBe(454.5);
    });
  });

  describe('seasonWins Column', () => {
    it('should have seasonWins property', () => {
      expect(standing.seasonWins).toBeUndefined();
    });

    it('should accept number type for seasonWins', () => {
      standing.seasonWins = 19;
      expect(standing.seasonWins).toBe(19);
      expect(typeof standing.seasonWins).toBe('number');
    });

    it('should handle typical F1 win counts', () => {
      const wins = [0, 1, 5, 10, 15, 19, 22];
      wins.forEach(win => {
        standing.seasonWins = win;
        expect(standing.seasonWins).toBe(win);
      });
    });

    it('should handle zero wins', () => {
      standing.seasonWins = 0;
      expect(standing.seasonWins).toBe(0);
    });

    it('should handle maximum possible wins in a season', () => {
      standing.seasonWins = 24; // Max races in a season
      expect(standing.seasonWins).toBe(24);
    });
  });

  describe('driverNumber Column (Nullable)', () => {
    it('should have driverNumber property', () => {
      expect(standing.driverNumber).toBeUndefined();
    });

    it('should accept number type for driverNumber', () => {
      standing.driverNumber = 44;
      expect(standing.driverNumber).toBe(44);
      expect(typeof standing.driverNumber).toBe('number');
    });

    it('should accept null for driverNumber', () => {
      standing.driverNumber = null;
      expect(standing.driverNumber).toBeNull();
    });

    it('should accept undefined for driverNumber', () => {
      standing.driverNumber = undefined;
      expect(standing.driverNumber).toBeUndefined();
    });

    it('should handle typical F1 driver numbers', () => {
      const driverNumbers = [1, 3, 11, 16, 33, 44, 55, 63, 77, 81];
      driverNumbers.forEach(num => {
        standing.driverNumber = num;
        expect(standing.driverNumber).toBe(num);
      });
    });

    it('should handle single digit driver numbers', () => {
      standing.driverNumber = 1;
      expect(standing.driverNumber).toBe(1);
    });

    it('should handle double digit driver numbers', () => {
      standing.driverNumber = 99;
      expect(standing.driverNumber).toBe(99);
    });
  });

  describe('countryCode Column (Nullable)', () => {
    it('should have countryCode property', () => {
      expect(standing.countryCode).toBeUndefined();
    });

    it('should accept string type for countryCode', () => {
      standing.countryCode = 'GBR';
      expect(standing.countryCode).toBe('GBR');
      expect(typeof standing.countryCode).toBe('string');
    });

    it('should accept null for countryCode', () => {
      standing.countryCode = null;
      expect(standing.countryCode).toBeNull();
    });

    it('should accept undefined for countryCode', () => {
      standing.countryCode = undefined;
      expect(standing.countryCode).toBeUndefined();
    });

    it('should handle typical country codes', () => {
      const countryCodes = ['GBR', 'NED', 'MON', 'AUS', 'FIN', 'ESP', 'GER', 'FRA'];
      countryCodes.forEach(code => {
        standing.countryCode = code;
        expect(standing.countryCode).toBe(code);
      });
    });

    it('should handle empty string', () => {
      standing.countryCode = '';
      expect(standing.countryCode).toBe('');
    });
  });

  describe('profileImageUrl Column (Nullable)', () => {
    it('should have profileImageUrl property', () => {
      expect(standing.profileImageUrl).toBeUndefined();
    });

    it('should accept string type for profileImageUrl', () => {
      standing.profileImageUrl = 'https://example.com/image.jpg';
      expect(standing.profileImageUrl).toBe('https://example.com/image.jpg');
      expect(typeof standing.profileImageUrl).toBe('string');
    });

    it('should accept null for profileImageUrl', () => {
      standing.profileImageUrl = null;
      expect(standing.profileImageUrl).toBeNull();
    });

    it('should accept undefined for profileImageUrl', () => {
      standing.profileImageUrl = undefined;
      expect(standing.profileImageUrl).toBeUndefined();
    });

    it('should handle typical image URLs', () => {
      const urls = [
        'https://example.com/lewis-hamilton.jpg',
        'https://f1.com/drivers/max-verstappen.png',
        'https://cdn.racing.com/images/drivers/charles-leclerc.webp'
      ];

      urls.forEach(url => {
        standing.profileImageUrl = url;
        expect(standing.profileImageUrl).toBe(url);
      });
    });

    it('should handle empty string', () => {
      standing.profileImageUrl = '';
      expect(standing.profileImageUrl).toBe('');
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://very-long-domain-name.com/very/long/path/to/image/with/many/parameters?param1=value1&param2=value2&param3=value3.jpg';
      standing.profileImageUrl = longUrl;
      expect(standing.profileImageUrl).toBe(longUrl);
    });
  });

  describe('seasonPodiums Column', () => {
    it('should have seasonPodiums property', () => {
      expect(standing.seasonPodiums).toBeUndefined();
    });

    it('should accept number type for seasonPodiums', () => {
      standing.seasonPodiums = 17;
      expect(standing.seasonPodiums).toBe(17);
      expect(typeof standing.seasonPodiums).toBe('number');
    });

    it('should handle typical F1 podium counts', () => {
      const podiums = [0, 1, 3, 5, 10, 15, 17, 20];
      podiums.forEach(podium => {
        standing.seasonPodiums = podium;
        expect(standing.seasonPodiums).toBe(podium);
      });
    });

    it('should handle zero podiums', () => {
      standing.seasonPodiums = 0;
      expect(standing.seasonPodiums).toBe(0);
    });

    it('should handle maximum possible podiums in a season', () => {
      standing.seasonPodiums = 24; // Max races in a season
      expect(standing.seasonPodiums).toBe(24);
    });
  });

  describe('Entity Instantiation', () => {
    it('should create instance without parameters', () => {
      const newStanding = new DriverStandingMaterialized();
      expect(newStanding).toBeInstanceOf(DriverStandingMaterialized);
      expect(newStanding.seasonYear).toBeUndefined();
      expect(newStanding.driverId).toBeUndefined();
      expect(newStanding.driverFullName).toBeUndefined();
      expect(newStanding.constructorName).toBeUndefined();
      expect(newStanding.seasonPoints).toBeUndefined();
      expect(newStanding.seasonWins).toBeUndefined();
      expect(newStanding.driverNumber).toBeUndefined();
      expect(newStanding.countryCode).toBeUndefined();
      expect(newStanding.profileImageUrl).toBeUndefined();
      expect(newStanding.seasonPodiums).toBeUndefined();
    });

    it('should create instance with all properties', () => {
      const fullStanding = new DriverStandingMaterialized();
      fullStanding.seasonYear = 2023;
      fullStanding.driverId = 44;
      fullStanding.driverFullName = 'Lewis Hamilton';
      fullStanding.constructorName = 'Mercedes';
      fullStanding.seasonPoints = 454;
      fullStanding.seasonWins = 19;
      fullStanding.driverNumber = 44;
      fullStanding.countryCode = 'GBR';
      fullStanding.profileImageUrl = 'https://example.com/lewis.jpg';
      fullStanding.seasonPodiums = 17;

      expect(fullStanding.seasonYear).toBe(2023);
      expect(fullStanding.driverId).toBe(44);
      expect(fullStanding.driverFullName).toBe('Lewis Hamilton');
      expect(fullStanding.constructorName).toBe('Mercedes');
      expect(fullStanding.seasonPoints).toBe(454);
      expect(fullStanding.seasonWins).toBe(19);
      expect(fullStanding.driverNumber).toBe(44);
      expect(fullStanding.countryCode).toBe('GBR');
      expect(fullStanding.profileImageUrl).toBe('https://example.com/lewis.jpg');
      expect(fullStanding.seasonPodiums).toBe(17);
    });

    it('should create instance with partial properties', () => {
      const partialStanding = new DriverStandingMaterialized();
      partialStanding.seasonYear = 2023;
      partialStanding.driverId = 44;
      partialStanding.driverFullName = 'Lewis Hamilton';

      expect(partialStanding.seasonYear).toBe(2023);
      expect(partialStanding.driverId).toBe(44);
      expect(partialStanding.driverFullName).toBe('Lewis Hamilton');
      expect(partialStanding.constructorName).toBeUndefined();
      expect(partialStanding.seasonPoints).toBeUndefined();
    });
  });

  describe('Entity Validation', () => {
    it('should handle all required properties', () => {
      standing.seasonYear = 2023;
      standing.driverId = 44;
      standing.driverFullName = 'Lewis Hamilton';
      standing.constructorName = 'Mercedes';
      standing.seasonPoints = 454;
      standing.seasonWins = 19;
      standing.seasonPodiums = 17;

      expect(standing.seasonYear).toBe(2023);
      expect(standing.driverId).toBe(44);
      expect(standing.driverFullName).toBe('Lewis Hamilton');
      expect(standing.constructorName).toBe('Mercedes');
      expect(standing.seasonPoints).toBe(454);
      expect(standing.seasonWins).toBe(19);
      expect(standing.seasonPodiums).toBe(17);
    });

    it('should handle all optional properties as null', () => {
      standing.driverNumber = null;
      standing.countryCode = null;
      standing.profileImageUrl = null;

      expect(standing.driverNumber).toBeNull();
      expect(standing.countryCode).toBeNull();
      expect(standing.profileImageUrl).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values for numeric fields', () => {
      standing.seasonYear = -2023;
      standing.driverId = -44;
      standing.seasonPoints = -454;
      standing.seasonWins = -19;
      standing.driverNumber = -44;
      standing.seasonPodiums = -17;

      expect(standing.seasonYear).toBe(-2023);
      expect(standing.driverId).toBe(-44);
      expect(standing.seasonPoints).toBe(-454);
      expect(standing.seasonWins).toBe(-19);
      expect(standing.driverNumber).toBe(-44);
      expect(standing.seasonPodiums).toBe(-17);
    });

    it('should handle very large numeric values', () => {
      standing.seasonYear = 9999;
      standing.driverId = 999;
      standing.seasonPoints = 9999;
      standing.seasonWins = 999;
      standing.driverNumber = 999;
      standing.seasonPodiums = 999;

      expect(standing.seasonYear).toBe(9999);
      expect(standing.driverId).toBe(999);
      expect(standing.seasonPoints).toBe(9999);
      expect(standing.seasonWins).toBe(999);
      expect(standing.driverNumber).toBe(999);
      expect(standing.seasonPodiums).toBe(999);
    });

    it('should handle zero values for all numeric fields', () => {
      standing.seasonYear = 0;
      standing.driverId = 0;
      standing.seasonPoints = 0;
      standing.seasonWins = 0;
      standing.driverNumber = 0;
      standing.seasonPodiums = 0;

      expect(standing.seasonYear).toBe(0);
      expect(standing.driverId).toBe(0);
      expect(standing.seasonPoints).toBe(0);
      expect(standing.seasonWins).toBe(0);
      expect(standing.driverNumber).toBe(0);
      expect(standing.seasonPodiums).toBe(0);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for all properties', () => {
      standing.seasonYear = 2023;
      standing.driverId = 44;
      standing.driverFullName = 'Lewis Hamilton';
      standing.constructorName = 'Mercedes';
      standing.seasonPoints = 454.5;
      standing.seasonWins = 19;
      standing.driverNumber = 44;
      standing.countryCode = 'GBR';
      standing.profileImageUrl = 'https://example.com/image.jpg';
      standing.seasonPodiums = 17;

      expect(typeof standing.seasonYear).toBe('number');
      expect(typeof standing.driverId).toBe('number');
      expect(typeof standing.driverFullName).toBe('string');
      expect(typeof standing.constructorName).toBe('string');
      expect(typeof standing.seasonPoints).toBe('number');
      expect(typeof standing.seasonWins).toBe('number');
      expect(typeof standing.driverNumber).toBe('number');
      expect(typeof standing.countryCode).toBe('string');
      expect(typeof standing.profileImageUrl).toBe('string');
      expect(typeof standing.seasonPodiums).toBe('number');
    });

    it('should allow reassignment of properties', () => {
      standing.driverFullName = 'Lewis Hamilton';
      expect(standing.driverFullName).toBe('Lewis Hamilton');

      standing.driverFullName = 'Max Verstappen';
      expect(standing.driverFullName).toBe('Max Verstappen');

      standing.constructorName = 'Mercedes';
      expect(standing.constructorName).toBe('Mercedes');

      standing.constructorName = 'Red Bull Racing';
      expect(standing.constructorName).toBe('Red Bull Racing');
    });
  });

  describe('Real-world F1 Scenarios', () => {
    it('should handle 2023 championship winner', () => {
      standing.seasonYear = 2023;
      standing.driverId = 1;
      standing.driverFullName = 'Max Verstappen';
      standing.constructorName = 'Red Bull Racing';
      standing.seasonPoints = 575;
      standing.seasonWins = 19;
      standing.driverNumber = 1;
      standing.countryCode = 'NED';
      standing.profileImageUrl = 'https://f1.com/drivers/max-verstappen.jpg';
      standing.seasonPodiums = 21;

      expect(standing.seasonYear).toBe(2023);
      expect(standing.driverId).toBe(1);
      expect(standing.driverFullName).toBe('Max Verstappen');
      expect(standing.constructorName).toBe('Red Bull Racing');
      expect(standing.seasonPoints).toBe(575);
      expect(standing.seasonWins).toBe(19);
      expect(standing.driverNumber).toBe(1);
      expect(standing.countryCode).toBe('NED');
      expect(standing.profileImageUrl).toBe('https://f1.com/drivers/max-verstappen.jpg');
      expect(standing.seasonPodiums).toBe(21);
    });

    it('should handle 2023 championship runner-up', () => {
      standing.seasonYear = 2023;
      standing.driverId = 11;
      standing.driverFullName = 'Sergio Pérez';
      standing.constructorName = 'Red Bull Racing';
      standing.seasonPoints = 285;
      standing.seasonWins = 2;
      standing.driverNumber = 11;
      standing.countryCode = 'MEX';
      standing.profileImageUrl = 'https://f1.com/drivers/sergio-perez.jpg';
      standing.seasonPodiums = 9;

      expect(standing.seasonYear).toBe(2023);
      expect(standing.driverId).toBe(11);
      expect(standing.driverFullName).toBe('Sergio Pérez');
      expect(standing.constructorName).toBe('Red Bull Racing');
      expect(standing.seasonPoints).toBe(285);
      expect(standing.seasonWins).toBe(2);
      expect(standing.driverNumber).toBe(11);
      expect(standing.countryCode).toBe('MEX');
      expect(standing.profileImageUrl).toBe('https://f1.com/drivers/sergio-perez.jpg');
      expect(standing.seasonPodiums).toBe(9);
    });

    it('should handle driver with no wins', () => {
      standing.seasonYear = 2023;
      standing.driverId = 23;
      standing.driverFullName = 'Alexander Albon';
      standing.constructorName = 'Williams';
      standing.seasonPoints = 27;
      standing.seasonWins = 0;
      standing.driverNumber = 23;
      standing.countryCode = 'THA';
      standing.profileImageUrl = 'https://f1.com/drivers/alexander-albon.jpg';
      standing.seasonPodiums = 0;

      expect(standing.seasonYear).toBe(2023);
      expect(standing.driverId).toBe(23);
      expect(standing.driverFullName).toBe('Alexander Albon');
      expect(standing.constructorName).toBe('Williams');
      expect(standing.seasonPoints).toBe(27);
      expect(standing.seasonWins).toBe(0);
      expect(standing.driverNumber).toBe(23);
      expect(standing.countryCode).toBe('THA');
      expect(standing.profileImageUrl).toBe('https://f1.com/drivers/alexander-albon.jpg');
      expect(standing.seasonPodiums).toBe(0);
    });

    it('should handle driver with missing optional data', () => {
      standing.seasonYear = 2023;
      standing.driverId = 999;
      standing.driverFullName = 'Test Driver';
      standing.constructorName = 'Test Team';
      standing.seasonPoints = 10;
      standing.seasonWins = 0;
      standing.driverNumber = null;
      standing.countryCode = null;
      standing.profileImageUrl = null;
      standing.seasonPodiums = 0;

      expect(standing.seasonYear).toBe(2023);
      expect(standing.driverId).toBe(999);
      expect(standing.driverFullName).toBe('Test Driver');
      expect(standing.constructorName).toBe('Test Team');
      expect(standing.seasonPoints).toBe(10);
      expect(standing.seasonWins).toBe(0);
      expect(standing.driverNumber).toBeNull();
      expect(standing.countryCode).toBeNull();
      expect(standing.profileImageUrl).toBeNull();
      expect(standing.seasonPodiums).toBe(0);
    });

    it('should handle multiple drivers for same season', () => {
      const drivers = [
        { id: 1, name: 'Max Verstappen', points: 575, wins: 19 },
        { id: 11, name: 'Sergio Pérez', points: 285, wins: 2 },
        { id: 16, name: 'Charles Leclerc', points: 206, wins: 0 },
        { id: 55, name: 'Carlos Sainz', points: 200, wins: 1 }
      ];

      drivers.forEach((driver, index) => {
        const driverStanding = new DriverStandingMaterialized();
        driverStanding.seasonYear = 2023;
        driverStanding.driverId = driver.id;
        driverStanding.driverFullName = driver.name;
        driverStanding.seasonPoints = driver.points;
        driverStanding.seasonWins = driver.wins;

        expect(driverStanding.seasonYear).toBe(2023);
        expect(driverStanding.driverId).toBe(driver.id);
        expect(driverStanding.driverFullName).toBe(driver.name);
        expect(driverStanding.seasonPoints).toBe(driver.points);
        expect(driverStanding.seasonWins).toBe(driver.wins);
      });
    });
  });

  describe('Materialized View Specifics', () => {
    it('should represent materialized view data structure', () => {
      standing.seasonYear = 2023;
      standing.driverId = 44;
      standing.driverFullName = 'Lewis Hamilton';
      standing.constructorName = 'Mercedes';
      standing.seasonPoints = 234;
      standing.seasonWins = 0;
      standing.driverNumber = 44;
      standing.countryCode = 'GBR';
      standing.profileImageUrl = 'https://example.com/lewis.jpg';
      standing.seasonPodiums = 6;

      // Verify all materialized view columns are present
      expect(standing.seasonYear).toBeDefined();
      expect(standing.driverId).toBeDefined();
      expect(standing.driverFullName).toBeDefined();
      expect(standing.constructorName).toBeDefined();
      expect(standing.seasonPoints).toBeDefined();
      expect(standing.seasonWins).toBeDefined();
      expect(standing.driverNumber).toBeDefined();
      expect(standing.countryCode).toBeDefined();
      expect(standing.profileImageUrl).toBeDefined();
      expect(standing.seasonPodiums).toBeDefined();
    });

    it('should handle aggregated data from multiple tables', () => {
      // This represents data aggregated from drivers, race_results, constructors tables
      standing.seasonYear = 2023;
      standing.driverId = 1;
      standing.driverFullName = 'Max Verstappen'; // From drivers table
      standing.constructorName = 'Red Bull Racing'; // From constructors table
      standing.seasonPoints = 575; // Aggregated from race_results
      standing.seasonWins = 19; // Aggregated from race_results
      standing.driverNumber = 1; // From drivers table
      standing.countryCode = 'NED'; // From drivers table
      standing.profileImageUrl = 'https://f1.com/max.jpg'; // From drivers table
      standing.seasonPodiums = 21; // Aggregated from race_results

      expect(standing.seasonYear).toBe(2023);
      expect(standing.driverId).toBe(1);
      expect(standing.driverFullName).toBe('Max Verstappen');
      expect(standing.constructorName).toBe('Red Bull Racing');
      expect(standing.seasonPoints).toBe(575);
      expect(standing.seasonWins).toBe(19);
      expect(standing.driverNumber).toBe(1);
      expect(standing.countryCode).toBe('NED');
      expect(standing.profileImageUrl).toBe('https://f1.com/max.jpg');
      expect(standing.seasonPodiums).toBe(21);
    });
  });
});
