import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { RaceDetailsDto } from './race-details.dto';
import { Circuit } from '../../circuits/circuits.entity';
import { ConstructorEntity } from '../../constructors/constructors.entity';
import { Driver } from '../../drivers/drivers.entity';
import { Lap } from '../../laps/laps.entity';
import { PitStop } from '../../pit-stops/pit-stops.entity';
import { QualifyingResult } from '../../qualifying-results/qualifying-results.entity';
import { RaceEvent } from '../../race-events/race-events.entity';
import { RaceResult } from '../../race-results/race-results.entity';
import { Season } from '../../seasons/seasons.entity';
import { TireStint } from '../../tire-stints/tire-stints.entity';

describe('RaceDetailsDto', () => {
  let raceDetailsDto: RaceDetailsDto;

  const mockSeason: Season = {
    id: 1,
    year: 2023,
    races: [],
  } as Season;

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
    country: null,
  } as any;

  const mockDriver: Driver = {
    id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    code: 'HAM',
    nationality: 'British',
    date_of_birth: '1985-01-07',
    country_id: 1,
  } as any;

  const mockConstructor: ConstructorEntity = {
    id: 1,
    name: 'Mercedes',
    nationality: 'German',
    url: 'https://mercedes.com',
  } as ConstructorEntity;

  const mockRaceResult: RaceResult = {
    id: 1,
    position: 1,
    points: 25,
    driver_id: 1,
    constructor_id: 1,
    session_id: 1,
    driver: mockDriver,
    team: mockConstructor,
  } as RaceResult;

  const mockQualifyingResult: QualifyingResult = {
    id: 1,
    position: 1,
    driver_id: 1,
    constructor_id: 1,
    session_id: 1,
    driver: mockDriver,
    team: mockConstructor,
  } as QualifyingResult;

  const mockLap: Lap = {
    id: 1,
    race_id: 1,
    driver_id: 1,
    lap_number: 1,
    position: 1,
    time_ms: 75000,
    sector_1_ms: 25000,
    sector_2_ms: 25000,
    sector_3_ms: 25000,
    is_pit_out_lap: false,
    race: null as any,
    driver: mockDriver,
  } as Lap;

  const mockPitStop: PitStop = {
    id: 1,
    race_id: 1,
    driver_id: 1,
    lap_number: 10,
    stop_number: 1,
    time_ms: 2500,
    duration_ms: 2500,
    race: null as any,
    driver: mockDriver,
  } as any;

  const mockTireStint: TireStint = {
    id: 1,
    session_id: 1,
    driver_id: 1,
    stint_number: 1,
    compound: 'soft',
    laps: 20,
    driver: mockDriver,
  } as any;

  const mockRaceEvent: RaceEvent = {
    id: 1,
    session_id: 1,
    lap_number: 10,
    type: 'flag',
    metadata: {
      flag: 'yellow',
    },
  } as RaceEvent;

  const mockRaceInfo = {
    id: 1,
    name: 'Monaco Grand Prix',
    round: 1,
    date: new Date('2023-05-28'),
    time: '14:00:00',
    season: mockSeason,
    circuit: mockCircuit,
    weather: {
      temperature: 25,
      humidity: 60,
      condition: 'sunny',
    },
  };

  const mockRaceDetailsData = {
    raceInfo: mockRaceInfo,
    raceResults: [mockRaceResult],
    qualifyingResults: [mockQualifyingResult],
    laps: [mockLap],
    pitStops: [mockPitStop],
    tireStints: [mockTireStint],
    raceEvents: [mockRaceEvent],
  };

  beforeEach(() => {
    raceDetailsDto = new RaceDetailsDto();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(raceDetailsDto).toBeDefined();
  });

  it('should be an instance of RaceDetailsDto', () => {
    expect(raceDetailsDto).toBeInstanceOf(RaceDetailsDto);
  });

  describe('Structure', () => {
    it('should have raceInfo property', () => {
      expect(raceDetailsDto).toHaveProperty('raceInfo');
    });

    it('should have raceResults property', () => {
      expect(raceDetailsDto).toHaveProperty('raceResults');
    });

    it('should have qualifyingResults property', () => {
      expect(raceDetailsDto).toHaveProperty('qualifyingResults');
    });

    it('should have laps property', () => {
      expect(raceDetailsDto).toHaveProperty('laps');
    });

    it('should have pitStops property', () => {
      expect(raceDetailsDto).toHaveProperty('pitStops');
    });

    it('should have tireStints property', () => {
      expect(raceDetailsDto).toHaveProperty('tireStints');
    });

    it('should have raceEvents property', () => {
      expect(raceDetailsDto).toHaveProperty('raceEvents');
    });
  });

  describe('Data Assignment', () => {
    it('should allow setting raceInfo', () => {
      raceDetailsDto.raceInfo = mockRaceInfo;
      expect(raceDetailsDto.raceInfo).toEqual(mockRaceInfo);
    });

    it('should allow setting raceResults', () => {
      raceDetailsDto.raceResults = [mockRaceResult];
      expect(raceDetailsDto.raceResults).toEqual([mockRaceResult]);
    });

    it('should allow setting qualifyingResults', () => {
      raceDetailsDto.qualifyingResults = [mockQualifyingResult];
      expect(raceDetailsDto.qualifyingResults).toEqual([mockQualifyingResult]);
    });

    it('should allow setting laps', () => {
      raceDetailsDto.laps = [mockLap];
      expect(raceDetailsDto.laps).toEqual([mockLap]);
    });

    it('should allow setting pitStops', () => {
      raceDetailsDto.pitStops = [mockPitStop];
      expect(raceDetailsDto.pitStops).toEqual([mockPitStop]);
    });

    it('should allow setting tireStints', () => {
      raceDetailsDto.tireStints = [mockTireStint];
      expect(raceDetailsDto.tireStints).toEqual([mockTireStint]);
    });

    it('should allow setting raceEvents', () => {
      raceDetailsDto.raceEvents = [mockRaceEvent];
      expect(raceDetailsDto.raceEvents).toEqual([mockRaceEvent]);
    });
  });

  describe('Complete Data Assignment', () => {
    it('should allow setting all properties at once', () => {
      Object.assign(raceDetailsDto, mockRaceDetailsData);

      expect(raceDetailsDto.raceInfo).toEqual(mockRaceInfo);
      expect(raceDetailsDto.raceResults).toEqual([mockRaceResult]);
      expect(raceDetailsDto.qualifyingResults).toEqual([mockQualifyingResult]);
      expect(raceDetailsDto.laps).toEqual([mockLap]);
      expect(raceDetailsDto.pitStops).toEqual([mockPitStop]);
      expect(raceDetailsDto.tireStints).toEqual([mockTireStint]);
      expect(raceDetailsDto.raceEvents).toEqual([mockRaceEvent]);
    });

    it('should handle empty arrays', () => {
      raceDetailsDto.raceResults = [];
      raceDetailsDto.qualifyingResults = [];
      raceDetailsDto.laps = [];
      raceDetailsDto.pitStops = [];
      raceDetailsDto.tireStints = [];
      raceDetailsDto.raceEvents = [];

      expect(raceDetailsDto.raceResults).toEqual([]);
      expect(raceDetailsDto.qualifyingResults).toEqual([]);
      expect(raceDetailsDto.laps).toEqual([]);
      expect(raceDetailsDto.pitStops).toEqual([]);
      expect(raceDetailsDto.tireStints).toEqual([]);
      expect(raceDetailsDto.raceEvents).toEqual([]);
    });
  });

  describe('RaceInfo Structure', () => {
    it('should have correct raceInfo properties', () => {
      raceDetailsDto.raceInfo = mockRaceInfo;

      expect(raceDetailsDto.raceInfo.id).toBe(1);
      expect(raceDetailsDto.raceInfo.name).toBe('Monaco Grand Prix');
      expect(raceDetailsDto.raceInfo.round).toBe(1);
      expect(raceDetailsDto.raceInfo.date).toEqual(new Date('2023-05-28'));
      expect(raceDetailsDto.raceInfo.time).toBe('14:00:00');
      expect(raceDetailsDto.raceInfo.season).toEqual(mockSeason);
      expect(raceDetailsDto.raceInfo.circuit).toEqual(mockCircuit);
      expect(raceDetailsDto.raceInfo.weather).toEqual({
        temperature: 25,
        humidity: 60,
        condition: 'sunny',
      });
    });

    it('should handle null weather in raceInfo', () => {
      const raceInfoWithNullWeather = { ...mockRaceInfo, weather: null };
      raceDetailsDto.raceInfo = raceInfoWithNullWeather;

      expect(raceDetailsDto.raceInfo.weather).toBeNull();
    });

    it('should handle undefined weather in raceInfo', () => {
      const raceInfoWithUndefinedWeather = { ...mockRaceInfo, weather: undefined };
      raceDetailsDto.raceInfo = raceInfoWithUndefinedWeather;

      expect(raceDetailsDto.raceInfo.weather).toBeUndefined();
    });
  });

  describe('Data Types', () => {
    it('should handle different data types correctly', () => {
      raceDetailsDto.raceInfo = mockRaceInfo;
      raceDetailsDto.raceResults = [mockRaceResult];
      raceDetailsDto.qualifyingResults = [mockQualifyingResult];
      raceDetailsDto.laps = [mockLap];
      raceDetailsDto.pitStops = [mockPitStop];
      raceDetailsDto.tireStints = [mockTireStint];
      raceDetailsDto.raceEvents = [mockRaceEvent];

      expect(typeof raceDetailsDto.raceInfo.id).toBe('number');
      expect(typeof raceDetailsDto.raceInfo.name).toBe('string');
      expect(typeof raceDetailsDto.raceInfo.round).toBe('number');
      expect(raceDetailsDto.raceInfo.date).toBeInstanceOf(Date);
      expect(typeof raceDetailsDto.raceInfo.time).toBe('string');
      expect(Array.isArray(raceDetailsDto.raceResults)).toBe(true);
      expect(Array.isArray(raceDetailsDto.qualifyingResults)).toBe(true);
      expect(Array.isArray(raceDetailsDto.laps)).toBe(true);
      expect(Array.isArray(raceDetailsDto.pitStops)).toBe(true);
      expect(Array.isArray(raceDetailsDto.tireStints)).toBe(true);
      expect(Array.isArray(raceDetailsDto.raceEvents)).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should be serializable to JSON', () => {
      Object.assign(raceDetailsDto, mockRaceDetailsData);

      const json = JSON.stringify(raceDetailsDto);
      const parsed = JSON.parse(json);

      expect(parsed.raceInfo).toBeDefined();
      expect(parsed.raceResults).toBeDefined();
      expect(parsed.qualifyingResults).toBeDefined();
      expect(parsed.laps).toBeDefined();
      expect(parsed.pitStops).toBeDefined();
      expect(parsed.tireStints).toBeDefined();
      expect(parsed.raceEvents).toBeDefined();
    });

    it('should handle circular references in serialization', () => {
      // Create objects with potential circular references
      const raceInfoWithCircularRef = {
        ...mockRaceInfo,
        season: { ...mockSeason, races: [] },
        circuit: { ...mockCircuit, country: null },
      } as any;

      raceDetailsDto.raceInfo = raceInfoWithCircularRef;
      raceDetailsDto.raceResults = [mockRaceResult];

      // Should not throw when stringifying
      expect(() => JSON.stringify(raceDetailsDto)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values', () => {
      raceDetailsDto.raceInfo = undefined as any;
      raceDetailsDto.raceResults = undefined as any;
      raceDetailsDto.qualifyingResults = undefined as any;
      raceDetailsDto.laps = undefined as any;
      raceDetailsDto.pitStops = undefined as any;
      raceDetailsDto.tireStints = undefined as any;
      raceDetailsDto.raceEvents = undefined as any;

      expect(raceDetailsDto.raceInfo).toBeUndefined();
      expect(raceDetailsDto.raceResults).toBeUndefined();
      expect(raceDetailsDto.qualifyingResults).toBeUndefined();
      expect(raceDetailsDto.laps).toBeUndefined();
      expect(raceDetailsDto.pitStops).toBeUndefined();
      expect(raceDetailsDto.tireStints).toBeUndefined();
      expect(raceDetailsDto.raceEvents).toBeUndefined();
    });

    it('should handle null values', () => {
      raceDetailsDto.raceInfo = null as any;
      raceDetailsDto.raceResults = null as any;
      raceDetailsDto.qualifyingResults = null as any;
      raceDetailsDto.laps = null as any;
      raceDetailsDto.pitStops = null as any;
      raceDetailsDto.tireStints = null as any;
      raceDetailsDto.raceEvents = null as any;

      expect(raceDetailsDto.raceInfo).toBeNull();
      expect(raceDetailsDto.raceResults).toBeNull();
      expect(raceDetailsDto.qualifyingResults).toBeNull();
      expect(raceDetailsDto.laps).toBeNull();
      expect(raceDetailsDto.pitStops).toBeNull();
      expect(raceDetailsDto.tireStints).toBeNull();
      expect(raceDetailsDto.raceEvents).toBeNull();
    });

    it('should handle large datasets', () => {
      const largeRaceResults = Array(1000).fill(null).map((_, index) => ({
        ...mockRaceResult,
        id: index + 1,
        position: index + 1,
      }));

      raceDetailsDto.raceResults = largeRaceResults;

      expect(raceDetailsDto.raceResults).toHaveLength(1000);
      expect(raceDetailsDto.raceResults[0].id).toBe(1);
      expect(raceDetailsDto.raceResults[999].id).toBe(1000);
    });
  });

  describe('Validation', () => {
    it('should accept valid raceInfo structure', () => {
      const validRaceInfo = {
        id: 1,
        name: 'Test Race',
        round: 1,
        date: new Date(),
        time: '14:00:00',
        season: mockSeason,
        circuit: mockCircuit,
        weather: { temperature: 20 },
      };

      raceDetailsDto.raceInfo = validRaceInfo;

      expect(raceDetailsDto.raceInfo).toEqual(validRaceInfo);
    });

    it('should accept valid array structures', () => {
      raceDetailsDto.raceResults = [mockRaceResult, { ...mockRaceResult, id: 2 }];
      raceDetailsDto.qualifyingResults = [mockQualifyingResult, { ...mockQualifyingResult, id: 2 }];
      raceDetailsDto.laps = [mockLap, { ...mockLap, id: 2 }];
      raceDetailsDto.pitStops = [mockPitStop, { ...mockPitStop, id: 2 }];
      raceDetailsDto.tireStints = [mockTireStint, { ...mockTireStint, id: 2 }];
      raceDetailsDto.raceEvents = [mockRaceEvent, { ...mockRaceEvent, id: 2 }];

      expect(raceDetailsDto.raceResults).toHaveLength(2);
      expect(raceDetailsDto.qualifyingResults).toHaveLength(2);
      expect(raceDetailsDto.laps).toHaveLength(2);
      expect(raceDetailsDto.pitStops).toHaveLength(2);
      expect(raceDetailsDto.tireStints).toHaveLength(2);
      expect(raceDetailsDto.raceEvents).toHaveLength(2);
    });
  });

  describe('Integration', () => {
    it('should work with real-world data structure', () => {
      const realWorldData = {
        raceInfo: {
          id: 1,
          name: 'Monaco Grand Prix',
          round: 6,
          date: new Date('2023-05-28'),
          time: '14:00:00',
          season: mockSeason,
          circuit: mockCircuit,
          weather: {
            temperature: 25,
            humidity: 60,
            condition: 'sunny',
            wind_speed: 10,
            wind_direction: 'NE',
          },
        },
        raceResults: [mockRaceResult],
        qualifyingResults: [mockQualifyingResult],
        laps: [mockLap],
        pitStops: [mockPitStop],
        tireStints: [mockTireStint],
        raceEvents: [mockRaceEvent],
      };

      Object.assign(raceDetailsDto, realWorldData);

      expect(raceDetailsDto.raceInfo.weather.condition).toBe('sunny');
      expect(raceDetailsDto.raceInfo.weather.wind_speed).toBe(10);
      expect(raceDetailsDto.raceInfo.weather.wind_direction).toBe('NE');
    });

    it('should maintain data integrity after multiple assignments', () => {
      // First assignment
      raceDetailsDto.raceInfo = mockRaceInfo;
      raceDetailsDto.raceResults = [mockRaceResult];

      // Second assignment
      raceDetailsDto.qualifyingResults = [mockQualifyingResult];
      raceDetailsDto.laps = [mockLap];

      // Third assignment
      raceDetailsDto.pitStops = [mockPitStop];
      raceDetailsDto.tireStints = [mockTireStint];
      raceDetailsDto.raceEvents = [mockRaceEvent];

      expect(raceDetailsDto.raceInfo).toEqual(mockRaceInfo);
      expect(raceDetailsDto.raceResults).toEqual([mockRaceResult]);
      expect(raceDetailsDto.qualifyingResults).toEqual([mockQualifyingResult]);
      expect(raceDetailsDto.laps).toEqual([mockLap]);
      expect(raceDetailsDto.pitStops).toEqual([mockPitStop]);
      expect(raceDetailsDto.tireStints).toEqual([mockTireStint]);
      expect(raceDetailsDto.raceEvents).toEqual([mockRaceEvent]);
    });
  });

  describe('Performance', () => {
    it('should handle rapid property assignments', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        raceDetailsDto.raceInfo = { ...mockRaceInfo, id: i };
        raceDetailsDto.raceResults = [{ ...mockRaceResult, id: i }];
      }

      const end = Date.now();
      const duration = end - start;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(raceDetailsDto.raceInfo.id).toBe(999);
      expect(raceDetailsDto.raceResults[0].id).toBe(999);
    });
  });
});
