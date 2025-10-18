import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FunFactsService } from './fun-facts.service';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { DriverStatsAdapter } from '../adapters/driver-stats.adapter';
import { AiDriverFunFactsDto } from '../dto/ai-fun-facts.dto';

describe('FunFactsService', () => {
  let service: FunFactsService;
  let geminiService: jest.Mocked<GeminiService>;
  let quotaService: jest.Mocked<QuotaService>;
  let cacheService: jest.Mocked<PersistentCacheService>;
  let driverStatsAdapter: jest.Mocked<DriverStatsAdapter>;
  let configService: jest.Mocked<ConfigService>;

  const mockDriverData = {
    id: 1,
    name: 'Max Verstappen',
    number: 1,
    nationality: 'Dutch',
    stats: {
      wins: 50,
      championships: 3,
    },
  };

  const mockGeminiResponse = {
    title: 'Fun Facts about Max Verstappen',
    facts: [
      'Youngest ever F1 driver at 17 years old',
      'First Dutch driver to win F1 championship',
      'Known for aggressive overtaking',
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunFactsService,
        {
          provide: GeminiService,
          useValue: {
            generateJSON: jest.fn(),
            isConfigured: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: QuotaService,
          useValue: {
            hasQuota: jest.fn().mockReturnValue(true),
            increment: jest.fn(),
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
          provide: DriverStatsAdapter,
          useValue: {
            getDriverData: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AI_FUN_FACTS_TTL_H') return 24;
              if (key === 'AI_FEATURES_ENABLED') return true;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FunFactsService>(FunFactsService);
    geminiService = module.get(GeminiService);
    quotaService = module.get(QuotaService);
    cacheService = module.get(PersistentCacheService);
    driverStatsAdapter = module.get(DriverStatsAdapter);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDriverFunFacts - cache hit path', () => {
    it('should return cached fun facts when available', async () => {
      const cachedFacts: AiDriverFunFactsDto = {
        driverId: 1,
        season: null,
        title: 'Cached Fun Facts',
        facts: ['Cached fact 1', 'Cached fact 2'],
        generatedAt: new Date().toISOString(),
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
      };
      
      cacheService.get.mockReturnValue(cachedFacts);

      const result = await service.getDriverFunFacts(1);

      expect(result).toEqual(cachedFacts);
      expect(cacheService.get).toHaveBeenCalledWith('fun-facts:1:career');
      expect(driverStatsAdapter.getDriverData).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should use correct cache key for career facts', async () => {
      cacheService.get.mockReturnValue(null);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getDriverFunFacts(1);

      expect(cacheService.get).toHaveBeenCalledWith('fun-facts:1:career');
    });

    it('should use correct cache key for season-specific facts', async () => {
      cacheService.get.mockReturnValue(null);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getDriverFunFacts(1, 2023);

      expect(cacheService.get).toHaveBeenCalledWith('fun-facts:1:2023');
    });
  });

  describe('getDriverFunFacts - AI generation path', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should generate fun facts when cache is empty', async () => {
      const result = await service.getDriverFunFacts(1);

      expect(result).toMatchObject({
        driverId: 1,
        season: null,
        title: 'Fun Facts about Max Verstappen',
        facts: expect.arrayContaining([
          expect.stringContaining('Youngest ever'),
        ]),
        isFallback: false,
      });
      expect(quotaService.increment).toHaveBeenCalled();
    });

    it('should fetch driver data with season parameter', async () => {
      await service.getDriverFunFacts(1, 2023);

      expect(driverStatsAdapter.getDriverData).toHaveBeenCalledWith(1, 2023);
    });

    it('should include AI attribution', async () => {
      const result = await service.getDriverFunFacts(1);

      expect(result.aiAttribution).toBe('Powered by Gemini AI');
    });

    it('should cache generated facts with correct TTL', async () => {
      await service.getDriverFunFacts(1);

      expect(cacheService.set).toHaveBeenCalledWith(
        'fun-facts:1:career',
        expect.any(Object),
        86400, // 24 hours * 3600 seconds
      );
    });
  });

  describe('getDriverFunFacts - fallback scenarios', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
    });

    it('should return fallback when AI features are disabled', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_FUN_FACTS_TTL_H') return 24;
        if (key === 'AI_FEATURES_ENABLED') return false;
        return null;
      });

      const result = await service.getDriverFunFacts(1);

      expect(result.isFallback).toBe(true);
      expect(result.title).toBe('Driver Fun Facts');
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should return stale cache when quota is exhausted', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      const staleFacts: AiDriverFunFactsDto = {
        driverId: 1,
        season: null,
        title: 'Stale Facts',
        facts: ['Stale fact'],
        generatedAt: new Date().toISOString(),
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
      };
      
      cacheService.get.mockImplementation((key: string, ignoreExpiry?: boolean) => {
        if (ignoreExpiry) return staleFacts;
        return null;
      });

      const result = await service.getDriverFunFacts(1);

      expect(result).toMatchObject({
        title: 'Stale Facts',
        isFallback: true,
      });
    });

    it('should return fallback on error', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockRejectedValue(new Error('Error'));
      cacheService.get.mockReturnValue(null);

      const result = await service.getDriverFunFacts(1);

      expect(result.isFallback).toBe(true);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
    });

    it('should handle adapter errors gracefully', async () => {
      driverStatsAdapter.getDriverData.mockRejectedValue(new Error('DB error'));

      const result = await service.getDriverFunFacts(1);

      expect(result.isFallback).toBe(true);
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should handle Gemini errors gracefully', async () => {
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockRejectedValue(new Error('API error'));

      const result = await service.getDriverFunFacts(1);

      expect(result.isFallback).toBe(true);
    });
  });
});
