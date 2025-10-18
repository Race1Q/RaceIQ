import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverStatsAdapter } from './driver-stats.adapter';
import { DriversService } from '../../drivers/drivers.service';

describe('DriverStatsAdapter', () => {
  let adapter: DriverStatsAdapter;
  let driversService: jest.Mocked<DriversService>;

  const mockDriver = {
    id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    name_acronym: 'HAM',
    driver_number: 44,
    country_code: 'GBR',
    date_of_birth: '1985-01-07',
    bio: 'Seven-time world champion',
    fun_fact: 'First British driver with multiple championships',
  };

  const mockCareerStats = {
    careerStats: {
      wins: 103,
      podiums: 195,
      fastestLaps: 65,
      points: 4500,
      grandsPrixEntered: 320,
      dnfs: 50,
      highestRaceFinish: 1,
      firstRace: {
        year: 2007,
        event: 'Australian Grand Prix',
      },
    },
  };

  const mockSeasonStats = {
    yearStats: {
      wins: 11,
      podiums: 15,
      fastestLaps: 7,
      points: 387,
      poles: 9,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverStatsAdapter,
        {
          provide: DriversService,
          useValue: {
            findOne: jest.fn(),
            getDriverCareerStats: jest.fn(),
            getDriverStats: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<DriverStatsAdapter>(DriverStatsAdapter);
    driversService = module.get(DriversService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getDriverData - basic info', () => {
    it('should fetch and format driver basic info', async () => {
      driversService.findOne.mockResolvedValue(mockDriver as any);
      driversService.getDriverCareerStats.mockResolvedValue(mockCareerStats as any);

      const result = await adapter.getDriverData(1);

      expect(result).toMatchObject({
        id: 1,
        fullName: 'Lewis Hamilton',
        firstName: 'Lewis',
        lastName: 'Hamilton',
        code: 'HAM',
        driverNumber: 44,
        countryCode: 'GBR',
      });
    });

    it('should handle driver with no first/last name gracefully', async () => {
      const driverNoName = {
        ...mockDriver,
        first_name: '',
        last_name: '',
      };
      driversService.findOne.mockResolvedValue(driverNoName as any);
      driversService.getDriverCareerStats.mockResolvedValue(mockCareerStats as any);

      const result = await adapter.getDriverData(1);

      expect(result.fullName).toBe('');
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });

    it('should throw NotFoundException when driver not found', async () => {
      driversService.findOne.mockResolvedValue(null);

      await expect(adapter.getDriverData(999)).rejects.toThrow(NotFoundException);
      await expect(adapter.getDriverData(999)).rejects.toThrow('Driver with ID 999 not found');
    });

    it('should handle bio and fun fact (not stored in database)', async () => {
      driversService.findOne.mockResolvedValue(mockDriver as any);
      driversService.getDriverCareerStats.mockResolvedValue(mockCareerStats as any);

      const result = await adapter.getDriverData(1);

      // bio removed from database - always returns null
      expect(result.funFact).toBeNull();
    });

    it('should handle null date of birth', async () => {
      const driverNoDOB = { ...mockDriver, date_of_birth: null };
      driversService.findOne.mockResolvedValue(driverNoDOB as any);
      driversService.getDriverCareerStats.mockResolvedValue(mockCareerStats as any);

      const result = await adapter.getDriverData(1);

      expect(result.dateOfBirth).toBeNull();
    });
  });

  describe('getDriverData - career stats', () => {
    beforeEach(() => {
      driversService.findOne.mockResolvedValue(mockDriver as any);
    });

    it('should fetch and include career stats', async () => {
      driversService.getDriverCareerStats.mockResolvedValue(mockCareerStats as any);

      const result = await adapter.getDriverData(1);

      expect(result.careerStats).toMatchObject({
        wins: 103,
        podiums: 195,
        fastestLaps: 65,
        points: 4500,
        grandsPrixEntered: 320,
        dnfs: 50,
        highestRaceFinish: 1,
        firstRaceYear: 2007,
        firstRaceEvent: 'Australian Grand Prix',
      });
    });

    it('should handle career stats fetch failure gracefully', async () => {
      driversService.getDriverCareerStats.mockRejectedValue(new Error('Stats DB error'));

      const result = await adapter.getDriverData(1);

      expect(result.careerStats).toBeUndefined();
      expect(result.fullName).toBe('Lewis Hamilton');
    });

    it('should handle missing firstRace data', async () => {
      const statsNoFirstRace = {
        careerStats: {
          ...mockCareerStats.careerStats,
          firstRace: undefined,
        },
      };
      driversService.getDriverCareerStats.mockResolvedValue(statsNoFirstRace as any);

      const result = await adapter.getDriverData(1);

      expect(result.careerStats?.firstRaceYear).toBeUndefined();
      expect(result.careerStats?.firstRaceEvent).toBeUndefined();
    });
  });

  describe('getDriverData - season stats', () => {
    beforeEach(() => {
      driversService.findOne.mockResolvedValue(mockDriver as any);
      driversService.getDriverCareerStats.mockResolvedValue(mockCareerStats as any);
    });

    it('should fetch season stats when season provided', async () => {
      driversService.getDriverStats.mockResolvedValue(mockSeasonStats as any);

      const result = await adapter.getDriverData(1, 2023);

      expect(result.seasonStats).toMatchObject({
        year: 2023,
        wins: 11,
        podiums: 15,
        fastestLaps: 7,
        points: 387,
        poles: 9,
      });
      expect(driversService.getDriverStats).toHaveBeenCalledWith(1, 2023);
    });

    it('should not fetch season stats when season not provided', async () => {
      const result = await adapter.getDriverData(1);

      expect(result.seasonStats).toBeUndefined();
      expect(driversService.getDriverStats).not.toHaveBeenCalled();
    });

    it('should handle season stats fetch failure gracefully', async () => {
      driversService.getDriverStats.mockRejectedValue(new Error('Season stats error'));

      const result = await adapter.getDriverData(1, 2023);

      expect(result.seasonStats).toBeUndefined();
      expect(result.fullName).toBe('Lewis Hamilton');
    });

    it('should handle missing yearStats in response', async () => {
      driversService.getDriverStats.mockResolvedValue({ yearStats: null } as any);

      const result = await adapter.getDriverData(1, 2023);

      expect(result.seasonStats).toBeUndefined();
    });
  });

  describe('comprehensive data fetching', () => {
    it('should fetch all data when available', async () => {
      driversService.findOne.mockResolvedValue(mockDriver as any);
      driversService.getDriverCareerStats.mockResolvedValue(mockCareerStats as any);
      driversService.getDriverStats.mockResolvedValue(mockSeasonStats as any);

      const result = await adapter.getDriverData(1, 2023);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fullName');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('careerStats');
      expect(result).toHaveProperty('seasonStats');
      expect(result.careerStats).toBeDefined();
      expect(result.seasonStats).toBeDefined();
    });

    it('should continue even if partial data fails', async () => {
      driversService.findOne.mockResolvedValue(mockDriver as any);
      driversService.getDriverCareerStats.mockRejectedValue(new Error('Career stats error'));
      driversService.getDriverStats.mockRejectedValue(new Error('Season stats error'));

      const result = await adapter.getDriverData(1, 2023);

      expect(result.fullName).toBe('Lewis Hamilton');
      expect(result.careerStats).toBeUndefined();
      expect(result.seasonStats).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw error when driver service fails critically', async () => {
      driversService.findOne.mockRejectedValue(new Error('Critical DB error'));

      await expect(adapter.getDriverData(1)).rejects.toThrow('Critical DB error');
    });

    it('should throw NotFoundException with correct message', async () => {
      driversService.findOne.mockResolvedValue(null);

      await expect(adapter.getDriverData(123)).rejects.toThrow(NotFoundException);
      await expect(adapter.getDriverData(123)).rejects.toThrow('Driver with ID 123 not found');
    });
  });
});

