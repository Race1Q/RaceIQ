import { Test, TestingModule } from '@nestjs/testing';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { StandingsResponseDto } from './dto/standings-response.dto';
import { FeaturedDriverDto } from './dto/featured-driver.dto';
import { NotFoundException } from '@nestjs/common';

describe('StandingsController', () => {
  let controller: StandingsController;
  let standingsService: jest.Mocked<StandingsService>;

  const mockStandingsResponse: StandingsResponseDto = {
    driverStandings: [
      {
        position: 1,
        points: 500,
        wins: 10,
        constructorName: 'Red Bull Racing',
        driverId: 1,
        driverFullName: 'Max Verstappen',
        driverNumber: 1,
        driverCountryCode: 'NLD',
        driverProfileImageUrl: 'http://example.com/verstappen.jpg',
      },
      {
        position: 2,
        points: 350,
        wins: 5,
        constructorName: 'Red Bull Racing',
        driverId: 2,
        driverFullName: 'Sergio Perez',
        driverNumber: 11,
        driverCountryCode: 'MEX',
        driverProfileImageUrl: 'http://example.com/perez.jpg',
      },
    ],
    constructorStandings: [
      {
        position: 1,
        points: 850,
        wins: 15,
        team: {
          id: 1,
          name: 'Red Bull Racing',
          nationality: 'Austrian',
          url: 'https://www.redbullracing.com',
          logoUrl: 'https://example.com/redbull-logo.png',
        },
      },
    ],
  };

  const mockFeaturedDriver: FeaturedDriverDto = {
    driverId: 1,
    driverFullName: 'Max Verstappen',
    driverNumber: 1,
    driverCountryCode: 'NLD',
    driverProfileImageUrl: 'http://example.com/verstappen.jpg',
    constructorName: 'Red Bull Racing',
    seasonPoints: 500,
    seasonWins: 10,
    recentForm: [
      { raceName: 'Monaco GP', position: 1, points: 25 },
      { raceName: 'Spanish GP', position: 2, points: 18 },
    ],
  };

  beforeEach(async () => {
    const mockStandingsService = {
      getStandingsByYearAndRound: jest.fn(),
      getStandingsByYear: jest.fn(),
      getFeaturedDriver: jest.fn(),
      getFeaturedDriverDebug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StandingsController],
      providers: [
        {
          provide: StandingsService,
          useValue: mockStandingsService,
        },
      ],
    }).compile();

    controller = module.get<StandingsController>(StandingsController);
    standingsService = module.get(StandingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should be an instance of StandingsController', () => {
      expect(controller).toBeInstanceOf(StandingsController);
    });
  });

  describe('get2025DriverStandings', () => {
    it('should return 2025 driver standings', async () => {
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsResponse);

      const result = await controller.get2025DriverStandings();

      expect(result).toEqual(mockStandingsResponse);
      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(2025);
      expect(standingsService.getStandingsByYear).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      const error = new NotFoundException('Season 2025 not found');
      standingsService.getStandingsByYear.mockRejectedValue(error);

      await expect(controller.get2025DriverStandings()).rejects.toThrow(NotFoundException);
      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(2025);
    });

    it('should return empty standings when no data available', async () => {
      const emptyResponse: StandingsResponseDto = {
        driverStandings: [],
        constructorStandings: [],
      };
      standingsService.getStandingsByYear.mockResolvedValue(emptyResponse);

      const result = await controller.get2025DriverStandings();

      expect(result).toEqual(emptyResponse);
      expect(result.driverStandings).toHaveLength(0);
      expect(result.constructorStandings).toHaveLength(0);
    });

    it('should call service with correct year parameter', async () => {
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsResponse);

      await controller.get2025DriverStandings();

      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(2025);
      expect(standingsService.getStandingsByYear).not.toHaveBeenCalledWith(2024);
      expect(standingsService.getStandingsByYear).not.toHaveBeenCalledWith(2026);
    });
  });

  describe('getFeaturedDriver', () => {
    it('should return featured driver data', async () => {
      standingsService.getFeaturedDriver.mockResolvedValue(mockFeaturedDriver);

      const result = await controller.getFeaturedDriver();

      expect(result).toEqual(mockFeaturedDriver);
      expect(standingsService.getFeaturedDriver).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Failed to get featured driver');
      standingsService.getFeaturedDriver.mockRejectedValue(error);

      await expect(controller.getFeaturedDriver()).rejects.toThrow('Failed to get featured driver');
    });
  });

  describe('getFeaturedDriverDebug', () => {
    it('should return debug data', async () => {
      const debugData = { debug: 'test data' };
      standingsService.getFeaturedDriverDebug.mockResolvedValue(debugData);

      const result = await controller.getFeaturedDriverDebug();

      expect(result).toEqual(debugData);
      expect(standingsService.getFeaturedDriverDebug).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStandings', () => {
    it('should return standings for specific year and round', async () => {
      standingsService.getStandingsByYearAndRound.mockResolvedValue(mockStandingsResponse);

      const result = await controller.getStandings(2023, 10);

      expect(result).toEqual(mockStandingsResponse);
      expect(standingsService.getStandingsByYearAndRound).toHaveBeenCalledWith(2023, 10);
    });

    it('should handle different year and round combinations', async () => {
      standingsService.getStandingsByYearAndRound.mockResolvedValue(mockStandingsResponse);

      await controller.getStandings(2024, 5);
      await controller.getStandings(2022, 22);

      expect(standingsService.getStandingsByYearAndRound).toHaveBeenCalledWith(2024, 5);
      expect(standingsService.getStandingsByYearAndRound).toHaveBeenCalledWith(2022, 22);
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('Standings not found');
      standingsService.getStandingsByYearAndRound.mockRejectedValue(error);

      await expect(controller.getStandings(2023, 10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStandingsByYear', () => {
    it('should return standings for specific year', async () => {
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsResponse);

      const result = await controller.getStandingsByYear(2023);

      expect(result).toEqual(mockStandingsResponse);
      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(2023);
    });

    it('should handle different years', async () => {
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsResponse);

      await controller.getStandingsByYear(2024);
      await controller.getStandingsByYear(2022);

      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(2024);
      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(2022);
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('Season not found');
      standingsService.getStandingsByYear.mockRejectedValue(error);

      await expect(controller.getStandingsByYear(2023)).rejects.toThrow(NotFoundException);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors for get2025DriverStandings', async () => {
      const error = new Error('Database connection failed');
      standingsService.getStandingsByYear.mockRejectedValue(error);

      await expect(controller.get2025DriverStandings()).rejects.toThrow('Database connection failed');
    });

    it('should propagate service errors for getFeaturedDriver', async () => {
      const error = new Error('Service unavailable');
      standingsService.getFeaturedDriver.mockRejectedValue(error);

      await expect(controller.getFeaturedDriver()).rejects.toThrow('Service unavailable');
    });

    it('should propagate service errors for getStandings', async () => {
      const error = new Error('Invalid parameters');
      standingsService.getStandingsByYearAndRound.mockRejectedValue(error);

      await expect(controller.getStandings(2023, 10)).rejects.toThrow('Invalid parameters');
    });

    it('should propagate service errors for getStandingsByYear', async () => {
      const error = new Error('Data processing failed');
      standingsService.getStandingsByYear.mockRejectedValue(error);

      await expect(controller.getStandingsByYear(2023)).rejects.toThrow('Data processing failed');
    });
  });

  describe('service method calls', () => {
    it('should call correct service method for each endpoint', async () => {
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsResponse);
      standingsService.getFeaturedDriver.mockResolvedValue(mockFeaturedDriver);
      standingsService.getStandingsByYearAndRound.mockResolvedValue(mockStandingsResponse);

      await controller.get2025DriverStandings();
      await controller.getFeaturedDriver();
      await controller.getStandings(2023, 10);
      await controller.getStandingsByYear(2023);

      expect(standingsService.getStandingsByYear).toHaveBeenCalledTimes(2);
      expect(standingsService.getFeaturedDriver).toHaveBeenCalledTimes(1);
      expect(standingsService.getStandingsByYearAndRound).toHaveBeenCalledTimes(1);
    });

    it('should not call wrong service methods', async () => {
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsResponse);

      await controller.get2025DriverStandings();

      expect(standingsService.getFeaturedDriver).not.toHaveBeenCalled();
      expect(standingsService.getStandingsByYearAndRound).not.toHaveBeenCalled();
    });
  });
});
