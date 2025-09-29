import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getMetadataArgsStorage } from 'typeorm';
import { Lap } from './laps.entity';
import { Race } from '../races/races.entity';
import { Driver } from '../drivers/drivers.entity';

// Mock entities for testing relationships
const mockRace = {
  id: 1,
  name: 'Test Race',
  date: '2023-01-01',
  year: 2023,
  round: 1,
  circuit_id: 1,
  season_id: 1,
} as Race;

const mockDriver = {
  id: 1,
  first_name: 'Lewis',
  last_name: 'Hamilton',
  nationality: 'British',
  date_of_birth: '1985-01-07',
  country_id: 1,
} as Driver;

describe('Lap Entity', () => {
  let lap: Lap;

  beforeEach(() => {
    lap = new Lap();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Entity Definition', () => {
    it('should be defined', () => {
      expect(Lap).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof Lap).toBe('function');
    });

    it('should be instantiable', () => {
      expect(lap).toBeDefined();
      expect(lap).toBeInstanceOf(Lap);
    });

    it('should have correct entity name', () => {
      const metadata = getMetadataArgsStorage().tables.find(table => table.target === Lap);
      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe('laps');
    });
  });

  describe('Primary Key', () => {
    it('should have id property', () => {
      expect(lap).toHaveProperty('id');
    });

    it('should have id as number type', () => {
      lap.id = 1;
      expect(typeof lap.id).toBe('number');
    });

    it('should allow id to be undefined initially', () => {
      expect(lap.id).toBeUndefined();
    });

    it('should accept valid id values', () => {
      const validIds = [1, 100, 999999, Number.MAX_SAFE_INTEGER];
      validIds.forEach(id => {
        lap.id = id;
        expect(lap.id).toBe(id);
      });
    });
  });

  describe('Race ID Column', () => {
    it('should have race_id property', () => {
      expect(lap).toHaveProperty('race_id');
    });

    it('should have race_id as number type', () => {
      lap.race_id = 1;
      expect(typeof lap.race_id).toBe('number');
    });

    it('should allow race_id to be null', () => {
      lap.race_id = null as any;
      expect(lap.race_id).toBeNull();
    });

    it('should allow race_id to be undefined', () => {
      expect(lap.race_id).toBeUndefined();
    });

    it('should accept valid race_id values', () => {
      const validRaceIds = [1, 100, 999999];
      validRaceIds.forEach(raceId => {
        lap.race_id = raceId;
        expect(lap.race_id).toBe(raceId);
      });
    });

    it('should handle negative race_id values', () => {
      lap.race_id = -1;
      expect(lap.race_id).toBe(-1);
    });

    it('should handle zero race_id', () => {
      lap.race_id = 0;
      expect(lap.race_id).toBe(0);
    });
  });

  describe('Driver ID Column', () => {
    it('should have driver_id property', () => {
      expect(lap).toHaveProperty('driver_id');
    });

    it('should have driver_id as number type', () => {
      lap.driver_id = 1;
      expect(typeof lap.driver_id).toBe('number');
    });

    it('should allow driver_id to be null', () => {
      lap.driver_id = null as any;
      expect(lap.driver_id).toBeNull();
    });

    it('should allow driver_id to be undefined', () => {
      expect(lap.driver_id).toBeUndefined();
    });

    it('should accept valid driver_id values', () => {
      const validDriverIds = [1, 100, 999999];
      validDriverIds.forEach(driverId => {
        lap.driver_id = driverId;
        expect(lap.driver_id).toBe(driverId);
      });
    });

    it('should handle negative driver_id values', () => {
      lap.driver_id = -1;
      expect(lap.driver_id).toBe(-1);
    });

    it('should handle zero driver_id', () => {
      lap.driver_id = 0;
      expect(lap.driver_id).toBe(0);
    });
  });

  describe('Lap Number Column', () => {
    it('should have lap_number property', () => {
      expect(lap).toHaveProperty('lap_number');
    });

    it('should have lap_number as number type', () => {
      lap.lap_number = 1;
      expect(typeof lap.lap_number).toBe('number');
    });

    it('should allow lap_number to be null', () => {
      lap.lap_number = null as any;
      expect(lap.lap_number).toBeNull();
    });

    it('should allow lap_number to be undefined', () => {
      expect(lap.lap_number).toBeUndefined();
    });

    it('should accept valid lap_number values', () => {
      const validLapNumbers = [1, 50, 100, 999];
      validLapNumbers.forEach(lapNumber => {
        lap.lap_number = lapNumber;
        expect(lap.lap_number).toBe(lapNumber);
      });
    });

    it('should handle zero lap_number', () => {
      lap.lap_number = 0;
      expect(lap.lap_number).toBe(0);
    });

    it('should handle negative lap_number', () => {
      lap.lap_number = -1;
      expect(lap.lap_number).toBe(-1);
    });
  });

  describe('Position Column', () => {
    it('should have position property', () => {
      expect(lap).toHaveProperty('position');
    });

    it('should have position as number type', () => {
      lap.position = 1;
      expect(typeof lap.position).toBe('number');
    });

    it('should allow position to be null', () => {
      lap.position = null as any;
      expect(lap.position).toBeNull();
    });

    it('should allow position to be undefined', () => {
      expect(lap.position).toBeUndefined();
    });

    it('should accept valid position values', () => {
      const validPositions = [1, 10, 20, 50];
      validPositions.forEach(position => {
        lap.position = position;
        expect(lap.position).toBe(position);
      });
    });

    it('should handle zero position', () => {
      lap.position = 0;
      expect(lap.position).toBe(0);
    });

    it('should handle negative position', () => {
      lap.position = -1;
      expect(lap.position).toBe(-1);
    });
  });

  describe('Time MS Column', () => {
    it('should have time_ms property', () => {
      expect(lap).toHaveProperty('time_ms');
    });

    it('should have time_ms as number type', () => {
      lap.time_ms = 90000;
      expect(typeof lap.time_ms).toBe('number');
    });

    it('should allow time_ms to be null', () => {
      lap.time_ms = null as any;
      expect(lap.time_ms).toBeNull();
    });

    it('should allow time_ms to be undefined', () => {
      expect(lap.time_ms).toBeUndefined();
    });

    it('should accept valid time_ms values', () => {
      const validTimes = [60000, 90000, 120000, 300000];
      validTimes.forEach(time => {
        lap.time_ms = time;
        expect(lap.time_ms).toBe(time);
      });
    });

    it('should handle zero time_ms', () => {
      lap.time_ms = 0;
      expect(lap.time_ms).toBe(0);
    });

    it('should handle negative time_ms', () => {
      lap.time_ms = -1000;
      expect(lap.time_ms).toBe(-1000);
    });
  });

  describe('Sector 1 MS Column', () => {
    it('should have sector_1_ms property', () => {
      expect(lap).toHaveProperty('sector_1_ms');
    });

    it('should have sector_1_ms as number type', () => {
      lap.sector_1_ms = 30000;
      expect(typeof lap.sector_1_ms).toBe('number');
    });

    it('should allow sector_1_ms to be null', () => {
      lap.sector_1_ms = null as any;
      expect(lap.sector_1_ms).toBeNull();
    });

    it('should allow sector_1_ms to be undefined', () => {
      expect(lap.sector_1_ms).toBeUndefined();
    });

    it('should accept valid sector_1_ms values', () => {
      const validSectorTimes = [20000, 30000, 40000, 60000];
      validSectorTimes.forEach(time => {
        lap.sector_1_ms = time;
        expect(lap.sector_1_ms).toBe(time);
      });
    });
  });

  describe('Sector 2 MS Column', () => {
    it('should have sector_2_ms property', () => {
      expect(lap).toHaveProperty('sector_2_ms');
    });

    it('should have sector_2_ms as number type', () => {
      lap.sector_2_ms = 30000;
      expect(typeof lap.sector_2_ms).toBe('number');
    });

    it('should allow sector_2_ms to be null', () => {
      lap.sector_2_ms = null as any;
      expect(lap.sector_2_ms).toBeNull();
    });

    it('should allow sector_2_ms to be undefined', () => {
      expect(lap.sector_2_ms).toBeUndefined();
    });

    it('should accept valid sector_2_ms values', () => {
      const validSectorTimes = [20000, 30000, 40000, 60000];
      validSectorTimes.forEach(time => {
        lap.sector_2_ms = time;
        expect(lap.sector_2_ms).toBe(time);
      });
    });
  });

  describe('Sector 3 MS Column', () => {
    it('should have sector_3_ms property', () => {
      expect(lap).toHaveProperty('sector_3_ms');
    });

    it('should have sector_3_ms as number type', () => {
      lap.sector_3_ms = 30000;
      expect(typeof lap.sector_3_ms).toBe('number');
    });

    it('should allow sector_3_ms to be null', () => {
      lap.sector_3_ms = null as any;
      expect(lap.sector_3_ms).toBeNull();
    });

    it('should allow sector_3_ms to be undefined', () => {
      expect(lap.sector_3_ms).toBeUndefined();
    });

    it('should accept valid sector_3_ms values', () => {
      const validSectorTimes = [20000, 30000, 40000, 60000];
      validSectorTimes.forEach(time => {
        lap.sector_3_ms = time;
        expect(lap.sector_3_ms).toBe(time);
      });
    });
  });

  describe('Is Pit Out Lap Column', () => {
    it('should have is_pit_out_lap property', () => {
      expect(lap).toHaveProperty('is_pit_out_lap');
    });

    it('should have is_pit_out_lap as boolean type', () => {
      lap.is_pit_out_lap = true;
      expect(typeof lap.is_pit_out_lap).toBe('boolean');
    });

    it('should allow is_pit_out_lap to be null', () => {
      lap.is_pit_out_lap = null as any;
      expect(lap.is_pit_out_lap).toBeNull();
    });

    it('should allow is_pit_out_lap to be undefined', () => {
      expect(lap.is_pit_out_lap).toBeUndefined();
    });

    it('should accept true value', () => {
      lap.is_pit_out_lap = true;
      expect(lap.is_pit_out_lap).toBe(true);
    });

    it('should accept false value', () => {
      lap.is_pit_out_lap = false;
      expect(lap.is_pit_out_lap).toBe(false);
    });
  });

  describe('Race Relationship', () => {
    it('should have race property', () => {
      expect(lap).toHaveProperty('race');
    });

    it('should allow race to be undefined initially', () => {
      expect(lap.race).toBeUndefined();
    });

    it('should accept Race entity', () => {
      lap.race = mockRace;
      expect(lap.race).toBe(mockRace);
      expect(lap.race).toBeInstanceOf(Object);
    });

    it('should allow race to be null', () => {
      lap.race = null as any;
      expect(lap.race).toBeNull();
    });

    it('should maintain race reference', () => {
      lap.race = mockRace;
      expect(lap.race.id).toBe(1);
      expect(lap.race.name).toBe('Test Race');
    });
  });

  describe('Driver Relationship', () => {
    it('should have driver property', () => {
      expect(lap).toHaveProperty('driver');
    });

    it('should allow driver to be undefined initially', () => {
      expect(lap.driver).toBeUndefined();
    });

    it('should accept Driver entity', () => {
      lap.driver = mockDriver;
      expect(lap.driver).toBe(mockDriver);
      expect(lap.driver).toBeInstanceOf(Object);
    });

    it('should allow driver to be null', () => {
      lap.driver = null as any;
      expect(lap.driver).toBeNull();
    });

    it('should maintain driver reference', () => {
      lap.driver = mockDriver;
      expect(lap.driver.id).toBe(1);
      expect(lap.driver.first_name).toBe('Lewis');
      expect(lap.driver.last_name).toBe('Hamilton');
    });
  });

  describe('Entity Properties', () => {
    it('should have all required properties', () => {
      const requiredProperties = [
        'id',
        'race_id',
        'driver_id',
        'lap_number',
        'position',
        'time_ms',
        'sector_1_ms',
        'sector_2_ms',
        'sector_3_ms',
        'is_pit_out_lap',
        'race',
        'driver'
      ];

      requiredProperties.forEach(prop => {
        expect(lap).toHaveProperty(prop);
      });
    });

    it('should have correct property types', () => {
      lap.id = 1;
      lap.race_id = 1;
      lap.driver_id = 1;
      lap.lap_number = 1;
      lap.position = 1;
      lap.time_ms = 90000;
      lap.sector_1_ms = 30000;
      lap.sector_2_ms = 30000;
      lap.sector_3_ms = 30000;
      lap.is_pit_out_lap = false;
      lap.race = mockRace;
      lap.driver = mockDriver;

      expect(typeof lap.id).toBe('number');
      expect(typeof lap.race_id).toBe('number');
      expect(typeof lap.driver_id).toBe('number');
      expect(typeof lap.lap_number).toBe('number');
      expect(typeof lap.position).toBe('number');
      expect(typeof lap.time_ms).toBe('number');
      expect(typeof lap.sector_1_ms).toBe('number');
      expect(typeof lap.sector_2_ms).toBe('number');
      expect(typeof lap.sector_3_ms).toBe('number');
      expect(typeof lap.is_pit_out_lap).toBe('boolean');
      expect(typeof lap.race).toBe('object');
      expect(typeof lap.driver).toBe('object');
    });
  });

  describe('Entity Instantiation', () => {
    it('should create instance with default values', () => {
      const newLap = new Lap();
      expect(newLap).toBeDefined();
      expect(newLap).toBeInstanceOf(Lap);
    });

    it('should allow property assignment', () => {
      lap.id = 1;
      lap.race_id = 1;
      lap.driver_id = 1;
      lap.lap_number = 1;
      lap.position = 1;
      lap.time_ms = 90000;
      lap.sector_1_ms = 30000;
      lap.sector_2_ms = 30000;
      lap.sector_3_ms = 30000;
      lap.is_pit_out_lap = false;

      expect(lap.id).toBe(1);
      expect(lap.race_id).toBe(1);
      expect(lap.driver_id).toBe(1);
      expect(lap.lap_number).toBe(1);
      expect(lap.position).toBe(1);
      expect(lap.time_ms).toBe(90000);
      expect(lap.sector_1_ms).toBe(30000);
      expect(lap.sector_2_ms).toBe(30000);
      expect(lap.sector_3_ms).toBe(30000);
      expect(lap.is_pit_out_lap).toBe(false);
    });

    it('should allow partial property assignment', () => {
      lap.id = 1;
      lap.race_id = 1;
      lap.lap_number = 1;

      expect(lap.id).toBe(1);
      expect(lap.race_id).toBe(1);
      expect(lap.lap_number).toBe(1);
      expect(lap.driver_id).toBeUndefined();
      expect(lap.position).toBeUndefined();
      expect(lap.time_ms).toBeUndefined();
    });
  });

  describe('Entity Validation', () => {
    it('should handle complete lap data', () => {
      lap.id = 1;
      lap.race_id = 1;
      lap.driver_id = 1;
      lap.lap_number = 1;
      lap.position = 1;
      lap.time_ms = 90000;
      lap.sector_1_ms = 30000;
      lap.sector_2_ms = 30000;
      lap.sector_3_ms = 30000;
      lap.is_pit_out_lap = false;
      lap.race = mockRace;
      lap.driver = mockDriver;

      expect(lap.id).toBe(1);
      expect(lap.race_id).toBe(1);
      expect(lap.driver_id).toBe(1);
      expect(lap.lap_number).toBe(1);
      expect(lap.position).toBe(1);
      expect(lap.time_ms).toBe(90000);
      expect(lap.sector_1_ms).toBe(30000);
      expect(lap.sector_2_ms).toBe(30000);
      expect(lap.sector_3_ms).toBe(30000);
      expect(lap.is_pit_out_lap).toBe(false);
      expect(lap.race).toBe(mockRace);
      expect(lap.driver).toBe(mockDriver);
    });

    it('should handle null values for nullable fields', () => {
      lap.id = 1;
      lap.race_id = null as any;
      lap.driver_id = null as any;
      lap.lap_number = null as any;
      lap.position = null as any;
      lap.time_ms = null as any;
      lap.sector_1_ms = null as any;
      lap.sector_2_ms = null as any;
      lap.sector_3_ms = null as any;
      lap.is_pit_out_lap = null as any;

      expect(lap.id).toBe(1);
      expect(lap.race_id).toBeNull();
      expect(lap.driver_id).toBeNull();
      expect(lap.lap_number).toBeNull();
      expect(lap.position).toBeNull();
      expect(lap.time_ms).toBeNull();
      expect(lap.sector_1_ms).toBeNull();
      expect(lap.sector_2_ms).toBeNull();
      expect(lap.sector_3_ms).toBeNull();
      expect(lap.is_pit_out_lap).toBeNull();
    });

    it('should handle mixed null and valid values', () => {
      lap.id = 1;
      lap.race_id = 1;
      lap.driver_id = null as any;
      lap.lap_number = 1;
      lap.position = null as any;
      lap.time_ms = 90000;
      lap.sector_1_ms = null as any;
      lap.sector_2_ms = 30000;
      lap.sector_3_ms = null as any;
      lap.is_pit_out_lap = false;

      expect(lap.id).toBe(1);
      expect(lap.race_id).toBe(1);
      expect(lap.driver_id).toBeNull();
      expect(lap.lap_number).toBe(1);
      expect(lap.position).toBeNull();
      expect(lap.time_ms).toBe(90000);
      expect(lap.sector_1_ms).toBeNull();
      expect(lap.sector_2_ms).toBe(30000);
      expect(lap.sector_3_ms).toBeNull();
      expect(lap.is_pit_out_lap).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      lap.id = Number.MAX_SAFE_INTEGER;
      lap.race_id = Number.MAX_SAFE_INTEGER;
      lap.driver_id = Number.MAX_SAFE_INTEGER;
      lap.lap_number = Number.MAX_SAFE_INTEGER;
      lap.position = Number.MAX_SAFE_INTEGER;
      lap.time_ms = Number.MAX_SAFE_INTEGER;
      lap.sector_1_ms = Number.MAX_SAFE_INTEGER;
      lap.sector_2_ms = Number.MAX_SAFE_INTEGER;
      lap.sector_3_ms = Number.MAX_SAFE_INTEGER;

      expect(lap.id).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.race_id).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.driver_id).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.lap_number).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.position).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.time_ms).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.sector_1_ms).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.sector_2_ms).toBe(Number.MAX_SAFE_INTEGER);
      expect(lap.sector_3_ms).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very small numbers', () => {
      lap.id = Number.MIN_SAFE_INTEGER;
      lap.race_id = Number.MIN_SAFE_INTEGER;
      lap.driver_id = Number.MIN_SAFE_INTEGER;
      lap.lap_number = Number.MIN_SAFE_INTEGER;
      lap.position = Number.MIN_SAFE_INTEGER;
      lap.time_ms = Number.MIN_SAFE_INTEGER;
      lap.sector_1_ms = Number.MIN_SAFE_INTEGER;
      lap.sector_2_ms = Number.MIN_SAFE_INTEGER;
      lap.sector_3_ms = Number.MIN_SAFE_INTEGER;

      expect(lap.id).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.race_id).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.driver_id).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.lap_number).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.position).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.time_ms).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.sector_1_ms).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.sector_2_ms).toBe(Number.MIN_SAFE_INTEGER);
      expect(lap.sector_3_ms).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should handle zero values', () => {
      lap.id = 0;
      lap.race_id = 0;
      lap.driver_id = 0;
      lap.lap_number = 0;
      lap.position = 0;
      lap.time_ms = 0;
      lap.sector_1_ms = 0;
      lap.sector_2_ms = 0;
      lap.sector_3_ms = 0;

      expect(lap.id).toBe(0);
      expect(lap.race_id).toBe(0);
      expect(lap.driver_id).toBe(0);
      expect(lap.lap_number).toBe(0);
      expect(lap.position).toBe(0);
      expect(lap.time_ms).toBe(0);
      expect(lap.sector_1_ms).toBe(0);
      expect(lap.sector_2_ms).toBe(0);
      expect(lap.sector_3_ms).toBe(0);
    });

    it('should handle negative values', () => {
      lap.id = -1;
      lap.race_id = -1;
      lap.driver_id = -1;
      lap.lap_number = -1;
      lap.position = -1;
      lap.time_ms = -1000;
      lap.sector_1_ms = -100;
      lap.sector_2_ms = -200;
      lap.sector_3_ms = -300;

      expect(lap.id).toBe(-1);
      expect(lap.race_id).toBe(-1);
      expect(lap.driver_id).toBe(-1);
      expect(lap.lap_number).toBe(-1);
      expect(lap.position).toBe(-1);
      expect(lap.time_ms).toBe(-1000);
      expect(lap.sector_1_ms).toBe(-100);
      expect(lap.sector_2_ms).toBe(-200);
      expect(lap.sector_3_ms).toBe(-300);
    });
  });

  describe('TypeORM Decorators', () => {
    it('should have Entity decorator', () => {
      const metadata = getMetadataArgsStorage().tables.find(table => table.target === Lap);
      expect(metadata).toBeDefined();
      expect(metadata?.type).toBe('regular');
    });

    it('should have correct table name', () => {
      const metadata = getMetadataArgsStorage().tables.find(table => table.target === Lap);
      expect(metadata?.name).toBe('laps');
    });

    it('should have PrimaryGeneratedColumn on id', () => {
      const metadata = getMetadataArgsStorage().columns.find(column => 
        column.target === Lap && column.propertyName === 'id'
      );
      expect(metadata).toBeDefined();
      expect(metadata?.mode).toBe('regular');
      expect(metadata?.options?.primary).toBe(true);
    });

    it('should have Column decorators on all properties', () => {
      const columnProperties = [
        'race_id', 'driver_id', 'lap_number', 'position', 
        'time_ms', 'sector_1_ms', 'sector_2_ms', 'sector_3_ms', 'is_pit_out_lap'
      ];

      columnProperties.forEach(prop => {
        const metadata = getMetadataArgsStorage().columns.find(column => 
          column.target === Lap && column.propertyName === prop
        );
        expect(metadata).toBeDefined();
        expect(metadata?.mode).toBe('regular');
      });
    });

    it('should have ManyToOne relationships', () => {
      const raceRelation = getMetadataArgsStorage().relations.find(relation => 
        relation.target === Lap && relation.propertyName === 'race'
      );
      const driverRelation = getMetadataArgsStorage().relations.find(relation => 
        relation.target === Lap && relation.propertyName === 'driver'
      );

      expect(raceRelation).toBeDefined();
      expect(raceRelation?.relationType).toBe('many-to-one');
      expect(driverRelation).toBeDefined();
      expect(driverRelation?.relationType).toBe('many-to-one');
    });

    it('should have JoinColumn decorators', () => {
      const raceJoinColumn = getMetadataArgsStorage().joinColumns.find(joinColumn => 
        joinColumn.target === Lap && joinColumn.propertyName === 'race'
      );
      const driverJoinColumn = getMetadataArgsStorage().joinColumns.find(joinColumn => 
        joinColumn.target === Lap && joinColumn.propertyName === 'driver'
      );

      expect(raceJoinColumn).toBeDefined();
      expect(raceJoinColumn?.name).toBe('race_id');
      expect(driverJoinColumn).toBeDefined();
      expect(driverJoinColumn?.name).toBe('driver_id');
    });
  });

  describe('Entity Completeness', () => {
    it('should have all required properties for a complete lap', () => {
      const completeLap = new Lap();
      completeLap.id = 1;
      completeLap.race_id = 1;
      completeLap.driver_id = 1;
      completeLap.lap_number = 1;
      completeLap.position = 1;
      completeLap.time_ms = 90000;
      completeLap.sector_1_ms = 30000;
      completeLap.sector_2_ms = 30000;
      completeLap.sector_3_ms = 30000;
      completeLap.is_pit_out_lap = false;
      completeLap.race = mockRace;
      completeLap.driver = mockDriver;

      expect(completeLap).toBeDefined();
      expect(completeLap.id).toBe(1);
      expect(completeLap.race_id).toBe(1);
      expect(completeLap.driver_id).toBe(1);
      expect(completeLap.lap_number).toBe(1);
      expect(completeLap.position).toBe(1);
      expect(completeLap.time_ms).toBe(90000);
      expect(completeLap.sector_1_ms).toBe(30000);
      expect(completeLap.sector_2_ms).toBe(30000);
      expect(completeLap.sector_3_ms).toBe(30000);
      expect(completeLap.is_pit_out_lap).toBe(false);
      expect(completeLap.race).toBe(mockRace);
      expect(completeLap.driver).toBe(mockDriver);
    });

    it('should support partial lap data', () => {
      const partialLap = new Lap();
      partialLap.id = 1;
      partialLap.race_id = 1;
      partialLap.lap_number = 1;

      expect(partialLap).toBeDefined();
      expect(partialLap.id).toBe(1);
      expect(partialLap.race_id).toBe(1);
      expect(partialLap.lap_number).toBe(1);
      expect(partialLap.driver_id).toBeUndefined();
      expect(partialLap.position).toBeUndefined();
      expect(partialLap.time_ms).toBeUndefined();
    });

    it('should support empty lap data', () => {
      const emptyLap = new Lap();

      expect(emptyLap).toBeDefined();
      expect(emptyLap.id).toBeUndefined();
      expect(emptyLap.race_id).toBeUndefined();
      expect(emptyLap.driver_id).toBeUndefined();
      expect(emptyLap.lap_number).toBeUndefined();
      expect(emptyLap.position).toBeUndefined();
      expect(emptyLap.time_ms).toBeUndefined();
      expect(emptyLap.sector_1_ms).toBeUndefined();
      expect(emptyLap.sector_2_ms).toBeUndefined();
      expect(emptyLap.sector_3_ms).toBeUndefined();
      expect(emptyLap.is_pit_out_lap).toBeUndefined();
      expect(emptyLap.race).toBeUndefined();
      expect(emptyLap.driver).toBeUndefined();
    });
  });

  describe('Entity Relationships', () => {
    it('should maintain race relationship integrity', () => {
      lap.race = mockRace;
      expect(lap.race).toBe(mockRace);
      expect(lap.race.id).toBe(1);
      expect(lap.race.name).toBe('Test Race');
    });

    it('should maintain driver relationship integrity', () => {
      lap.driver = mockDriver;
      expect(lap.driver).toBe(mockDriver);
      expect(lap.driver.id).toBe(1);
      expect(lap.driver.first_name).toBe('Lewis');
      expect(lap.driver.last_name).toBe('Hamilton');
    });

    it('should allow both relationships to be set', () => {
      lap.race = mockRace;
      lap.driver = mockDriver;

      expect(lap.race).toBe(mockRace);
      expect(lap.driver).toBe(mockDriver);
      expect(lap.race.id).toBe(1);
      expect(lap.driver.id).toBe(1);
    });

    it('should allow relationships to be cleared', () => {
      lap.race = mockRace;
      lap.driver = mockDriver;

      lap.race = null as any;
      lap.driver = null as any;

      expect(lap.race).toBeNull();
      expect(lap.driver).toBeNull();
    });
  });
});
