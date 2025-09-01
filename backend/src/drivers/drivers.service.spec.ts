import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DriversService } from './drivers.service';
import { SupabaseService } from '../supabase/supabase.service';
import { InternalServerErrorException } from '@nestjs/common';
import { 
  DriverResponseDto, 
  DriverStandingsResponseDto, 
  DriverDetailsResponseDto, 
  DriverPerformanceResponseDto 
} from './dto';

describe('DriversService', () => {
  let service: DriversService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    client: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            order: jest.fn(),
          })),
        })),
      })),
      rpc: jest.fn(),
    },
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
      providers: [
        DriversService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllDrivers', () => {
    it('should return all drivers successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        data: [mockDriver],
        error: null,
      });

      mockSupabaseService.client.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getAllDrivers();

      expect(result).toEqual([mockDriver]);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('drivers');
      expect(mockSelect).toHaveBeenCalledWith('id, driver_number, first_name, last_name, name_acronym, country_code, date_of_birth');
    });

    it('should return empty array when no drivers exist', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        data: [],
        error: null,
      });

      mockSupabaseService.client.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getAllDrivers();

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        data: null,
        error: null,
      });

      mockSupabaseService.client.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getAllDrivers();

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when Supabase returns an error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      mockSupabaseService.client.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(service.getAllDrivers()).rejects.toThrow(InternalServerErrorException);
      await expect(service.getAllDrivers()).rejects.toThrow('Failed to fetch all drivers');
    });
  });

  describe('searchDrivers', () => {
    it('should return matching drivers successfully', async () => {
      const query = 'ham';
      const mockSelect = jest.fn().mockReturnValue({
        or: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            data: [mockDriver],
            error: null,
          }),
        }),
      });

      mockSupabaseService.client.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await service.searchDrivers(query);

      expect(result).toEqual([mockDriver]);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('drivers');
      expect(mockSelect).toHaveBeenCalledWith('id, driver_number, first_name, last_name, name_acronym, country_code, date_of_birth');
    });

    it('should return empty array when no matching drivers found', async () => {
      const query = 'nonexistent';
      const mockSelect = jest.fn().mockReturnValue({
        or: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
      });

      mockSupabaseService.client.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await service.searchDrivers(query);

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when Supabase returns an error', async () => {
      const query = 'ham';
      const mockSelect = jest.fn().mockReturnValue({
        or: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            data: null,
            error: { message: 'Search error' },
          }),
        }),
      });

      mockSupabaseService.client.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(service.searchDrivers(query)).rejects.toThrow(InternalServerErrorException);
      await expect(service.searchDrivers(query)).rejects.toThrow('Failed to search drivers');
    });
  });

  describe('findDriversByStandings', () => {
    it('should return drivers sorted by standings successfully', async () => {
      const season = 2024;
      const mockRpc = jest.fn().mockReturnValue({
        data: [mockDriverStandings],
        error: null,
      });

      mockSupabaseService.client.rpc = mockRpc;

      const result = await service.findDriversByStandings(season);

      expect(result).toEqual([mockDriverStandings]);
      expect(mockRpc).toHaveBeenCalledWith('get_drivers_sorted_by_standings', { p_season: season });
    });

    it('should return empty array when no standings data found', async () => {
      const season = 2024;
      const mockRpc = jest.fn().mockReturnValue({
        data: [],
        error: null,
      });

      mockSupabaseService.client.rpc = mockRpc;

      const result = await service.findDriversByStandings(season);

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      const season = 2024;
      const mockRpc = jest.fn().mockReturnValue({
        data: null,
        error: null,
      });

      mockSupabaseService.client.rpc = mockRpc;

      const result = await service.findDriversByStandings(season);

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when Supabase returns an error', async () => {
      const season = 2024;
      const mockRpc = jest.fn().mockReturnValue({
        data: null,
        error: { message: 'Standings error' },
      });

      mockSupabaseService.client.rpc = mockRpc;

      await expect(service.findDriversByStandings(season)).rejects.toThrow(InternalServerErrorException);
      await expect(service.findDriversByStandings(season)).rejects.toThrow('Failed to fetch drivers by standings');
    });
  });

  describe('findOneDetails', () => {
    it('should return driver details successfully', async () => {
      const driverId = 1;
      const mockRpc = jest.fn().mockReturnValue({
        data: mockDriverDetails,
        error: null,
      });

      mockSupabaseService.client.rpc = mockRpc;

      const result = await service.findOneDetails(driverId);

      expect(result).toEqual(mockDriverDetails);
      expect(mockRpc).toHaveBeenCalledWith('get_driver_details', { p_driver_id: driverId });
    });

    it('should throw InternalServerErrorException when Supabase returns an error', async () => {
      const driverId = 1;
      const mockRpc = jest.fn().mockReturnValue({
        data: null,
        error: { message: 'Details error' },
      });

      mockSupabaseService.client.rpc = mockRpc;

      await expect(service.findOneDetails(driverId)).rejects.toThrow(InternalServerErrorException);
      await expect(service.findOneDetails(driverId)).rejects.toThrow('Failed to fetch driver details');
    });
  });

  describe('findOnePerformance', () => {
    it('should return driver performance successfully', async () => {
      const driverId = 1;
      const season = '2024';
      const mockRpc = jest.fn().mockReturnValue({
        data: mockDriverPerformance,
        error: null,
      });

      mockSupabaseService.client.rpc = mockRpc;

      const result = await service.findOnePerformance(driverId, season);

      expect(result).toEqual(mockDriverPerformance);
      expect(mockRpc).toHaveBeenCalledWith('get_driver_performance', { p_driver_id: driverId, p_season: season });
    });

    it('should throw InternalServerErrorException when Supabase returns an error', async () => {
      const driverId = 1;
      const season = '2024';
      const mockRpc = jest.fn().mockReturnValue({
        data: null,
        error: { message: 'Performance error' },
      });

      mockSupabaseService.client.rpc = mockRpc;

      await expect(service.findOnePerformance(driverId, season)).rejects.toThrow(InternalServerErrorException);
      await expect(service.findOnePerformance(driverId, season)).rejects.toThrow('Failed to fetch driver performance');
    });
  });
});
