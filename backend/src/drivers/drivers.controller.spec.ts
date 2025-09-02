import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { 
  DriverResponseDto, 
  DriverStandingsResponseDto, 
  DriverDetailsResponseDto, 
  DriverPerformanceResponseDto 
} from './dto';

describe('DriversController', () => {
  let controller: DriversController;
  let service: DriversService;

  const mockDriversService = {
    getAllDrivers: jest.fn(),
    searchDrivers: jest.fn(),
    findDriversByStandings: jest.fn(),
    findOneDetails: jest.fn(),
    findOnePerformance: jest.fn(),
  };

  const mockDriver: DriverResponseDto = {
    id: 1,
    driver_number: 44,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    name_acronym: 'HAM',
    country_code: 'GB',
    date_of_birth: '1985-01-07',
    full_name: 'Lewis Hamilton',
  };

  const mockDriverStandings: DriverStandingsResponseDto = {
    driver_id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    driver_number: 44,
    constructor_name: 'Mercedes',
    points: 100,
    position: 1,
    season: 2024,
  };

  const mockDriverDetails: DriverDetailsResponseDto = {
    driver_id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    driver_number: 44,
    country_name: 'Great Britain',
    date_of_birth: '1985-01-07',
    total_races: 300,
    total_wins: 103,
    total_podiums: 197,
    total_points: 4639.5,
    world_championships: 7,
    current_constructor: 'Mercedes',
  };

  const mockDriverPerformance: DriverPerformanceResponseDto = {
    driver_id: 1,
    season: '2024',
    races: 10,
    wins: 2,
    podiums: 5,
    points: 150,
    position: 3,
    constructor_name: 'Mercedes',
    best_finish: 2,
    fastest_laps: 1,
    pole_positions: 1,
  };

  beforeEach(async () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDrivers', () => {
    it('should return all drivers', async () => {
      const drivers = [mockDriver];
      mockDriversService.getAllDrivers.mockResolvedValue(drivers);

      const result = await controller.getAllDrivers();

      expect(result).toEqual(drivers);
      expect(service.getAllDrivers).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no drivers exist', async () => {
      mockDriversService.getAllDrivers.mockResolvedValue([]);

      const result = await controller.getAllDrivers();

      expect(result).toEqual([]);
      expect(service.getAllDrivers).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchDrivers', () => {
    it('should return matching drivers when query is provided', async () => {
      const query = 'ham';
      const drivers = [mockDriver];
      mockDriversService.searchDrivers.mockResolvedValue(drivers);

      const result = await controller.searchDrivers(query);

      expect(result).toEqual(drivers);
      expect(service.searchDrivers).toHaveBeenCalledWith(query);
    });

    it('should return empty array when query is empty', async () => {
      const query = '';

      const result = await controller.searchDrivers(query);

      expect(result).toEqual([]);
      expect(service.searchDrivers).not.toHaveBeenCalled();
    });

    it('should return empty array when query is null', async () => {
      const query = null as any;

      const result = await controller.searchDrivers(query);

      expect(result).toEqual([]);
      expect(service.searchDrivers).not.toHaveBeenCalled();
    });

    it('should return empty array when query is undefined', async () => {
      const query = undefined as any;

      const result = await controller.searchDrivers(query);

      expect(result).toEqual([]);
      expect(service.searchDrivers).not.toHaveBeenCalled();
    });
  });

  describe('findDriversByStandings', () => {
    it('should return drivers sorted by standings for a specific season', async () => {
      const season = 2024;
      const drivers = [mockDriverStandings];
      mockDriversService.findDriversByStandings.mockResolvedValue(drivers);

      const result = await controller.findDriversByStandings(season);

      expect(result).toEqual(drivers);
      expect(service.findDriversByStandings).toHaveBeenCalledWith(season);
    });

    it('should handle different season values', async () => {
      const season = 2023;
      const drivers = [mockDriverStandings];
      mockDriversService.findDriversByStandings.mockResolvedValue(drivers);

      const result = await controller.findDriversByStandings(season);

      expect(result).toEqual(drivers);
      expect(service.findDriversByStandings).toHaveBeenCalledWith(season);
    });
  });

  describe('findOneDetails', () => {
    it('should return detailed information for a specific driver', async () => {
      const driverId = 1;
      mockDriversService.findOneDetails.mockResolvedValue(mockDriverDetails);

      const result = await controller.findOneDetails(driverId);

      expect(result).toEqual(mockDriverDetails);
      expect(service.findOneDetails).toHaveBeenCalledWith(driverId);
    });

    it('should handle different driver IDs', async () => {
      const driverId = 2;
      mockDriversService.findOneDetails.mockResolvedValue(mockDriverDetails);

      const result = await controller.findOneDetails(driverId);

      expect(result).toEqual(mockDriverDetails);
      expect(service.findOneDetails).toHaveBeenCalledWith(driverId);
    });
  });

  describe('findOnePerformance', () => {
    it('should return performance statistics for a specific driver and season', async () => {
      const driverId = 1;
      const season = '2024';
      mockDriversService.findOnePerformance.mockResolvedValue(mockDriverPerformance);

      const result = await controller.findOnePerformance(driverId, season);

      expect(result).toEqual(mockDriverPerformance);
      expect(service.findOnePerformance).toHaveBeenCalledWith(driverId, season);
    });

    it('should handle different driver IDs and seasons', async () => {
      const driverId = 2;
      const season = '2023';
      mockDriversService.findOnePerformance.mockResolvedValue(mockDriverPerformance);

      const result = await controller.findOnePerformance(driverId, season);

      expect(result).toEqual(mockDriverPerformance);
      expect(service.findOnePerformance).toHaveBeenCalledWith(driverId, season);
    });
  });
});
