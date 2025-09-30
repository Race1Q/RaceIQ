import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { Race } from '../races/races.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { RaceFastestLapMaterialized } from './race-fastest-laps-materialized.entity';
import { ConstructorStandingMaterialized } from './constructor-standings-materialized.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let raceRepository: jest.Mocked<Repository<Race>>;
  let raceResultRepository: jest.Mocked<Repository<RaceResult>>;
  let standingsViewRepository: jest.Mocked<Repository<DriverStandingMaterialized>>;
  let fastestLapViewRepository: jest.Mocked<Repository<RaceFastestLapMaterialized>>;
  let constructorStandingsViewRepo: jest.Mocked<Repository<ConstructorStandingMaterialized>>;

  const mockRace = {
    id: 1,
    name: 'Monaco Grand Prix',
    date: '2024-05-26',
    time: '14:00:00',
    season_id: 2024,
    round: 8,
    circuit_id: 1,
    circuit: { id: 1, name: 'Circuit de Monaco' },
  } as Race;

  const mockRaceResult = {
    id: 1,
    position: 1,
    points: 25,
    driver_id: 1,
    constructor_id: 1,
    driver: { id: 1, first_name: 'Lewis', last_name: 'Hamilton' },
    team: { id: 1, name: 'Mercedes' },
  } as RaceResult;

  const mockStanding = {
    driver_id: 1,
    driverFullName: 'Lewis Hamilton',
    constructor_id: 1,
    constructorName: 'Mercedes',
    seasonPoints: 100,
    seasonYear: 2024,
    position: 1,
    wins: 2,
    podiums: 5,
  } as DriverStandingMaterialized;

  const mockFastestLap = {
    race_id: 1,
    driver_id: 1,
    driverFullName: 'Lewis Hamilton',
    lapTimeMs: 90000, // 1:30.000 in milliseconds
    fastest_lap_rank: 1,
  } as RaceFastestLapMaterialized;

  beforeEach(async () => {
    const mockRaceRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockRaceResultRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockStandingsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ latestYear: 2024 }),
      })),
    };

    const mockFastestLapRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockConstructorStandingsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Race),
          useValue: mockRaceRepo,
        },
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockRaceResultRepo,
        },
        {
          provide: getRepositoryToken(DriverStandingMaterialized),
          useValue: mockStandingsRepo,
        },
        {
          provide: getRepositoryToken(RaceFastestLapMaterialized),
          useValue: mockFastestLapRepo,
        },
        {
          provide: getRepositoryToken(ConstructorStandingMaterialized),
          useValue: mockConstructorStandingsRepo,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    raceRepository = module.get(getRepositoryToken(Race));
    raceResultRepository = module.get(getRepositoryToken(RaceResult));
    standingsViewRepository = module.get(getRepositoryToken(DriverStandingMaterialized));
    fastestLapViewRepository = module.get(getRepositoryToken(RaceFastestLapMaterialized));
    constructorStandingsViewRepo = module.get(getRepositoryToken(ConstructorStandingMaterialized));
  });

  beforeEach(() => {
    // Set up default mocks that are needed by most tests
    constructorStandingsViewRepo.find.mockResolvedValue([
      {
        position: 1,
        constructorName: 'Red Bull Racing',
        seasonPoints: 500,
        seasonYear: 2024,
      } as any,
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('formatLapTime', () => {
    it('should format lap time correctly', () => {
      const result = (service as any).formatLapTime(90000); // 1:30.000
      expect(result).toBe('1:30.000');
    });

    it('should handle zero milliseconds', () => {
      const result = (service as any).formatLapTime(0);
      expect(result).toBe('N/A');
    });

    it('should handle negative milliseconds', () => {
      const result = (service as any).formatLapTime(-1000);
      expect(result).toBe('N/A');
    });

    it('should handle null/undefined', () => {
      const result = (service as any).formatLapTime(null);
      expect(result).toBe('N/A');
    });

    it('should format different lap times correctly', () => {
      expect((service as any).formatLapTime(60000)).toBe('1:00.000'); // 1:00.000
      expect((service as any).formatLapTime(120000)).toBe('2:00.000'); // 2:00.000
      expect((service as any).formatLapTime(90500)).toBe('1:30.500'); // 1:30.500
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard data successfully', async () => {
      // Mock next race
      raceRepository.findOne.mockResolvedValueOnce(mockRace);
      
      // Mock last race
      raceRepository.findOne.mockResolvedValueOnce(mockRace);
      
      // Mock standings
      standingsViewRepository.find.mockResolvedValue([mockStanding]);
      
      // Mock race results for podium
      raceResultRepository.find.mockResolvedValue([mockRaceResult]);
      
      // Mock fastest lap
      fastestLapViewRepository.findOne.mockResolvedValue(mockFastestLap);
      
      // Mock head to head - need at least 2 drivers
      standingsViewRepository.find.mockResolvedValue([mockStanding, mockStanding]);

      const result = await service.getDashboardData();

      expect(result).toBeDefined();
      expect(result.nextRace).toBeDefined();
      expect(result.championshipStandings).toBeDefined();
      expect(result.lastRacePodium).toBeDefined();
      expect(result.lastRaceFastestLap).toBeDefined();
      expect(result.headToHead).toBeDefined();
    });

    it('should handle missing next race', async () => {
      raceRepository.findOne.mockResolvedValueOnce(null); // No next race

      await expect(service.getDashboardData()).rejects.toThrow('Next race not found.');
    });

    it('should handle missing last race', async () => {
      raceRepository.findOne.mockResolvedValueOnce(mockRace); // Next race exists
      raceRepository.findOne.mockResolvedValueOnce(null); // No last race
      standingsViewRepository.find.mockResolvedValue([mockStanding]);

      await expect(service.getDashboardData()).rejects.toThrow('Could not determine the last completed race.');
    });

    it('should handle repository errors', async () => {
      raceRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getDashboardData()).rejects.toThrow('Database error');
    });
  });

  describe('getNextRace (private method)', () => {
    it('should return next race data', async () => {
      raceRepository.findOne.mockResolvedValue(mockRace);

      const result = await (service as any).getNextRace();

      expect(result).toBeDefined();
      expect(result.raceName).toBe(mockRace.name);
      expect(result.circuitName).toBe(mockRace.circuit.name);
      expect(result.raceDate).toBeDefined();
    });

    it('should throw error when no next race found', async () => {
      raceRepository.findOne.mockResolvedValue(null);

      await expect((service as any).getNextRace()).rejects.toThrow('Next race not found.');
    });
  });

  describe('getLastRace (private method)', () => {
    it('should return last race', async () => {
      raceRepository.findOne.mockResolvedValue(mockRace);

      const result = await (service as any).getLastRace();

      expect(result).toEqual(mockRace);
    });

    it('should return null when no last race found', async () => {
      raceRepository.findOne.mockResolvedValue(null);

      const result = await (service as any).getLastRace();

      expect(result).toBeNull();
    });
  });

  describe('getChampionshipStandings (private method)', () => {
    it('should return championship standings', async () => {
      standingsViewRepository.find.mockResolvedValue([mockStanding]);

      const result = await (service as any).getChampionshipStandings(2024);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('position');
      expect(result[0]).toHaveProperty('driverFullName');
    });

    it('should handle empty standings', async () => {
      standingsViewRepository.find.mockResolvedValue([]);

      const result = await (service as any).getChampionshipStandings(2024);

      expect(result).toEqual([]);
    });
  });

  describe('getLastRacePodium (private method)', () => {
    it('should return last race podium', async () => {
      raceResultRepository.find.mockResolvedValue([mockRaceResult]);

      const result = await (service as any).getLastRacePodium(1, 'Monaco GP');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('podium');
      expect(result).toHaveProperty('raceName');
    });

    it('should handle empty podium', async () => {
      raceResultRepository.find.mockResolvedValue([]);

      const result = await (service as any).getLastRacePodium(1, 'Monaco GP');

      expect(result).toHaveProperty('podium');
      expect(result.podium).toEqual([]);
    });
  });

  describe('getLastRaceFastestLap (private method)', () => {
    it('should return last race fastest lap', async () => {
      fastestLapViewRepository.findOne.mockResolvedValue(mockFastestLap);

      const result = await (service as any).getLastRaceFastestLap(1);

      expect(result).toBeDefined();
    });

    it('should return placeholder when no fastest lap found', async () => {
      fastestLapViewRepository.findOne.mockResolvedValue(null);

      const result = await (service as any).getLastRaceFastestLap(1);

      expect(result).toEqual({
        driverFullName: 'Data Pending',
        lapTime: '--:--.---',
      });
    });
  });

  describe('getHeadToHead (private method)', () => {
    it('should return head to head data', async () => {
      standingsViewRepository.find.mockResolvedValue([mockStanding, mockStanding]);

      const result = await (service as any).getHeadToHead(2024);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('driver1');
      expect(result).toHaveProperty('driver2');
    });

    it('should return placeholder when not enough drivers', async () => {
      standingsViewRepository.find.mockResolvedValue([mockStanding]);

      const result = await (service as any).getHeadToHead(2024);

      expect(result).toEqual({
        driver1: {
          fullName: 'Data Pending',
          headshotUrl: '',
          teamName: 'N/A',
          wins: 0,
          podiums: 0,
          points: 0,
        },
        driver2: {
          fullName: 'Data Pending',
          headshotUrl: '',
          teamName: 'N/A',
          wins: 0,
          podiums: 0,
          points: 0,
        },
      });
    });
  });

  describe('service structure', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of DashboardService', () => {
      expect(service).toBeInstanceOf(DashboardService);
    });

    it('should have getDashboardData method', () => {
      expect(typeof service.getDashboardData).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle null race data', async () => {
      raceRepository.findOne.mockResolvedValue(null);

      await expect((service as any).getNextRace()).rejects.toThrow('Next race not found.');
    });

    it('should handle undefined standings data', async () => {
      standingsViewRepository.find.mockResolvedValue(undefined as any);

      await expect((service as any).getChampionshipStandings(2024)).rejects.toThrow();
    });

    it('should handle mixed data types', async () => {
      const mixedData = [
        { id: 1, position: 1, driver: { first_name: 'Lewis', last_name: 'Hamilton' }, team: { name: 'Mercedes' } },
        { id: 2, position: 2, driver: { first_name: 'Max', last_name: 'Verstappen' }, team: { name: 'Red Bull' } },
        { id: 3, position: 3, driver: { first_name: 'Charles', last_name: 'Leclerc' }, team: { name: 'Ferrari' } },
      ];
      raceResultRepository.find.mockResolvedValue(mixedData as any);

      const result = await (service as any).getLastRacePodium(1, 'Test Race');
      expect(result).toBeDefined();
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple concurrent getDashboardData calls', async () => {
      raceRepository.findOne.mockResolvedValue(mockRace);
      standingsViewRepository.find.mockResolvedValue([mockStanding, mockStanding]);
      raceResultRepository.find.mockResolvedValue([mockRaceResult]);
      fastestLapViewRepository.findOne.mockResolvedValue(mockFastestLap);

      const promises = [
        service.getDashboardData(),
        service.getDashboardData(),
        service.getDashboardData(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result !== undefined)).toBe(true);
    });
  });

  describe('data validation', () => {
    it('should validate race data structure', async () => {
      const validRace = {
        id: 1,
        name: 'Monaco GP',
        date: '2024-05-26',
        time: '14:00:00',
        season_id: 2024,
        round: 1,
        circuit_id: 1,
        circuit: { id: 1, name: 'Circuit de Monaco' },
      };
      raceRepository.findOne.mockResolvedValue(validRace as Race);

      const result = await (service as any).getNextRace();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('raceName');
      expect(result).toHaveProperty('circuitName');
      expect(result).toHaveProperty('raceDate');
    });

    it('should validate standings data structure', async () => {
      const validStanding = {
        driver_id: 1,
        driverFullName: 'Lewis Hamilton',
        constructor_id: 1,
        constructorName: 'Mercedes',
        seasonPoints: 100,
        seasonYear: 2024,
      };
      standingsViewRepository.find.mockResolvedValue([validStanding as DriverStandingMaterialized]);

      const result = await (service as any).getChampionshipStandings(2024);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('position');
      expect(result[0]).toHaveProperty('driverFullName');
    });
  });

  describe('performance', () => {
    it('should complete getDashboardData within reasonable time', async () => {
      raceRepository.findOne.mockResolvedValue(mockRace);
      standingsViewRepository.find.mockResolvedValue([mockStanding, mockStanding]);
      raceResultRepository.find.mockResolvedValue([mockRaceResult]);
      fastestLapViewRepository.findOne.mockResolvedValue(mockFastestLap);

      const startTime = Date.now();
      await service.getDashboardData();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});