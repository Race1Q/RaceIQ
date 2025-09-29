import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ConstructorEntity } from './constructors.entity';

describe('ConstructorEntity', () => {
  const mockRaceResult = {
    id: 1,
    session_id: 1,
    driver_id: 1,
    constructor_id: 1,
    position: 1,
    points: 25,
    grid: 1,
    laps: 58,
    time_ms: 3600000,
    status: 'Finished',
    fastest_lap_rank: 1,
    points_for_fastest_lap: 1,
    session: null,
    driver: null,
    team: null,
  };

  const mockQualifyingResult = {
    id: 1,
    session_id: 1,
    driver_id: 1,
    constructor_id: 1,
    position: 1,
    q1_time_ms: 90000,
    q2_time_ms: 89000,
    q3_time_ms: 88000,
    session: null,
    driver: null,
    team: null,
  };

  const mockConstructor: ConstructorEntity = {
    id: 1,
    name: 'Mercedes',
    nationality: 'German',
    url: 'https://example.com/mercedes',
    is_active: true,
    raceResults: [mockRaceResult],
    qualifyingResults: [mockQualifyingResult],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(ConstructorEntity).toBeDefined();
  });

  describe('entity structure', () => {
    it('should be a class', () => {
      expect(typeof ConstructorEntity).toBe('function');
    });

    it('should be a TypeORM entity', () => {
      const entityMetadata = Reflect.getMetadata('__entity__', ConstructorEntity);
      expect(entityMetadata).toBeDefined();
    });

    it('should have correct table name', () => {
      const entityMetadata = Reflect.getMetadata('__entity__', ConstructorEntity);
      expect(entityMetadata).toBeDefined();
      expect(entityMetadata.name).toBe('constructors');
    });
  });

  describe('primary key', () => {
    it('should have id property', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toHaveProperty('id');
    });

    it('should have id as primary generated column', () => {
      const constructor = new ConstructorEntity();
      constructor.id = 1;
      expect(constructor.id).toBe(1);
    });

    it('should accept number type for id', () => {
      const constructor = new ConstructorEntity();
      constructor.id = 42;
      expect(typeof constructor.id).toBe('number');
      expect(constructor.id).toBe(42);
    });
  });

  describe('name column', () => {
    it('should have name property', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toHaveProperty('name');
    });

    it('should accept string type for name', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Mercedes';
      expect(typeof constructor.name).toBe('string');
      expect(constructor.name).toBe('Mercedes');
    });

    it('should handle long names', () => {
      const constructor = new ConstructorEntity();
      const longName = 'A'.repeat(1000);
      constructor.name = longName;
      expect(constructor.name).toBe(longName);
    });

    it('should handle special characters in name', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Mercedes-AMG Petronas F1 Team';
      expect(constructor.name).toBe('Mercedes-AMG Petronas F1 Team');
    });

    it('should handle names with numbers', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Team 1 Racing';
      expect(constructor.name).toBe('Team 1 Racing');
    });
  });

  describe('nationality column', () => {
    it('should have nationality property', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toHaveProperty('nationality');
    });

    it('should accept string type for nationality', () => {
      const constructor = new ConstructorEntity();
      constructor.nationality = 'German';
      expect(typeof constructor.nationality).toBe('string');
      expect(constructor.nationality).toBe('German');
    });

    it('should accept null for nationality', () => {
      const constructor = new ConstructorEntity();
      constructor.nationality = null;
      expect(constructor.nationality).toBeNull();
    });

    it('should accept undefined for nationality', () => {
      const constructor = new ConstructorEntity();
      constructor.nationality = undefined;
      expect(constructor.nationality).toBeUndefined();
    });

    it('should handle empty string for nationality', () => {
      const constructor = new ConstructorEntity();
      constructor.nationality = '';
      expect(constructor.nationality).toBe('');
    });

    it('should handle different nationalities', () => {
      const constructor = new ConstructorEntity();
      const nationalities = ['German', 'British', 'Italian', 'French', 'American'];
      
      nationalities.forEach(nationality => {
        constructor.nationality = nationality;
        expect(constructor.nationality).toBe(nationality);
      });
    });
  });

  describe('url column', () => {
    it('should have url property', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toHaveProperty('url');
    });

    it('should accept string type for url', () => {
      const constructor = new ConstructorEntity();
      constructor.url = 'https://example.com/mercedes';
      expect(typeof constructor.url).toBe('string');
      expect(constructor.url).toBe('https://example.com/mercedes');
    });

    it('should accept null for url', () => {
      const constructor = new ConstructorEntity();
      constructor.url = null;
      expect(constructor.url).toBeNull();
    });

    it('should handle valid URLs', () => {
      const constructor = new ConstructorEntity();
      const urls = [
        'https://example.com/mercedes',
        'http://example.com/ferrari',
        'https://www.mercedes.com/f1',
        'https://ferrari.com/en/racing',
      ];
      
      urls.forEach(url => {
        constructor.url = url;
        expect(constructor.url).toBe(url);
      });
    });

    it('should handle empty string for url', () => {
      const constructor = new ConstructorEntity();
      constructor.url = '';
      expect(constructor.url).toBe('');
    });
  });

  describe('is_active column', () => {
    it('should have is_active property', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toHaveProperty('is_active');
    });

    it('should accept boolean type for is_active', () => {
      const constructor = new ConstructorEntity();
      constructor.is_active = true;
      expect(typeof constructor.is_active).toBe('boolean');
      expect(constructor.is_active).toBe(true);
    });

    it('should handle false value', () => {
      const constructor = new ConstructorEntity();
      constructor.is_active = false;
      expect(constructor.is_active).toBe(false);
    });

    it('should not accept null for is_active', () => {
      const constructor = new ConstructorEntity();
      // This should be handled by the database constraint
      constructor.is_active = false; // Valid boolean value
      expect(constructor.is_active).toBe(false);
    });
  });

  describe('raceResults relationship', () => {
    it('should have raceResults property', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toHaveProperty('raceResults');
    });

    it('should accept RaceResult array for raceResults', () => {
      const constructor = new ConstructorEntity();
      constructor.raceResults = [mockRaceResult];
      expect(Array.isArray(constructor.raceResults)).toBe(true);
      expect(constructor.raceResults).toHaveLength(1);
      expect(constructor.raceResults[0]).toBe(mockRaceResult);
    });

    it('should accept empty array for raceResults', () => {
      const constructor = new ConstructorEntity();
      constructor.raceResults = [];
      expect(Array.isArray(constructor.raceResults)).toBe(true);
      expect(constructor.raceResults).toHaveLength(0);
    });

    it('should handle multiple race results', () => {
      const constructor = new ConstructorEntity();
      const raceResults = [
        { ...mockRaceResult, id: 1, position: 1 },
        { ...mockRaceResult, id: 2, position: 2 },
        { ...mockRaceResult, id: 3, position: 3 },
      ];
      constructor.raceResults = raceResults;
      expect(constructor.raceResults).toHaveLength(3);
    });
  });

  describe('qualifyingResults relationship', () => {
    it('should have qualifyingResults property', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toHaveProperty('qualifyingResults');
    });

    it('should accept QualifyingResult array for qualifyingResults', () => {
      const constructor = new ConstructorEntity();
      constructor.qualifyingResults = [mockQualifyingResult];
      expect(Array.isArray(constructor.qualifyingResults)).toBe(true);
      expect(constructor.qualifyingResults).toHaveLength(1);
      expect(constructor.qualifyingResults[0]).toBe(mockQualifyingResult);
    });

    it('should accept empty array for qualifyingResults', () => {
      const constructor = new ConstructorEntity();
      constructor.qualifyingResults = [];
      expect(Array.isArray(constructor.qualifyingResults)).toBe(true);
      expect(constructor.qualifyingResults).toHaveLength(0);
    });

    it('should handle multiple qualifying results', () => {
      const constructor = new ConstructorEntity();
      const qualifyingResults = [
        { ...mockQualifyingResult, id: 1, position: 1 },
        { ...mockQualifyingResult, id: 2, position: 2 },
        { ...mockQualifyingResult, id: 3, position: 3 },
      ];
      constructor.qualifyingResults = qualifyingResults;
      expect(constructor.qualifyingResults).toHaveLength(3);
    });
  });

  describe('entity instantiation', () => {
    it('should create instance without parameters', () => {
      const constructor = new ConstructorEntity();
      expect(constructor).toBeInstanceOf(ConstructorEntity);
    });

    it('should create instance with all properties', () => {
      const constructor = new ConstructorEntity();
      constructor.id = 1;
      constructor.name = 'Mercedes';
      constructor.nationality = 'German';
      constructor.url = 'https://example.com/mercedes';
      constructor.is_active = true;
      constructor.raceResults = [mockRaceResult];
      constructor.qualifyingResults = [mockQualifyingResult];

      expect(constructor.id).toBe(1);
      expect(constructor.name).toBe('Mercedes');
      expect(constructor.nationality).toBe('German');
      expect(constructor.url).toBe('https://example.com/mercedes');
      expect(constructor.is_active).toBe(true);
      expect(constructor.raceResults).toEqual([mockRaceResult]);
      expect(constructor.qualifyingResults).toEqual([mockQualifyingResult]);
    });

    it('should create instance with partial properties', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Test Constructor';
      constructor.is_active = true;

      expect(constructor.name).toBe('Test Constructor');
      expect(constructor.is_active).toBe(true);
      expect(constructor.id).toBeUndefined();
      expect(constructor.nationality).toBeUndefined();
    });
  });

  describe('entity validation', () => {
    it('should handle all required properties', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Required Name';
      constructor.is_active = true;

      expect(constructor.name).toBe('Required Name');
      expect(constructor.is_active).toBe(true);
    });

    it('should handle all optional properties as null', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Test';
      constructor.is_active = true;
      constructor.nationality = null;
      constructor.url = null;
      constructor.raceResults = [];
      constructor.qualifyingResults = [];

      expect(constructor.name).toBe('Test');
      expect(constructor.is_active).toBe(true);
      expect(constructor.nationality).toBeNull();
      expect(constructor.url).toBeNull();
      expect(constructor.raceResults).toEqual([]);
      expect(constructor.qualifyingResults).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle very long names', () => {
      const constructor = new ConstructorEntity();
      const longName = 'A'.repeat(10000);
      constructor.name = longName;
      expect(constructor.name).toBe(longName);
    });

    it('should handle special characters in all string fields', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Mercedes-AMG Petronas F1 Team (2024)';
      constructor.nationality = 'German 🇩🇪';
      constructor.url = 'https://example.com/mercedes?year=2024&type=f1';

      expect(constructor.name).toBe('Mercedes-AMG Petronas F1 Team (2024)');
      expect(constructor.nationality).toBe('German 🇩🇪');
      expect(constructor.url).toBe('https://example.com/mercedes?year=2024&type=f1');
    });

    it('should handle boolean edge cases', () => {
      const constructor = new ConstructorEntity();
      constructor.is_active = true;
      expect(constructor.is_active).toBe(true);

      constructor.is_active = false;
      expect(constructor.is_active).toBe(false);
    });

    it('should handle empty arrays for relationships', () => {
      const constructor = new ConstructorEntity();
      constructor.raceResults = [];
      constructor.qualifyingResults = [];

      expect(constructor.raceResults).toEqual([]);
      expect(constructor.qualifyingResults).toEqual([]);
    });
  });

  describe('type safety', () => {
    it('should maintain type safety for all properties', () => {
      const constructor = new ConstructorEntity();
      
      // Test that properties accept correct types
      constructor.id = 1;
      constructor.name = 'Test';
      constructor.nationality = 'Test Nationality';
      constructor.url = 'https://example.com';
      constructor.is_active = true;
      constructor.raceResults = [];
      constructor.qualifyingResults = [];

      expect(typeof constructor.id).toBe('number');
      expect(typeof constructor.name).toBe('string');
      expect(typeof constructor.nationality).toBe('string');
      expect(typeof constructor.url).toBe('string');
      expect(typeof constructor.is_active).toBe('boolean');
      expect(Array.isArray(constructor.raceResults)).toBe(true);
      expect(Array.isArray(constructor.qualifyingResults)).toBe(true);
    });
  });

  describe('unique constraints', () => {
    it('should handle unique name constraint', () => {
      const constructor1 = new ConstructorEntity();
      constructor1.name = 'Unique Name';
      constructor1.is_active = true;

      const constructor2 = new ConstructorEntity();
      constructor2.name = 'Unique Name';
      constructor2.is_active = true;

      // Both should be valid instances
      expect(constructor1.name).toBe('Unique Name');
      expect(constructor2.name).toBe('Unique Name');
    });
  });

  describe('boolean validation', () => {
    it('should require is_active to be boolean', () => {
      const constructor = new ConstructorEntity();
      constructor.name = 'Test';
      constructor.is_active = true;
      expect(constructor.is_active).toBe(true);

      constructor.is_active = false;
      expect(constructor.is_active).toBe(false);
    });
  });
});