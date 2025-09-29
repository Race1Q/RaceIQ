import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circuit } from './circuits.entity';
import { Country } from '../countries/countries.entity';

describe('Circuit Entity', () => {
  let module: TestingModule;
  let circuitRepository: Repository<Circuit>;
  let countryRepository: Repository<Country>;

  const mockCountry: Country = {
    country_code: 'MCO',
    country_name: 'Monaco',
    drivers: [],
  };

  const mockCircuit: Circuit = {
    id: 1,
    name: 'Monaco',
    location: 'Monte Carlo',
    country_code: 'MCO',
    map_url: 'https://example.com/monaco-map',
    length_km: 3.337,
    race_distance_km: 260.286,
    track_layout: {
      type: 'FeatureCollection',
      features: [],
    },
    country: mockCountry,
  };

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Circuit, Country],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Circuit, Country]),
      ],
    });

    module = await moduleBuilder.compile();

    circuitRepository = module.get<Repository<Circuit>>(getRepositoryToken(Circuit));
    countryRepository = module.get<Repository<Country>>(getRepositoryToken(Country));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(Circuit).toBeDefined();
  });

  describe('entity structure', () => {
    it('should be a class', () => {
      expect(typeof Circuit).toBe('function');
    });

    it('should be a TypeORM entity', () => {
      const entityMetadata = Reflect.getMetadata('__entity__', Circuit);
      expect(entityMetadata).toBeDefined();
    });

    it('should have correct table name', () => {
      const entityMetadata = Reflect.getMetadata('__entity__', Circuit);
      expect(entityMetadata).toBeDefined();
      expect(entityMetadata.name).toBe('circuits');
    });
  });

  describe('primary key', () => {
    it('should have id property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('id');
    });

    it('should have id as primary generated column', () => {
      const circuit = new Circuit();
      circuit.id = 1;
      expect(circuit.id).toBe(1);
    });

    it('should accept number type for id', () => {
      const circuit = new Circuit();
      circuit.id = 42;
      expect(typeof circuit.id).toBe('number');
      expect(circuit.id).toBe(42);
    });
  });

  describe('name column', () => {
    it('should have name property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('name');
    });

    it('should accept string type for name', () => {
      const circuit = new Circuit();
      circuit.name = 'Monaco';
      expect(typeof circuit.name).toBe('string');
      expect(circuit.name).toBe('Monaco');
    });

    it('should handle long names', () => {
      const circuit = new Circuit();
      const longName = 'A'.repeat(1000);
      circuit.name = longName;
      expect(circuit.name).toBe(longName);
    });

    it('should handle special characters in name', () => {
      const circuit = new Circuit();
      circuit.name = 'Circuit de Monaco (Monte Carlo)';
      expect(circuit.name).toBe('Circuit de Monaco (Monte Carlo)');
    });
  });

  describe('location column', () => {
    it('should have location property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('location');
    });

    it('should accept string type for location', () => {
      const circuit = new Circuit();
      circuit.location = 'Monte Carlo';
      expect(typeof circuit.location).toBe('string');
      expect(circuit.location).toBe('Monte Carlo');
    });

    it('should accept null for location', () => {
      const circuit = new Circuit();
      circuit.location = null;
      expect(circuit.location).toBeNull();
    });

    it('should accept undefined for location', () => {
      const circuit = new Circuit();
      circuit.location = undefined;
      expect(circuit.location).toBeUndefined();
    });

    it('should handle empty string for location', () => {
      const circuit = new Circuit();
      circuit.location = '';
      expect(circuit.location).toBe('');
    });
  });

  describe('country_code column', () => {
    it('should have country_code property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('country_code');
    });

    it('should accept string type for country_code', () => {
      const circuit = new Circuit();
      circuit.country_code = 'MCO';
      expect(typeof circuit.country_code).toBe('string');
      expect(circuit.country_code).toBe('MCO');
    });

    it('should accept null for country_code', () => {
      const circuit = new Circuit();
      circuit.country_code = null;
      expect(circuit.country_code).toBeNull();
    });

    it('should handle different country codes', () => {
      const circuit = new Circuit();
      const countryCodes = ['MCO', 'GBR', 'USA', 'DEU', 'FRA'];
      
      countryCodes.forEach(code => {
        circuit.country_code = code;
        expect(circuit.country_code).toBe(code);
      });
    });
  });

  describe('map_url column', () => {
    it('should have map_url property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('map_url');
    });

    it('should accept string type for map_url', () => {
      const circuit = new Circuit();
      circuit.map_url = 'https://example.com/monaco-map';
      expect(typeof circuit.map_url).toBe('string');
      expect(circuit.map_url).toBe('https://example.com/monaco-map');
    });

    it('should accept null for map_url', () => {
      const circuit = new Circuit();
      circuit.map_url = null;
      expect(circuit.map_url).toBeNull();
    });

    it('should handle valid URLs', () => {
      const circuit = new Circuit();
      const urls = [
        'https://example.com/monaco-map',
        'http://example.com/silverstone-map',
        'https://maps.google.com/circuit',
      ];
      
      urls.forEach(url => {
        circuit.map_url = url;
        expect(circuit.map_url).toBe(url);
      });
    });
  });

  describe('length_km column', () => {
    it('should have length_km property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('length_km');
    });

    it('should accept number type for length_km', () => {
      const circuit = new Circuit();
      circuit.length_km = 3.337;
      expect(typeof circuit.length_km).toBe('number');
      expect(circuit.length_km).toBe(3.337);
    });

    it('should accept null for length_km', () => {
      const circuit = new Circuit();
      circuit.length_km = null;
      expect(circuit.length_km).toBeNull();
    });

    it('should handle decimal values', () => {
      const circuit = new Circuit();
      circuit.length_km = 5.891;
      expect(circuit.length_km).toBe(5.891);
    });

    it('should handle zero value', () => {
      const circuit = new Circuit();
      circuit.length_km = 0;
      expect(circuit.length_km).toBe(0);
    });
  });

  describe('race_distance_km column', () => {
    it('should have race_distance_km property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('race_distance_km');
    });

    it('should accept number type for race_distance_km', () => {
      const circuit = new Circuit();
      circuit.race_distance_km = 260.286;
      expect(typeof circuit.race_distance_km).toBe('number');
      expect(circuit.race_distance_km).toBe(260.286);
    });

    it('should accept null for race_distance_km', () => {
      const circuit = new Circuit();
      circuit.race_distance_km = null;
      expect(circuit.race_distance_km).toBeNull();
    });

    it('should handle large values', () => {
      const circuit = new Circuit();
      circuit.race_distance_km = 1000.5;
      expect(circuit.race_distance_km).toBe(1000.5);
    });
  });

  describe('track_layout column', () => {
    it('should have track_layout property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('track_layout');
    });

    it('should accept object type for track_layout', () => {
      const circuit = new Circuit();
      const trackLayout = {
        type: 'FeatureCollection',
        features: [],
      };
      circuit.track_layout = trackLayout;
      expect(typeof circuit.track_layout).toBe('object');
      expect(circuit.track_layout).toEqual(trackLayout);
    });

    it('should accept null for track_layout', () => {
      const circuit = new Circuit();
      circuit.track_layout = null;
      expect(circuit.track_layout).toBeNull();
    });

    it('should handle complex GeoJSON objects', () => {
      const circuit = new Circuit();
      const complexLayout = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Start/Finish Line' },
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
          {
            type: 'Feature',
            properties: { name: 'Track' },
            geometry: {
              type: 'LineString',
              coordinates: [[0, 0], [1, 1], [2, 2]],
            },
          },
        ],
      };
      circuit.track_layout = complexLayout;
      expect(circuit.track_layout).toEqual(complexLayout);
    });
  });

  describe('country relationship', () => {
    it('should have country property', () => {
      const circuit = new Circuit();
      expect(circuit).toHaveProperty('country');
    });

    it('should accept Country type for country', () => {
      const circuit = new Circuit();
      circuit.country = mockCountry;
      expect(circuit.country).toBe(mockCountry);
    });

    it('should accept null for country', () => {
      const circuit = new Circuit();
      circuit.country = null;
      expect(circuit.country).toBeNull();
    });

    it('should handle country with all properties', () => {
      const circuit = new Circuit();
      const country = {
        country_code: 'GBR',
        country_name: 'United Kingdom',
        drivers: [],
      };
      circuit.country = country;
      expect(circuit.country).toEqual(country);
    });
  });

  describe('entity instantiation', () => {
    it('should create instance without parameters', () => {
      const circuit = new Circuit();
      expect(circuit).toBeInstanceOf(Circuit);
    });

    it('should create instance with all properties', () => {
      const circuit = new Circuit();
      circuit.id = 1;
      circuit.name = 'Monaco';
      circuit.location = 'Monte Carlo';
      circuit.country_code = 'MCO';
      circuit.map_url = 'https://example.com/monaco-map';
      circuit.length_km = 3.337;
      circuit.race_distance_km = 260.286;
      circuit.track_layout = { type: 'FeatureCollection', features: [] };
      circuit.country = mockCountry;

      expect(circuit.id).toBe(1);
      expect(circuit.name).toBe('Monaco');
      expect(circuit.location).toBe('Monte Carlo');
      expect(circuit.country_code).toBe('MCO');
      expect(circuit.map_url).toBe('https://example.com/monaco-map');
      expect(circuit.length_km).toBe(3.337);
      expect(circuit.race_distance_km).toBe(260.286);
      expect(circuit.track_layout).toEqual({ type: 'FeatureCollection', features: [] });
      expect(circuit.country).toBe(mockCountry);
    });

    it('should create instance with partial properties', () => {
      const circuit = new Circuit();
      circuit.name = 'Test Circuit';
      circuit.country_code = 'TST';

      expect(circuit.name).toBe('Test Circuit');
      expect(circuit.country_code).toBe('TST');
      expect(circuit.id).toBeUndefined();
      expect(circuit.location).toBeUndefined();
    });
  });

  describe('entity validation', () => {
    it('should handle all required properties', () => {
      const circuit = new Circuit();
      circuit.name = 'Required Name';

      expect(circuit.name).toBe('Required Name');
    });

    it('should handle all optional properties as null', () => {
      const circuit = new Circuit();
      circuit.name = 'Test';
      circuit.location = null;
      circuit.country_code = null;
      circuit.map_url = null;
      circuit.length_km = null;
      circuit.race_distance_km = null;
      circuit.track_layout = null;
      circuit.country = null;

      expect(circuit.name).toBe('Test');
      expect(circuit.location).toBeNull();
      expect(circuit.country_code).toBeNull();
      expect(circuit.map_url).toBeNull();
      expect(circuit.length_km).toBeNull();
      expect(circuit.race_distance_km).toBeNull();
      expect(circuit.track_layout).toBeNull();
      expect(circuit.country).toBeNull();
    });
  });

  describe('database operations', () => {
    it('should save circuit to database', async () => {
      const circuit = new Circuit();
      circuit.name = 'Test Circuit';
      circuit.location = 'Test Location';
      circuit.country_code = 'TST';

      const savedCircuit = await circuitRepository.save(circuit);

      expect(savedCircuit).toBeDefined();
      expect(savedCircuit.id).toBeDefined();
      expect(savedCircuit.name).toBe('Test Circuit');
    });

    it('should find circuit by id', async () => {
      const circuit = new Circuit();
      circuit.name = 'Test Circuit';
      circuit.location = 'Test Location';
      circuit.country_code = 'TST';

      const savedCircuit = await circuitRepository.save(circuit);
      const foundCircuit = await circuitRepository.findOne({
        where: { id: savedCircuit.id },
        relations: ['country'],
      });

      expect(foundCircuit).toBeDefined();
      expect(foundCircuit.id).toBe(savedCircuit.id);
      expect(foundCircuit.name).toBe('Test Circuit');
    });

    it('should find all circuits', async () => {
      const circuit1 = new Circuit();
      circuit1.name = 'Circuit 1';
      circuit1.country_code = 'TST';

      const circuit2 = new Circuit();
      circuit2.name = 'Circuit 2';
      circuit2.country_code = 'TST';

      await circuitRepository.save([circuit1, circuit2]);
      const circuits = await circuitRepository.find({ relations: ['country'] });

      expect(circuits).toHaveLength(2);
      expect(circuits[0].name).toBe('Circuit 1');
      expect(circuits[1].name).toBe('Circuit 2');
    });

    it('should update circuit', async () => {
      const circuit = new Circuit();
      circuit.name = 'Original Name';
      circuit.country_code = 'TST';

      const savedCircuit = await circuitRepository.save(circuit);
      savedCircuit.name = 'Updated Name';
      const updatedCircuit = await circuitRepository.save(savedCircuit);

      expect(updatedCircuit.name).toBe('Updated Name');
      expect(updatedCircuit.id).toBe(savedCircuit.id);
    });

    it('should delete circuit', async () => {
      const circuit = new Circuit();
      circuit.name = 'To Be Deleted';
      circuit.country_code = 'TST';

      const savedCircuit = await circuitRepository.save(circuit);
      await circuitRepository.delete(savedCircuit.id);

      const foundCircuit = await circuitRepository.findOne({
        where: { id: savedCircuit.id },
      });

      expect(foundCircuit).toBeNull();
    });
  });

  describe('relationships', () => {
    it('should handle country relationship', async () => {
      const country = new Country();
      country.country_code = 'TST';
      country.country_name = 'Test Country';
      country.drivers = [];

      const savedCountry = await countryRepository.save(country);

      const circuit = new Circuit();
      circuit.name = 'Test Circuit';
      circuit.country_code = 'TST';
      circuit.country = savedCountry;

      const savedCircuit = await circuitRepository.save(circuit);
      const foundCircuit = await circuitRepository.findOne({
        where: { id: savedCircuit.id },
        relations: ['country'],
      });

      expect(foundCircuit.country).toBeDefined();
      expect(foundCircuit.country.country_code).toBe('TST');
      expect(foundCircuit.country.country_name).toBe('Test Country');
    });
  });

  describe('edge cases', () => {
    it('should handle very long names', () => {
      const circuit = new Circuit();
      const longName = 'A'.repeat(10000);
      circuit.name = longName;
      expect(circuit.name).toBe(longName);
    });

    it('should handle special characters in all string fields', () => {
      const circuit = new Circuit();
      circuit.name = 'Circuit de Monaco (Monte Carlo) - 2024';
      circuit.location = 'Monte Carlo, Monaco 🇲🇨';
      circuit.country_code = 'MCO';
      circuit.map_url = 'https://example.com/monaco-map?year=2024&type=circuit';

      expect(circuit.name).toBe('Circuit de Monaco (Monte Carlo) - 2024');
      expect(circuit.location).toBe('Monte Carlo, Monaco 🇲🇨');
      expect(circuit.country_code).toBe('MCO');
      expect(circuit.map_url).toBe('https://example.com/monaco-map?year=2024&type=circuit');
    });

    it('should handle extreme numeric values', () => {
      const circuit = new Circuit();
      circuit.length_km = 0.001;
      circuit.race_distance_km = 999999.999;

      expect(circuit.length_km).toBe(0.001);
      expect(circuit.race_distance_km).toBe(999999.999);
    });

    it('should handle complex track layout objects', () => {
      const circuit = new Circuit();
      const complexLayout = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Start/Finish Line',
              description: 'The main start/finish line of the circuit',
              coordinates: [0, 0],
            },
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
          {
            type: 'Feature',
            properties: {
              name: 'Track Layout',
              description: 'The complete track layout',
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
                [6, 6], [7, 7], [8, 8], [9, 9], [10, 10],
              ],
            },
          },
        ],
        metadata: {
          created: '2024-01-01T00:00:00Z',
          version: '1.0',
          source: 'GPS Data',
        },
      };

      circuit.track_layout = complexLayout;
      expect(circuit.track_layout).toEqual(complexLayout);
    });
  });

  describe('type safety', () => {
    it('should maintain type safety for all properties', () => {
      const circuit = new Circuit();
      
      // Test that properties accept correct types
      circuit.id = 1;
      circuit.name = 'Test';
      circuit.location = 'Test Location';
      circuit.country_code = 'TST';
      circuit.map_url = 'https://example.com';
      circuit.length_km = 5.0;
      circuit.race_distance_km = 300.0;
      circuit.track_layout = { type: 'FeatureCollection', features: [] };
      circuit.country = mockCountry;

      expect(typeof circuit.id).toBe('number');
      expect(typeof circuit.name).toBe('string');
      expect(typeof circuit.location).toBe('string');
      expect(typeof circuit.country_code).toBe('string');
      expect(typeof circuit.map_url).toBe('string');
      expect(typeof circuit.length_km).toBe('number');
      expect(typeof circuit.race_distance_km).toBe('number');
      expect(typeof circuit.track_layout).toBe('object');
      expect(typeof circuit.country).toBe('object');
    });
  });
});
