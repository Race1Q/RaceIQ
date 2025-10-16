import { Test, TestingModule } from '@nestjs/testing';
import { ConstructorInfoService } from './constructor-info.service';
import { GeminiService } from './gemini.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { ConstructorsService } from '../../constructors/constructors.service';
import { DriversService } from '../../drivers/drivers.service';
import { RacesService } from '../../races/races.service';
import { AiConstructorInfoDto } from '../dto/ai-constructor-info.dto';

describe('ConstructorInfoService', () => {
  let service: ConstructorInfoService;
  let geminiService: jest.Mocked<GeminiService>;
  let cacheService: jest.Mocked<PersistentCacheService>;
  let constructorsService: jest.Mocked<ConstructorsService>;
  let driversService: jest.Mocked<DriversService>;
  let racesService: jest.Mocked<RacesService>;

  const mockConstructor = {
    id: 1,
    name: 'Red Bull Racing',
    nationality: 'Austrian',
  };

  const mockDrivers = [
    {
      id: 1,
      name: 'Max Verstappen',
      code: 'VER',
      constructorId: 1,
      nationality: 'Dutch',
    },
    {
      id: 2,
      name: 'Sergio Perez',
      code: 'PER',
      constructorId: 1,
      nationality: 'Mexican',
    },
  ];

  const mockGeminiResponse = {
    overview: 'Red Bull Racing is a dominant force in F1',
    history: 'Founded in 2005, Red Bull has won multiple championships',
    strengths: ['Superior aerodynamics', 'Strong driver lineup', 'Excellent strategy'],
    challenges: ['Budget cap regulations', 'Maintaining advantage'],
    notableAchievements: ['Multiple championships', 'Record-breaking performances'],
    currentSeason: {
      performance: 'Dominating the 2023 season',
      highlights: ['19 wins out of 22 races', 'Both drivers competitive'],
      outlook: 'Expected to continue dominance',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstructorInfoService,
        {
          provide: GeminiService,
          useValue: {
            generateJSON: jest.fn(),
            isConfigured: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: PersistentCacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ConstructorsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DriversService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: RacesService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConstructorInfoService>(ConstructorInfoService);
    geminiService = module.get(GeminiService);
    cacheService = module.get(PersistentCacheService);
    constructorsService = module.get(ConstructorsService);
    driversService = module.get(DriversService);
    racesService = module.get(RacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConstructorInfo - cache hit path', () => {
    it('should return cached info when available', async () => {
      const cachedInfo: AiConstructorInfoDto = {
        overview: 'Cached overview',
        history: 'Cached history',
        strengths: ['Cached strength'],
        challenges: ['Cached challenge'],
        notableAchievements: ['Cached achievement'],
        currentSeason: {
          performance: 'Cached performance',
          highlights: ['Cached highlight'],
          outlook: 'Cached outlook',
        },
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
      
      cacheService.get.mockReturnValue(cachedInfo);

      const result = await service.getConstructorInfo(1);

      expect(result).toEqual(cachedInfo);
      expect(cacheService.get).toHaveBeenCalledWith('constructor-info-1-all');
      expect(constructorsService.findOne).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should use correct cache key without season', async () => {
      cacheService.get.mockReturnValue(null);
      constructorsService.findOne.mockResolvedValue(mockConstructor as any);
      driversService.findAll.mockResolvedValue(mockDrivers as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getConstructorInfo(1);

      expect(cacheService.get).toHaveBeenCalledWith('constructor-info-1-all');
    });

    it('should use correct cache key with season', async () => {
      cacheService.get.mockReturnValue(null);
      constructorsService.findOne.mockResolvedValue(mockConstructor as any);
      driversService.findAll.mockResolvedValue(mockDrivers as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getConstructorInfo(1, 2023);

      expect(cacheService.get).toHaveBeenCalledWith('constructor-info-1-2023');
    });
  });

  describe('getConstructorInfo - AI generation path', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      constructorsService.findOne.mockResolvedValue(mockConstructor as any);
      driversService.findAll.mockResolvedValue(mockDrivers as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should generate info when cache is empty', async () => {
      const result = await service.getConstructorInfo(1);

      expect(result).toMatchObject({
        overview: 'Red Bull Racing is a dominant force in F1',
        history: expect.stringContaining('Founded in 2005'),
        isFallback: false,
      });
      expect(constructorsService.findOne).toHaveBeenCalledWith(1);
      expect(geminiService.generateJSON).toHaveBeenCalled();
    });

    it('should fetch constructor by ID', async () => {
      await service.getConstructorInfo(1);

      expect(constructorsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should fetch drivers for the season', async () => {
      await service.getConstructorInfo(1, 2023);

      expect(driversService.findAll).toHaveBeenCalledWith({ year: 2023 });
    });

    it('should use current year when no season provided', async () => {
      const currentYear = new Date().getFullYear();
      
      await service.getConstructorInfo(1);

      expect(driversService.findAll).toHaveBeenCalledWith({ year: currentYear });
    });

    it('should filter drivers by constructor ID', async () => {
      const allDrivers = [
        ...mockDrivers,
        { id: 3, name: 'Other Driver', constructorId: 2 },
      ];
      driversService.findAll.mockResolvedValue(allDrivers as any);

      await service.getConstructorInfo(1);

      // Verify that Gemini prompt only includes drivers from this constructor
      const callArgs = geminiService.generateJSON.mock.calls[0];
      expect(callArgs[1]).toContain('Max Verstappen');
      expect(callArgs[1]).toContain('Sergio Perez');
      expect(callArgs[1]).not.toContain('Other Driver');
    });

    it('should cache generated info with correct TTL', async () => {
      await service.getConstructorInfo(1);

      expect(cacheService.set).toHaveBeenCalledWith(
        'constructor-info-1-all',
        expect.any(Object),
        259200, // 72 hours * 3600 seconds
      );
    });

    it('should include all required fields in response', async () => {
      const result = await service.getConstructorInfo(1);

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('history');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('challenges');
      expect(result).toHaveProperty('notableAchievements');
      expect(result).toHaveProperty('currentSeason');
      expect(result.currentSeason).toHaveProperty('performance');
      expect(result.currentSeason).toHaveProperty('highlights');
      expect(result.currentSeason).toHaveProperty('outlook');
    });
  });

  describe('getConstructorInfo - error handling and fallback', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
    });

    it('should return fallback when constructor not found', async () => {
      constructorsService.findOne.mockResolvedValue(null);

      const result = await service.getConstructorInfo(999);

      expect(result.isFallback).toBe(true);
      expect(result.overview).toBeTruthy();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should return fallback on Gemini API error', async () => {
      constructorsService.findOne.mockResolvedValue(mockConstructor as any);
      driversService.findAll.mockResolvedValue(mockDrivers as any);
      geminiService.generateJSON.mockRejectedValue(new Error('API error'));

      const result = await service.getConstructorInfo(1);

      expect(result.isFallback).toBe(true);
      expect(result.strengths).toContain('Experienced team management');
    });

    it('should include constructor name in fallback when available', async () => {
      constructorsService.findOne.mockResolvedValue(mockConstructor as any);
      driversService.findAll.mockRejectedValue(new Error('DB error'));

      const result = await service.getConstructorInfo(1);

      expect(result.isFallback).toBe(true);
      expect(result.overview).toContain('Red Bull Racing');
    });

    it('should handle missing constructor in error fallback', async () => {
      constructorsService.findOne
        .mockResolvedValueOnce(mockConstructor as any) // First call succeeds
        .mockResolvedValueOnce(null); // Second call in catch block returns null
      driversService.findAll.mockRejectedValue(new Error('DB error'));

      const result = await service.getConstructorInfo(1);

      expect(result.isFallback).toBe(true);
      expect(result.overview).toContain('This team');
    });

    it('should handle driver fetch errors', async () => {
      constructorsService.findOne.mockResolvedValue(mockConstructor as any);
      driversService.findAll.mockRejectedValue(new Error('Driver DB error'));

      const result = await service.getConstructorInfo(1);

      expect(result.isFallback).toBe(true);
    });

    it('should have structured fallback response', async () => {
      // First call in try block fails, second call in catch block succeeds
      constructorsService.findOne
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(mockConstructor as any);

      const result = await service.getConstructorInfo(1);

      expect(result).toMatchObject({
        overview: expect.any(String),
        history: expect.any(String),
        strengths: expect.any(Array),
        challenges: expect.any(Array),
        notableAchievements: expect.any(Array),
        currentSeason: expect.objectContaining({
          performance: expect.any(String),
          highlights: expect.any(Array),
          outlook: expect.any(String),
        }),
        isFallback: true,
      });
    });
  });

  describe('cache management', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      constructorsService.findOne.mockResolvedValue(mockConstructor as any);
      driversService.findAll.mockResolvedValue(mockDrivers as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should cache with 72 hour TTL', async () => {
      await service.getConstructorInfo(1);

      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        259200, // 72 hours
      );
    });

    it('should not cache fallback responses', async () => {
      // First call in try block fails, second call in catch block succeeds
      constructorsService.findOne
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(mockConstructor as any);
      
      await service.getConstructorInfo(1);

      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });
});
