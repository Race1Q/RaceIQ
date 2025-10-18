import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { Driver } from './drivers.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';

describe('DriversService', () => {
  let service: DriversService;
  let driverRepository: Repository<Driver>;
  let raceResultRepository: Repository<RaceResult>;
  let qualifyingResultRepository: Repository<QualifyingResult>;
  let careerStatsViewRepo: Repository<DriverCareerStatsMaterialized>;
  let standingsViewRepo: Repository<DriverStandingMaterialized>;
  let winsPerSeasonViewRepo: Repository<WinsPerSeasonMaterialized>;
  let fastestLapViewRepo: Repository<RaceFastestLapMaterialized>;

  const mockDriverRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockRaceResultRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQualifyingResultRepository = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
  };

  const mockCareerStatsViewRepo = {
    findOne: jest.fn(),
  };

  const mockStandingsViewRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
  };

  const mockWinsPerSeasonViewRepo = {
    find: jest.fn(),
  };

  const mockFastestLapViewRepo = {
    count: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        {
          provide: getRepositoryToken(Driver),
          useValue: mockDriverRepository,
        },
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockRaceResultRepository,
        },
        {
          provide: getRepositoryToken(QualifyingResult),
          useValue: mockQualifyingResultRepository,
        },
        {
          provide: getRepositoryToken(DriverCareerStatsMaterialized),
          useValue: mockCareerStatsViewRepo,
        },
        {
          provide: getRepositoryToken(DriverStandingMaterialized),
          useValue: mockStandingsViewRepo,
        },
        {
          provide: getRepositoryToken(WinsPerSeasonMaterialized),
          useValue: mockWinsPerSeasonViewRepo,
        },
        {
          provide: getRepositoryToken(RaceFastestLapMaterialized),
          useValue: mockFastestLapViewRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
    driverRepository = module.get<Repository<Driver>>(getRepositoryToken(Driver));
    raceResultRepository = module.get<Repository<RaceResult>>(getRepositoryToken(RaceResult));
    qualifyingResultRepository = module.get<Repository<QualifyingResult>>(getRepositoryToken(QualifyingResult));
    careerStatsViewRepo = module.get<Repository<DriverCareerStatsMaterialized>>(getRepositoryToken(DriverCareerStatsMaterialized));
    standingsViewRepo = module.get<Repository<DriverStandingMaterialized>>(getRepositoryToken(DriverStandingMaterialized));
    winsPerSeasonViewRepo = module.get<Repository<WinsPerSeasonMaterialized>>(getRepositoryToken(WinsPerSeasonMaterialized));
    fastestLapViewRepo = module.get<Repository<RaceFastestLapMaterialized>>(getRepositoryToken(RaceFastestLapMaterialized));
  });

  describe('Class Structure', () => {
    it('should be defined', () => {
      expect(DriversService).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof DriversService).toBe('function');
    });

    it('should be instantiable', () => {
      expect(service).toBeInstanceOf(DriversService);
    });

    it('should have all required repositories injected', () => {
      expect(service).toHaveProperty('driverRepository');
      expect(service).toHaveProperty('raceResultRepository');
      expect(service).toHaveProperty('qualifyingResultRepository');
      expect(service).toHaveProperty('careerStatsViewRepo');
      expect(service).toHaveProperty('standingsViewRepo');
      expect(service).toHaveProperty('winsPerSeasonViewRepo');
      expect(service).toHaveProperty('fastestLapViewRepo');
    });
  });

  describe('findAll method', () => {
    it('should return transformed drivers list', async () => {
      const mockDrivers: Driver[] = [
        {
          id: 1,
          first_name: 'Lewis',
          last_name: 'Hamilton',
          name_acronym: 'HAM',
          driver_number: 44,
          country_code: 'GB',
          date_of_birth: new Date('1985-01-07'),
          profile_image_url: 'https://example.com/lewis.jpg',
          bio: 'Seven-time World Champion',
          fun_fact: 'Started racing at age 8',
          country: { country_code: 'GB', country_name: 'Great Britain' },
        } as Driver,
        {
          id: 2,
          first_name: 'Max',
          last_name: 'Verstappen',
          name_acronym: 'VER',
          driver_number: 1,
          country_code: 'NL',
          date_of_birth: new Date('1997-09-30'),
          profile_image_url: 'https://example.com/max.jpg',
          bio: 'Three-time World Champion',
          fun_fact: 'Youngest F1 driver ever',
          country: { country_code: 'NL', country_name: 'Netherlands' },
        } as Driver,
      ];

      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      mockStandingsViewRepo.find.mockResolvedValue([
        { driverId: 1 },
        { driverId: 2 },
      ]);
      
      // Mock driver repository
      mockDriverRepository.find.mockResolvedValue(mockDrivers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        full_name: 'Lewis Hamilton',
        given_name: 'Lewis',
        family_name: 'Hamilton',
        code: 'HAM',
        current_team_name: null,
        image_url: 'https://example.com/lewis.jpg',
        team_color: null,
        country_code: 'GB',
        driver_number: 44,
        date_of_birth: new Date('1985-01-07'),
        bio: 'Seven-time World Champion',
        fun_fact: 'Started racing at age 8',
      });

      // Service now uses standings view to get driver IDs first, then queries drivers
      expect(mockDriverRepository.find).toHaveBeenCalled();
      expect(mockDriverRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['country'],
          order: { last_name: 'ASC' },
        })
      );
    });

    it('should handle drivers with missing names', async () => {
      const mockDrivers: Driver[] = [
        {
          id: 1,
          first_name: 'Lewis',
          last_name: null,
          name_acronym: 'HAM',
          driver_number: 44,
          country_code: 'GB',
          date_of_birth: new Date('1985-01-07'),
          profile_image_url: null,
          bio: null,
          fun_fact: null,
          country: null,
        } as Driver,
      ];

      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      mockStandingsViewRepo.find.mockResolvedValue([
        { driverId: 1 },
      ]);
      
      // Mock driver repository
      mockDriverRepository.find.mockResolvedValue(mockDrivers);

      const result = await service.findAll();

      expect(result[0].full_name).toBe('Lewis');
      expect(result[0].given_name).toBe('Lewis');
      expect(result[0].family_name).toBeNull();
      expect(result[0].code).toBe('HAM');
      expect(result[0].current_team_name).toBeNull();
      expect(result[0].image_url).toBeNull();
      expect(result[0].team_color).toBeNull();
      expect(result[0].bio).toBeNull();
      expect(result[0].fun_fact).toBeNull();
    });

    it('should handle empty drivers list', async () => {
      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      mockStandingsViewRepo.find.mockResolvedValue([]);
      
      // Mock driver repository
      mockDriverRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      mockStandingsViewRepo.find.mockResolvedValue([
        { driverId: 1 },
      ]);
      
      // Mock driver repository to throw error
      mockDriverRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne method', () => {
    it('should return a driver by ID', async () => {
      const mockDriver: Driver = {
        id: 1,
        first_name: 'Lewis',
        last_name: 'Hamilton',
        name_acronym: 'HAM',
        driver_number: 44,
        country_code: 'GB',
        date_of_birth: new Date('1985-01-07'),
        profile_image_url: 'https://example.com/lewis.jpg',
        bio: 'Seven-time World Champion',
        fun_fact: 'Started racing at age 8',
        country: { country_code: 'GB', country_name: 'Great Britain' },
      } as Driver;

      mockDriverRepository.findOne.mockResolvedValue(mockDriver);

      const result = await service.findOne(1);

      expect(result).toEqual(mockDriver);
      expect(mockDriverRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['country'],
      });
    });

    it('should throw NotFoundException when driver not found', async () => {
      mockDriverRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Driver with ID 999 not found')
      );
    });

    it('should handle database errors', async () => {
      mockDriverRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne(1)).rejects.toThrow('Database error');
    });
  });

  describe('getDriverCareerStats method', () => {
    const mockDriver: Driver = {
      id: 1,
      first_name: 'Lewis',
      last_name: 'Hamilton',
      name_acronym: 'HAM',
      driver_number: 44,
      country_code: 'GB',
      date_of_birth: new Date('1985-01-07'),
      profile_image_url: 'https://example.com/lewis.jpg',
      bio: 'Seven-time World Champion',
      fun_fact: 'Started racing at age 8',
    } as Driver;

    const mockCareerStats: DriverCareerStatsMaterialized = {
      driverId: 1,
      totalWins: 103,
      totalPodiums: 197,
      totalFastestLaps: 65,
      totalPoints: '4639.5',
      grandsPrixEntered: 330,
      dnfs: 25,
      highestRaceFinish: 1,
    } as DriverCareerStatsMaterialized;

    const mockCurrentSeason: DriverStandingMaterialized = {
      driverId: 1,
      seasonYear: 2023,
      seasonWins: 6,
      seasonPodiums: 17,
      seasonPoints: 234,
      position: 3,
    } as DriverStandingMaterialized;

    const mockWinsPerSeason: WinsPerSeasonMaterialized[] = [
      { driverId: 1, seasonYear: 2023, wins: 6 } as WinsPerSeasonMaterialized,
      { driverId: 1, seasonYear: 2022, wins: 0 } as WinsPerSeasonMaterialized,
      { driverId: 1, seasonYear: 2021, wins: 8 } as WinsPerSeasonMaterialized,
    ];

    const mockFirstRace: RaceResult = {
      id: 1,
      driver: { id: 1 } as Driver,
      session: {
        race: {
          date: new Date('2007-03-18'),
          name: 'Australian Grand Prix',
        },
      },
    } as RaceResult;

    const mockStandings: DriverStandingMaterialized[] = [
      { driverId: 1, seasonYear: 2023, seasonPoints: 234 } as DriverStandingMaterialized,
      { driverId: 2, seasonYear: 2023, seasonPoints: 200 } as DriverStandingMaterialized,
    ];

    beforeEach(() => {
      // Mock the findOne method to return the driver
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDriver);
    });

    it('should return complete career stats', async () => {
      // Mock all the repository calls
      mockCareerStatsViewRepo.findOne.mockResolvedValue(mockCareerStats);
      mockStandingsViewRepo.findOne.mockResolvedValue(mockCurrentSeason);
      mockWinsPerSeasonViewRepo.find.mockResolvedValue(mockWinsPerSeason);
      mockRaceResultRepository.findOne.mockResolvedValue(mockFirstRace);
      mockFastestLapViewRepo.count.mockResolvedValue(5);
      mockStandingsViewRepo.find.mockResolvedValue(mockStandings);

      const mockRaceResultQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ teamName: 'Mercedes' }),
      };

      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '10' }),
      };

      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockRaceResultQueryBuilder);
      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      mockDataSource.query.mockResolvedValue([{ bestLapMs: 80000 }]);

      const result = await service.getDriverCareerStats(1);

      expect(result.driver.id).toBe(1);
      expect(result.driver.full_name).toBe('Lewis Hamilton');
      expect(result.driver.current_team_name).toBe('Mercedes');
      expect(result.careerStats.wins).toBe(103);
      expect(result.careerStats.podiums).toBe(197);
      expect(result.careerStats.fastestLaps).toBe(65);
      expect(result.careerStats.points).toBe(4639.5);
      expect(result.careerStats.grandsPrixEntered).toBe(330);
      expect(result.careerStats.dnfs).toBe(25);
      expect(result.careerStats.highestRaceFinish).toBe(1);
      expect(result.careerStats.firstRace.year).toBe(2007);
      expect(result.careerStats.firstRace.event).toBe('Australian Grand Prix');
      expect(result.careerStats.winsPerSeason).toHaveLength(3);
      expect(result.currentSeasonStats.wins).toBe(6);
      expect(result.currentSeasonStats.podiums).toBe(17);
      expect(result.currentSeasonStats.standing).toBe('P1');
    });

    it('should handle missing career stats', async () => {
      mockCareerStatsViewRepo.findOne.mockResolvedValue(null);
      mockStandingsViewRepo.findOne.mockResolvedValue(null);
      mockWinsPerSeasonViewRepo.find.mockResolvedValue([]);
      mockRaceResultRepository.findOne.mockResolvedValue(null);
      mockFastestLapViewRepo.count.mockResolvedValue(0);
      mockStandingsViewRepo.find.mockResolvedValue([]);

      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '0' }),
      };

      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      mockDataSource.query.mockResolvedValue([{ bestLapMs: null }]);

      await expect(service.getDriverCareerStats(1)).rejects.toThrow(
        new NotFoundException('Stats not found for driver ID 1')
      );
    });

    it('should handle missing driver', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      mockCareerStatsViewRepo.findOne.mockResolvedValue(null);
      mockStandingsViewRepo.findOne.mockResolvedValue(null);
      mockWinsPerSeasonViewRepo.find.mockResolvedValue([]);
      mockRaceResultRepository.findOne.mockResolvedValue(null);
      mockFastestLapViewRepo.count.mockResolvedValue(0);
      mockStandingsViewRepo.find.mockResolvedValue([]);

      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '0' }),
      };

      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      mockDataSource.query.mockResolvedValue([{ bestLapMs: null }]);

      await expect(service.getDriverCareerStats(1)).rejects.toThrow(
        new NotFoundException('Stats not found for driver ID 1')
      );
    });

    it('should handle missing team information', async () => {
      // Mock all the repository calls
      mockCareerStatsViewRepo.findOne.mockResolvedValue(mockCareerStats);
      mockStandingsViewRepo.findOne.mockResolvedValue(mockCurrentSeason);
      mockWinsPerSeasonViewRepo.find.mockResolvedValue(mockWinsPerSeason);
      mockRaceResultRepository.findOne.mockResolvedValue(mockFirstRace);
      mockFastestLapViewRepo.count.mockResolvedValue(5);
      mockStandingsViewRepo.find.mockResolvedValue(mockStandings);

      const mockRaceResultQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '10' }),
      };

      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockRaceResultQueryBuilder);
      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      mockDataSource.query.mockResolvedValue([{ bestLapMs: 80000 }]);

      const result = await service.getDriverCareerStats(1);

      expect(result.driver.current_team_name).toBeNull();
      expect(result.driver.teamName).toBe('N/A');
    });

    it('should handle missing first race', async () => {
      // Mock all the repository calls
      mockCareerStatsViewRepo.findOne.mockResolvedValue(mockCareerStats);
      mockStandingsViewRepo.findOne.mockResolvedValue(mockCurrentSeason);
      mockWinsPerSeasonViewRepo.find.mockResolvedValue(mockWinsPerSeason);
      mockRaceResultRepository.findOne.mockResolvedValue(null); // No first race
      mockFastestLapViewRepo.count.mockResolvedValue(5);
      mockStandingsViewRepo.find.mockResolvedValue(mockStandings);

      const mockRaceResultQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ teamName: 'Mercedes' }),
      };

      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '10' }),
      };

      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockRaceResultQueryBuilder);
      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      mockDataSource.query.mockResolvedValue([{ bestLapMs: 80000 }]);

      const result = await service.getDriverCareerStats(1);

      expect(result.careerStats.firstRace.year).toBe(0);
      expect(result.careerStats.firstRace.event).toBe('N/A');
    });

    it('should include world championships in career stats', async () => {
      // Mock all the repository calls
      mockCareerStatsViewRepo.findOne.mockResolvedValue({
        ...mockCareerStats,
        championships: 3, // Mock Max Verstappen's championships
      });
      mockStandingsViewRepo.findOne.mockResolvedValue(mockCurrentSeason);
      mockWinsPerSeasonViewRepo.find.mockResolvedValue(mockWinsPerSeason);
      mockRaceResultRepository.findOne.mockResolvedValue(mockFirstRace);
      mockFastestLapViewRepo.count.mockResolvedValue(5);
      mockStandingsViewRepo.find.mockResolvedValue(mockStandings);

      const mockRaceResultQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ teamName: 'Red Bull Racing' }),
      };

      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '10' }),
      };

      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockRaceResultQueryBuilder);
      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      mockDataSource.query.mockResolvedValue([{ bestLapMs: 80000 }]);

      const result = await service.getDriverCareerStats(1);

      expect(result.careerStats.worldChampionships).toBe(3);
    });

    it('should fallback to calculation when world championships not in materialized view', async () => {
      // Mock career stats without world championships
      mockCareerStatsViewRepo.findOne.mockResolvedValue({
        ...mockCareerStats,
        championships: undefined,
      });
      mockStandingsViewRepo.findOne.mockResolvedValue(mockCurrentSeason);
      mockWinsPerSeasonViewRepo.find.mockResolvedValue(mockWinsPerSeason);
      mockRaceResultRepository.findOne.mockResolvedValue(mockFirstRace);
      mockFastestLapViewRepo.count.mockResolvedValue(5);
      mockStandingsViewRepo.find.mockResolvedValue(mockStandings);

      const mockRaceResultQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ teamName: 'Red Bull Racing' }),
        getMany: jest.fn().mockResolvedValue([]), // No seasons found
      };

      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '10' }),
      };

      const mockStandingsQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]), // No seasons found
      };

      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockRaceResultQueryBuilder);
      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockStandingsQueryBuilder);
      mockDataSource.query.mockResolvedValue([{ bestLapMs: 80000 }]);

      const result = await service.getDriverCareerStats(1);

      expect(result.careerStats.worldChampionships).toBe(0);
    });
  });

  describe('getDriverStandings method', () => {
    it('should return driver standings for a season', async () => {
      const mockRawResults = [
        {
          id: '1',
          fullName: 'Max Verstappen',
          number: '1',
          country: 'NL',
          profileImageUrl: 'https://example.com/max.jpg',
          constructor: 'Red Bull Racing',
          points: '575',
          wins: '19',
          podiums: '21',
          position: '1',
          seasonYear: 2023,
        },
        {
          id: '2',
          fullName: 'Sergio Perez',
          number: '11',
          country: 'MX',
          profileImageUrl: 'https://example.com/sergio.jpg',
          constructor: 'Red Bull Racing',
          points: '285',
          wins: '2',
          podiums: '9',
          position: '2',
          seasonYear: 2023,
        },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      };

      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDriverStandings(2023);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        fullName: 'Max Verstappen',
        number: 1,
        country: 'NL',
        profileImageUrl: 'https://example.com/max.jpg',
        constructor: 'Red Bull Racing',
        points: 575,
        wins: 19,
        podiums: 21,
        position: 1,
        seasonYear: 2023,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ds.seasonYear = :season', { season: 2023 });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('ds.seasonPoints', 'DESC');
    });

    it('should handle empty standings', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDriverStandings(2024);

      expect(result).toEqual([]);
    });

    it('should handle missing data in standings', async () => {
      const mockRawResults = [
        {
          id: '1',
          fullName: null,
          number: null,
          country: 'NL',
          profileImageUrl: null,
          constructor: 'Red Bull Racing',
          points: '575',
          wins: '19',
          podiums: '21',
          position: '1',
          seasonYear: 2023,
        },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      };

      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDriverStandings(2023);

      expect(result[0].fullName).toBe('Unknown');
      expect(result[0].number).toBeNull();
      expect(result[0].profileImageUrl).toBeNull();
    });
  });

  describe('getDriverRecentForm method', () => {
    it('should return driver recent form', async () => {
      const mockRawResults = [
        {
          position: 1,
          raceName: 'Monaco Grand Prix',
          countryCode: 'MC',
        },
        {
          position: 3,
          raceName: 'Spanish Grand Prix',
          countryCode: 'ES',
        },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      };

      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock findOne to return a driver
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Driver);

      const result = await service.getDriverRecentForm(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        position: 1,
        raceName: 'Monaco Grand Prix',
        countryCode: 'MC',
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('rr.driver_id = :driverId', { driverId: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('r.date < NOW()');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("s.type = 'RACE'");
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('r.date', 'DESC');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });

    it('should handle driver not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Driver not found'));

      await expect(service.getDriverRecentForm(999)).rejects.toThrow(
        new NotFoundException('Driver not found')
      );
    });

    it('should handle empty recent form', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Driver);

      const result = await service.getDriverRecentForm(1);

      expect(result).toEqual([]);
    });
  });

  describe('getDriverStats method', () => {
    it('should return career stats without year', async () => {
      const mockCareerRaceStats = {
        wins: '103',
        podiums: '197',
        fastest_laps: '65',
        points: '4639.5',
        dnfs: '25',
      };

      const mockCareerSprintStats = {
        sprint_wins: '5',
        sprint_podiums: '8',
      };

      const mockRaceQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockCareerRaceStats),
      };

      const mockSprintQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockCareerSprintStats),
      };

      mockRaceResultRepository.createQueryBuilder
        .mockReturnValueOnce(mockRaceQueryBuilder)
        .mockReturnValueOnce(mockSprintQueryBuilder);

      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Driver);

      const result = await service.getDriverStats(1);

      expect(result.driverId).toBe(1);
      expect(result.year).toBeNull();
      expect(result.career.wins).toBe(103);
      expect(result.career.podiums).toBe(197);
      expect(result.career.fastestLaps).toBe(65);
      expect(result.career.points).toBe(4639.5);
      expect(result.career.dnfs).toBe(25);
      expect(result.career.sprintWins).toBe(5);
      expect(result.career.sprintPodiums).toBe(8);
      expect(result.yearStats).toBeNull();
    });

    it('should return career and year stats with year parameter', async () => {
      const mockCareerRaceStats = {
        wins: '103',
        podiums: '197',
        fastest_laps: '65',
        points: '4639.5',
        dnfs: '25',
      };

      const mockCareerSprintStats = {
        sprint_wins: '5',
        sprint_podiums: '8',
      };

      const mockYearRaceStats = {
        wins: '6',
        podiums: '17',
        fastest_laps: '5',
        points: '234',
        dnfs: '1',
      };

      const mockYearSprintStats = {
        sprint_wins: '1',
        sprint_podiums: '2',
      };

      const mockYearPolesStats = {
        poles: '6',
      };

      const mockRaceQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockCareerRaceStats),
      };

      const mockSprintQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockCareerSprintStats),
      };

      const mockYearRaceQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockYearRaceStats),
      };

      const mockYearSprintQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockYearSprintStats),
      };

      const mockYearPolesQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockYearPolesStats),
      };

      mockRaceResultRepository.createQueryBuilder
        .mockReturnValueOnce(mockRaceQueryBuilder)
        .mockReturnValueOnce(mockSprintQueryBuilder)
        .mockReturnValueOnce(mockYearRaceQueryBuilder)
        .mockReturnValueOnce(mockYearSprintQueryBuilder);

      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockYearPolesQueryBuilder);

      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Driver);

      const result = await service.getDriverStats(1, 2023);

      expect(result.driverId).toBe(1);
      expect(result.year).toBe(2023);
      expect(result.career.wins).toBe(103);
      expect(result.yearStats.wins).toBe(6);
      expect(result.yearStats.podiums).toBe(17);
      expect(result.yearStats.fastestLaps).toBe(5);
      expect(result.yearStats.points).toBe(234);
      expect(result.yearStats.dnfs).toBe(1);
      expect(result.yearStats.sprintWins).toBe(1);
      expect(result.yearStats.sprintPodiums).toBe(2);
      expect(result.yearStats.poles).toBe(6);
    });

    it('should handle driver not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Driver not found'));

      await expect(service.getDriverStats(999)).rejects.toThrow(
        new NotFoundException('Driver not found')
      );
    });

    it('should handle missing stats data', async () => {
      const mockRaceQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      const mockSprintQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      mockRaceResultRepository.createQueryBuilder
        .mockReturnValueOnce(mockRaceQueryBuilder)
        .mockReturnValueOnce(mockSprintQueryBuilder);

      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Driver);

      const result = await service.getDriverStats(1);

      expect(result.career.wins).toBe(0);
      expect(result.career.podiums).toBe(0);
      expect(result.career.fastestLaps).toBe(0);
      expect(result.career.points).toBe(0);
      expect(result.career.dnfs).toBe(0);
      expect(result.career.sprintWins).toBe(0);
      expect(result.career.sprintPodiums).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      mockStandingsViewRepo.find.mockResolvedValue([
        { driverId: 1 },
      ]);
      
      // Mock driver repository to throw error
      mockDriverRepository.find.mockRejectedValue(new Error('Connection failed'));

      await expect(service.findAll()).rejects.toThrow('Connection failed');
    });

    it('should handle repository query errors', async () => {
      mockDriverRepository.findOne.mockRejectedValue(new Error('Query failed'));

      await expect(service.findOne(1)).rejects.toThrow('Query failed');
    });

    it('should handle complex query errors', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Driver);
      
      // Mock careerStatsViewRepo.findOne to reject - this is the first Promise in Promise.all
      // When any promise in Promise.all rejects, the whole Promise.all rejects immediately
      mockCareerStatsViewRepo.findOne.mockRejectedValue(new Error('Stats query failed'));
      
      // Mock standingsViewRepo to prevent hanging (even though Promise.all should reject first)
      mockStandingsViewRepo.findOne.mockResolvedValue(null);
      mockStandingsViewRepo.find.mockResolvedValue([]);
      
      // Mock other repos to prevent hanging
      mockWinsPerSeasonViewRepo.find.mockResolvedValue([]);
      mockRaceResultRepository.findOne.mockResolvedValue(null);
      mockFastestLapViewRepo.count.mockResolvedValue(0);
      
      // Mock query builders for race results (for team name query)
      const mockRaceResultQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      mockRaceResultRepository.createQueryBuilder.mockReturnValue(mockRaceResultQueryBuilder);
      
      // Mock query builders for qualifying results
      const mockQualifyingQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ poles: '0' }),
      };
      mockQualifyingResultRepository.createQueryBuilder.mockReturnValue(mockQualifyingQueryBuilder);
      
      // Mock dataSource query
      mockDataSource.query.mockResolvedValue([{ bestLapMs: null }]);

      await expect(service.getDriverCareerStats(1)).rejects.toThrow('Stats query failed');
    });
  });

  describe('Data Transformation', () => {
    it('should transform driver data correctly', async () => {
      const mockDrivers: Driver[] = [
        {
          id: 1,
          first_name: 'Lewis',
          last_name: 'Hamilton',
          name_acronym: 'HAM',
          driver_number: 44,
          country_code: 'GB',
          date_of_birth: new Date('1985-01-07'),
          profile_image_url: 'https://example.com/lewis.jpg',
          bio: 'Seven-time World Champion',
          fun_fact: 'Started racing at age 8',
          country: { country_code: 'GB', country_name: 'Great Britain' },
        } as Driver,
      ];

      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      mockStandingsViewRepo.find.mockResolvedValue([
        { driverId: 1 },
      ]);
      
      // Mock driver repository
      mockDriverRepository.find.mockResolvedValue(mockDrivers);

      const result = await service.findAll();

      expect(result[0]).toMatchObject({
        id: 1,
        full_name: 'Lewis Hamilton',
        given_name: 'Lewis',
        family_name: 'Hamilton',
        code: 'HAM',
        current_team_name: null,
        image_url: 'https://example.com/lewis.jpg',
        team_color: null,
        country_code: 'GB',
        driver_number: 44,
        date_of_birth: new Date('1985-01-07'),
        bio: 'Seven-time World Champion',
        fun_fact: 'Started racing at age 8',
      });
    });

    it('should handle missing optional fields', async () => {
      const mockDrivers: Driver[] = [
        {
          id: 1,
          first_name: null,
          last_name: null,
          name_acronym: null,
          driver_number: null,
          country_code: null,
          date_of_birth: null,
          profile_image_url: null,
          bio: null,
          fun_fact: null,
          country: null,
        } as Driver,
      ];

      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      mockStandingsViewRepo.find.mockResolvedValue([
        { driverId: 1 },
      ]);
      
      // Mock driver repository
      mockDriverRepository.find.mockResolvedValue(mockDrivers);

      const result = await service.findAll();

      expect(result[0].full_name).toBe('Driver 1');
      expect(result[0].given_name).toBeNull();
      expect(result[0].family_name).toBeNull();
      expect(result[0].code).toBeNull();
      expect(result[0].current_team_name).toBeNull();
      expect(result[0].image_url).toBeNull();
      expect(result[0].team_color).toBeNull();
      expect(result[0].country_code).toBeNull();
      expect(result[0].driver_number).toBeNull();
      expect(result[0].date_of_birth).toBeNull();
      expect(result[0].bio).toBeNull();
      expect(result[0].fun_fact).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDriverList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        first_name: `Driver${i + 1}`,
        last_name: 'Test',
        name_acronym: `D${i + 1}`,
        driver_number: i + 1,
        country_code: 'GB',
        date_of_birth: new Date('1990-01-01'),
        profile_image_url: null,
        bio: null,
        fun_fact: null,
        country: null,
      }));

      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2024 }),
      };
      mockStandingsViewRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      const standingsData = Array.from({ length: 1000 }, (_, i) => ({ driverId: i + 1 }));
      mockStandingsViewRepo.find.mockResolvedValue(standingsData);
      
      // Mock driver repository
      mockDriverRepository.find.mockResolvedValue(largeDriverList);

      const startTime = Date.now();
      const result = await service.findAll();
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
