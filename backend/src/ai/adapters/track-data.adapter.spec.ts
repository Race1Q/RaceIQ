import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrackDataAdapter } from './track-data.adapter';
import { CircuitsService } from '../../circuits/circuits.service';
import { RacesService } from '../../races/races.service';

describe('TrackDataAdapter', () => {
  let adapter: TrackDataAdapter;
  let circuitsService: jest.Mocked<CircuitsService>;
  let racesService: jest.Mocked<RacesService>;

  const mockCircuit = {
    id: 1,
    name: 'Circuit de Monaco',
    location: 'Monte Carlo',
    country_code: 'MCO',
    length_km: 3.337,
    race_distance_km: 260.286,
  };

  const mockRaces = [
    {
      id: 1,
      name: 'Monaco Grand Prix',
      date: new Date('2023-05-28'),
      circuit_id: 1,
    },
    {
      id: 2,
      name: 'Monaco Grand Prix',
      date: new Date('2022-05-29'),
      circuit_id: 1,
    },
    {
      id: 3,
      name: 'Monaco Grand Prix',
      date: new Date('2021-05-23'),
      circuit_id: 1,
    },
  ];

  const mockEvent = {
    id: 123,
    name: 'Monaco Grand Prix 2023',
    date: new Date('2023-05-28'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackDataAdapter,
        {
          provide: CircuitsService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: RacesService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<TrackDataAdapter>(TrackDataAdapter);
    circuitsService = module.get(CircuitsService);
    racesService = module.get(RacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getTrackData - fetch by ID', () => {
    it('should fetch circuit by numeric ID', async () => {
      circuitsService.findOne.mockResolvedValue(mockCircuit as any);
      racesService.findAll.mockResolvedValue(mockRaces as any);

      const result = await adapter.getTrackData('1');

      expect(result).toMatchObject({
        slug: '1',
        circuitId: 1,
        circuitName: 'Circuit de Monaco',
        location: 'Monte Carlo',
        country: 'MCO',
        lengthKm: 3.337,
      });
      expect(circuitsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should parse string ID correctly', async () => {
      circuitsService.findOne.mockResolvedValue(mockCircuit as any);
      racesService.findAll.mockResolvedValue(mockRaces as any);

      await adapter.getTrackData('42');

      expect(circuitsService.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('getTrackData - fetch by name', () => {
    it('should fetch circuit by name when ID lookup fails', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockResolvedValue([mockCircuit] as any);
      racesService.findAll.mockResolvedValue(mockRaces as any);

      const result = await adapter.getTrackData('monaco');

      expect(result.circuitName).toBe('Circuit de Monaco');
      expect(circuitsService.findAll).toHaveBeenCalled();
    });

    it('should find circuit with case-insensitive name matching', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockResolvedValue([mockCircuit] as any);
      racesService.findAll.mockResolvedValue(mockRaces as any);

      const result = await adapter.getTrackData('MONACO');

      expect(result.circuitName).toBe('Circuit de Monaco');
    });

    it('should find circuit with partial name match', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockResolvedValue([mockCircuit] as any);
      racesService.findAll.mockResolvedValue(mockRaces as any);

      const result = await adapter.getTrackData('mon');

      expect(result.circuitName).toBe('Circuit de Monaco');
    });

    it('should throw NotFoundException when circuit not found', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockResolvedValue([]);

      await expect(adapter.getTrackData('unknown')).rejects.toThrow(NotFoundException);
      await expect(adapter.getTrackData('unknown')).rejects.toThrow('Circuit not found for slug: unknown');
    });
  });

  describe('getTrackData - historical races', () => {
    beforeEach(() => {
      circuitsService.findOne.mockResolvedValue(mockCircuit as any);
    });

    it('should fetch historical races for the circuit', async () => {
      racesService.findAll.mockResolvedValue(mockRaces as any);

      const result = await adapter.getTrackData('1');

      expect(result.historicalRaces).toHaveLength(3);
      expect(result.historicalRaces?.[0]).toMatchObject({
        year: 2023,
        raceName: 'Monaco Grand Prix',
      });
    });

    it('should sort races by most recent first', async () => {
      const unsortedRaces = [mockRaces[2], mockRaces[0], mockRaces[1]];
      racesService.findAll.mockResolvedValue(unsortedRaces as any);

      const result = await adapter.getTrackData('1');

      expect(result.historicalRaces?.[0].year).toBe(2023);
      expect(result.historicalRaces?.[1].year).toBe(2022);
      expect(result.historicalRaces?.[2].year).toBe(2021);
    });

    it('should limit historical races to 5 most recent', async () => {
      const manyRaces = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Race ${i}`,
        date: new Date(`202${3 - Math.floor(i / 2)}-01-01`),
        circuit_id: 1,
      }));
      racesService.findAll.mockResolvedValue(manyRaces as any);

      const result = await adapter.getTrackData('1');

      expect(result.historicalRaces).toHaveLength(5);
    });

    it('should handle historical races fetch failure gracefully', async () => {
      racesService.findAll.mockRejectedValue(new Error('Races DB error'));

      const result = await adapter.getTrackData('1');

      expect(result.historicalRaces).toEqual([]);
      expect(result.circuitName).toBe('Circuit de Monaco');
    });

    it('should include date in historical races when available', async () => {
      racesService.findAll.mockResolvedValue(mockRaces as any);

      const result = await adapter.getTrackData('1');

      expect(result.historicalRaces?.[0].date).toBeTruthy();
    });
  });

  describe('getTrackData - event info', () => {
    beforeEach(() => {
      circuitsService.findOne.mockResolvedValue(mockCircuit as any);
      racesService.findAll.mockResolvedValue(mockRaces as any);
    });

    it('should fetch event info when eventId provided', async () => {
      racesService.findOne.mockResolvedValue(mockEvent as any);

      const result = await adapter.getTrackData('1', 123);

      expect(result.eventInfo).toMatchObject({
        eventId: 123,
        raceName: 'Monaco Grand Prix 2023',
      });
      expect(racesService.findOne).toHaveBeenCalledWith('123');
    });

    it('should not fetch event info when eventId not provided', async () => {
      const result = await adapter.getTrackData('1');

      expect(result.eventInfo).toBeUndefined();
      expect(racesService.findOne).not.toHaveBeenCalled();
    });

    it('should handle event fetch failure gracefully', async () => {
      racesService.findOne.mockRejectedValue(new Error('Event not found'));

      const result = await adapter.getTrackData('1', 123);

      expect(result.eventInfo).toBeUndefined();
      expect(result.circuitName).toBe('Circuit de Monaco');
    });

    it('should handle null event response', async () => {
      racesService.findOne.mockResolvedValue(null);

      const result = await adapter.getTrackData('1', 123);

      expect(result.eventInfo).toBeUndefined();
    });
  });

  describe('comprehensive data structure', () => {
    beforeEach(() => {
      circuitsService.findOne.mockResolvedValue(mockCircuit as any);
      racesService.findAll.mockResolvedValue(mockRaces as any);
      racesService.findOne.mockResolvedValue(mockEvent as any);
    });

    it('should return all fields when fully populated', async () => {
      const result = await adapter.getTrackData('1', 123);

      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('circuitId');
      expect(result).toHaveProperty('circuitName');
      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('lengthKm');
      expect(result).toHaveProperty('raceDistanceKm');
      expect(result).toHaveProperty('historicalRaces');
      expect(result).toHaveProperty('eventInfo');
    });

    it('should include slug in response', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockResolvedValue([mockCircuit] as any);
      
      const result = await adapter.getTrackData('monaco');

      expect(result.slug).toBe('monaco');
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundException when circuit lookup fails', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockResolvedValue([]);

      await expect(adapter.getTrackData('1')).rejects.toThrow(NotFoundException);
      await expect(adapter.getTrackData('1')).rejects.toThrow('Circuit not found for slug: 1');
    });

    it('should throw NotFoundException when circuit not found by ID or name', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockResolvedValue([]);

      await expect(adapter.getTrackData('999')).rejects.toThrow(NotFoundException);
    });

    it('should continue when findAll throws during name search', async () => {
      circuitsService.findOne.mockResolvedValue(null);
      circuitsService.findAll.mockRejectedValue(new Error('FindAll error'));

      await expect(adapter.getTrackData('monaco')).rejects.toThrow(NotFoundException);
    });
  });
});

