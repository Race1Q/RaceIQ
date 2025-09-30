import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { Driver } from './drivers.entity';
import { DriverStatsResponseDto, DriverComparisonStatsResponseDto } from './dto/driver-stats.dto';

describe('DriversController', () => {
  let controller: DriversController;
  let service: DriversService;

  const mockDriversService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getDriverStats: jest.fn(),
    getDriverCareerStats: jest.fn(),
    getDriverRecentForm: jest.fn(),
    getDriverStandings: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriversController],
      providers: [
        {
          provide: DriversService,
          useValue: mockDriversService,
        },
      ],
    }).compile();

    controller = module.get<DriversController>(DriversController);
    service = module.get<DriversService>(DriversService);
  });

  describe('Class Structure', () => {
    it('should be defined', () => {
      expect(DriversController).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof DriversController).toBe('function');
    });

    it('should be instantiable', () => {
      expect(controller).toBeInstanceOf(DriversController);
    });

    it('should have DriversService injected', () => {
      expect(controller).toHaveProperty('driversService');
    });
  });

  describe('findAll method', () => {
    it('should return all drivers', async () => {
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
        } as Driver,
      ];

      mockDriversService.findAll.mockResolvedValue(mockDrivers);

      const result = await controller.findAll();

      expect(result).toEqual(mockDrivers);
      expect(mockDriversService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty drivers list', async () => {
      mockDriversService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockDriversService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      mockDriversService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
      expect(mockDriversService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne method', () => {
    it('should return a single driver by ID', async () => {
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

      mockDriversService.findOne.mockResolvedValue(mockDriver);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockDriver);
      expect(mockDriversService.findOne).toHaveBeenCalledWith(1);
      expect(mockDriversService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle driver not found', async () => {
      mockDriversService.findOne.mockRejectedValue(new Error('Driver not found'));

      await expect(controller.findOne(999)).rejects.toThrow('Driver not found');
      expect(mockDriversService.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle invalid ID parameter', async () => {
      // Test with different ID types
      const testIds = [1, 2, 100, 999];
      
      for (const id of testIds) {
        mockDriversService.findOne.mockResolvedValue({ id } as Driver);
        
        const result = await controller.findOne(id);
        expect(result.id).toBe(id);
        expect(mockDriversService.findOne).toHaveBeenCalledWith(id);
      }
    });
  });

  describe('getDriverStats method', () => {
    it('should return driver stats without year parameter', async () => {
      const mockStats: DriverComparisonStatsResponseDto = {
        driverId: 1,
        year: null,
        career: {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          dnfs: 25,
          sprintWins: 5,
          sprintPodiums: 8,
        },
        yearStats: null,
      };

      mockDriversService.getDriverStats.mockResolvedValue(mockStats);

      const result = await controller.getDriverStats(1);

      expect(result).toEqual(mockStats);
      expect(mockDriversService.getDriverStats).toHaveBeenCalledWith(1, undefined);
      expect(mockDriversService.getDriverStats).toHaveBeenCalledTimes(1);
    });

    it('should return driver stats with year parameter', async () => {
      const mockStats: DriverComparisonStatsResponseDto = {
        driverId: 1,
        year: 2023,
        career: {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          dnfs: 25,
          sprintWins: 5,
          sprintPodiums: 8,
        },
        yearStats: {
          wins: 6,
          podiums: 17,
          fastestLaps: 5,
          points: 234,
          dnfs: 1,
          sprintWins: 1,
          sprintPodiums: 2,
          poles: 6,
        },
      };

      mockDriversService.getDriverStats.mockResolvedValue(mockStats);

      const result = await controller.getDriverStats(1, '2023');

      expect(result).toEqual(mockStats);
      expect(mockDriversService.getDriverStats).toHaveBeenCalledWith(1, 2023);
      expect(mockDriversService.getDriverStats).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid year parameter', async () => {
      const mockStats: DriverComparisonStatsResponseDto = {
        driverId: 1,
        year: null,
        career: {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          dnfs: 25,
          sprintWins: 5,
          sprintPodiums: 8,
        },
        yearStats: null,
      };

      mockDriversService.getDriverStats.mockResolvedValue(mockStats);

      // Test with invalid year string
      const result = await controller.getDriverStats(1, 'invalid');

      expect(result).toEqual(mockStats);
      expect(mockDriversService.getDriverStats).toHaveBeenCalledWith(1, NaN);
    });

    it('should handle service errors', async () => {
      mockDriversService.getDriverStats.mockRejectedValue(new Error('Stats not found'));

      await expect(controller.getDriverStats(999)).rejects.toThrow('Stats not found');
      expect(mockDriversService.getDriverStats).toHaveBeenCalledWith(999, undefined);
    });
  });

  describe('getDriverCareerStats method', () => {
    it('should return driver career stats', async () => {
      const mockCareerStats: DriverStatsResponseDto = {
        driver: {
          id: 1,
          full_name: 'Lewis Hamilton',
          given_name: 'Lewis',
          family_name: 'Hamilton',
          code: 'HAM',
          current_team_name: 'Mercedes',
          image_url: 'https://example.com/lewis.jpg',
          team_color: '#00D2BE',
          country_code: 'GB',
          driver_number: 44,
          date_of_birth: new Date('1985-01-07'),
          bio: 'Seven-time World Champion',
          fun_fact: 'Started racing at age 8',
        },
        careerStats: {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          grandsPrixEntered: 330,
          dnfs: 25,
          highestRaceFinish: 1,
          firstRace: {
            year: 2007,
            event: 'Australian Grand Prix',
          },
          winsPerSeason: [
            { season: 2023, wins: 6 },
            { season: 2022, wins: 0 },
            { season: 2021, wins: 8 },
          ],
        },
        currentSeasonStats: {
          wins: 6,
          podiums: 17,
          fastestLaps: 5,
          standing: 'P3',
        },
      };

      mockDriversService.getDriverCareerStats.mockResolvedValue(mockCareerStats);

      const result = await controller.getDriverCareerStats(1);

      expect(result).toEqual(mockCareerStats);
      expect(mockDriversService.getDriverCareerStats).toHaveBeenCalledWith(1);
      expect(mockDriversService.getDriverCareerStats).toHaveBeenCalledTimes(1);
    });

    it('should handle driver not found for career stats', async () => {
      mockDriversService.getDriverCareerStats.mockRejectedValue(new Error('Driver not found'));

      await expect(controller.getDriverCareerStats(999)).rejects.toThrow('Driver not found');
      expect(mockDriversService.getDriverCareerStats).toHaveBeenCalledWith(999);
    });
  });

  describe('getDriverRecentForm method', () => {
    it('should return driver recent form', async () => {
      const mockRecentForm = [
        { position: 1, raceName: 'Monaco Grand Prix', countryCode: 'MC' },
        { position: 3, raceName: 'Spanish Grand Prix', countryCode: 'ES' },
        { position: 2, raceName: 'Canadian Grand Prix', countryCode: 'CA' },
        { position: 4, raceName: 'British Grand Prix', countryCode: 'GB' },
        { position: 1, raceName: 'Austrian Grand Prix', countryCode: 'AT' },
      ];

      mockDriversService.getDriverRecentForm.mockResolvedValue(mockRecentForm);

      const result = await controller.getDriverRecentForm(1);

      expect(result).toEqual(mockRecentForm);
      expect(mockDriversService.getDriverRecentForm).toHaveBeenCalledWith(1);
      expect(mockDriversService.getDriverRecentForm).toHaveBeenCalledTimes(1);
    });

    it('should handle empty recent form', async () => {
      mockDriversService.getDriverRecentForm.mockResolvedValue([]);

      const result = await controller.getDriverRecentForm(1);

      expect(result).toEqual([]);
      expect(mockDriversService.getDriverRecentForm).toHaveBeenCalledWith(1);
    });

    it('should handle driver not found for recent form', async () => {
      mockDriversService.getDriverRecentForm.mockRejectedValue(new Error('Driver not found'));

      await expect(controller.getDriverRecentForm(999)).rejects.toThrow('Driver not found');
      expect(mockDriversService.getDriverRecentForm).toHaveBeenCalledWith(999);
    });
  });

  describe('getDriverStandings method', () => {
    it('should return driver standings for a season', async () => {
      const mockStandings = [
        {
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
        },
        {
          id: 2,
          fullName: 'Sergio Perez',
          number: 11,
          country: 'MX',
          profileImageUrl: 'https://example.com/sergio.jpg',
          constructor: 'Red Bull Racing',
          points: 285,
          wins: 2,
          podiums: 9,
          position: 2,
          seasonYear: 2023,
        },
      ];

      mockDriversService.getDriverStandings.mockResolvedValue(mockStandings);

      const result = await controller.getDriverStandings(2023);

      expect(result).toEqual(mockStandings);
      expect(mockDriversService.getDriverStandings).toHaveBeenCalledWith(2023);
      expect(mockDriversService.getDriverStandings).toHaveBeenCalledTimes(1);
    });

    it('should handle empty standings', async () => {
      mockDriversService.getDriverStandings.mockResolvedValue([]);

      const result = await controller.getDriverStandings(2024);

      expect(result).toEqual([]);
      expect(mockDriversService.getDriverStandings).toHaveBeenCalledWith(2024);
    });

    it('should handle invalid season parameter', async () => {
      mockDriversService.getDriverStandings.mockResolvedValue([]);

      const result = await controller.getDriverStandings(1990);

      expect(result).toEqual([]);
      expect(mockDriversService.getDriverStandings).toHaveBeenCalledWith(1990);
    });

    it('should handle service errors', async () => {
      mockDriversService.getDriverStandings.mockRejectedValue(new Error('Season not found'));

      await expect(controller.getDriverStandings(2024)).rejects.toThrow('Season not found');
      expect(mockDriversService.getDriverStandings).toHaveBeenCalledWith(2024);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle ParseIntPipe for ID parameters', async () => {
      const mockDriver: Driver = { id: 1, first_name: 'Test' } as Driver;
      mockDriversService.findOne.mockResolvedValue(mockDriver);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockDriver);
      expect(mockDriversService.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle ParseIntPipe for season parameters', async () => {
      const mockStandings = [];
      mockDriversService.getDriverStandings.mockResolvedValue(mockStandings);

      const result = await controller.getDriverStandings(2023);

      expect(result).toEqual(mockStandings);
      expect(mockDriversService.getDriverStandings).toHaveBeenCalledWith(2023);
    });

    it('should handle optional year query parameter', async () => {
      const mockStats: DriverComparisonStatsResponseDto = {
        driverId: 1,
        year: 2023,
        career: {
          wins: 103,
          podiums: 197,
          fastestLaps: 65,
          points: 4639.5,
          dnfs: 25,
          sprintWins: 5,
          sprintPodiums: 8,
        },
        yearStats: {
          wins: 6,
          podiums: 17,
          fastestLaps: 5,
          points: 234,
          dnfs: 1,
          sprintWins: 1,
          sprintPodiums: 2,
          poles: 6,
        },
      };

      mockDriversService.getDriverStats.mockResolvedValue(mockStats);

      // Test with year parameter
      await controller.getDriverStats(1, '2023');
      expect(mockDriversService.getDriverStats).toHaveBeenCalledWith(1, 2023);

      // Test without year parameter
      await controller.getDriverStats(1);
      expect(mockDriversService.getDriverStats).toHaveBeenCalledWith(1, undefined);
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Database connection failed');
      mockDriversService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle NotFoundException from service', async () => {
      const error = new Error('Driver with ID 999 not found');
      mockDriversService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(999)).rejects.toThrow('Driver with ID 999 not found');
    });
  });

  describe('Method Integration', () => {
    it('should call service methods with correct parameters', async () => {
      // Test all methods to ensure they call the service correctly
      const mockDriver: Driver = { id: 1, first_name: 'Test' } as Driver;
      const mockStats: DriverComparisonStatsResponseDto = {
        driverId: 1,
        year: null,
        career: { wins: 0, podiums: 0, fastestLaps: 0, points: 0, dnfs: 0, sprintWins: 0, sprintPodiums: 0 },
        yearStats: null,
      };
      const mockCareerStats: DriverStatsResponseDto = {
        driver: {} as any,
        careerStats: {} as any,
        currentSeasonStats: {} as any,
      };
      const mockRecentForm = [];
      const mockStandings = [];

      mockDriversService.findAll.mockResolvedValue([mockDriver]);
      mockDriversService.findOne.mockResolvedValue(mockDriver);
      mockDriversService.getDriverStats.mockResolvedValue(mockStats);
      mockDriversService.getDriverCareerStats.mockResolvedValue(mockCareerStats);
      mockDriversService.getDriverRecentForm.mockResolvedValue(mockRecentForm);
      mockDriversService.getDriverStandings.mockResolvedValue(mockStandings);

      await controller.findAll();
      await controller.findOne(1);
      await controller.getDriverStats(1, '2023');
      await controller.getDriverCareerStats(1);
      await controller.getDriverRecentForm(1);
      await controller.getDriverStandings(2023);

      expect(mockDriversService.findAll).toHaveBeenCalledTimes(1);
      expect(mockDriversService.findOne).toHaveBeenCalledWith(1);
      expect(mockDriversService.getDriverStats).toHaveBeenCalledWith(1, 2023);
      expect(mockDriversService.getDriverCareerStats).toHaveBeenCalledWith(1);
      expect(mockDriversService.getDriverRecentForm).toHaveBeenCalledWith(1);
      expect(mockDriversService.getDriverStandings).toHaveBeenCalledWith(2023);
    });
  });
});
