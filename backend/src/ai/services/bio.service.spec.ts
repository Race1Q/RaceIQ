import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BioService } from './bio.service';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { DriverStatsAdapter } from '../adapters/driver-stats.adapter';
import { AiDriverBioDto } from '../dto/ai-bio.dto';

describe('BioService', () => {
  let service: BioService;
  let geminiService: jest.Mocked<GeminiService>;
  let quotaService: jest.Mocked<QuotaService>;
  let cacheService: jest.Mocked<PersistentCacheService>;
  let driverStatsAdapter: jest.Mocked<DriverStatsAdapter>;
  let configService: jest.Mocked<ConfigService>;

  const mockDriverData = {
    id: 1,
    name: 'Lewis Hamilton',
    number: 44,
    nationality: 'British',
    stats: {
      wins: 103,
      podiums: 195,
      championships: 7,
    },
  };

  const mockGeminiResponse = {
    title: 'Lewis Hamilton - Formula 1 Legend',
    teaser: 'Seven-time world champion',
    paragraphs: [
      'Lewis Hamilton is one of the greatest F1 drivers of all time.',
      'He has won 7 world championships.',
    ],
    highlights: [
      'Most pole positions in F1 history',
      'Joint record holder for world championships',
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BioService,
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
              if (key === 'AI_BIO_TTL_H') return 48;
              if (key === 'AI_FEATURES_ENABLED') return true;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BioService>(BioService);
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

  describe('getDriverBio - cache hit path', () => {
    it('should return cached bio when available', async () => {
      const cachedBio: AiDriverBioDto = {
        driverId: 1,
        season: null,
        title: 'Cached title',
        teaser: 'Cached teaser',
        paragraphs: ['Cached paragraph'],
        highlights: ['Cached highlight'],
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
      
      cacheService.get.mockReturnValue(cachedBio);

      const result = await service.getDriverBio(1);

      expect(result).toEqual(cachedBio);
      expect(cacheService.get).toHaveBeenCalledWith('bio:1:career');
      expect(driverStatsAdapter.getDriverData).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should use correct cache key for career bio', async () => {
      cacheService.get.mockReturnValue(null);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getDriverBio(1);

      expect(cacheService.get).toHaveBeenCalledWith('bio:1:career');
    });

    it('should use correct cache key for season-specific bio', async () => {
      cacheService.get.mockReturnValue(null);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getDriverBio(1, 2023);

      expect(cacheService.get).toHaveBeenCalledWith('bio:1:2023');
    });
  });

  describe('getDriverBio - AI generation path', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should generate bio when cache is empty', async () => {
      const result = await service.getDriverBio(1);

      expect(result).toMatchObject({
        driverId: 1,
        season: null,
        title: 'Lewis Hamilton - Formula 1 Legend',
        teaser: 'Seven-time world champion',
        isFallback: false,
      });
      expect(driverStatsAdapter.getDriverData).toHaveBeenCalledWith(1, undefined);
      expect(geminiService.generateJSON).toHaveBeenCalled();
      expect(quotaService.increment).toHaveBeenCalled();
    });

    it('should fetch driver data with season parameter', async () => {
      await service.getDriverBio(1, 2023);

      expect(driverStatsAdapter.getDriverData).toHaveBeenCalledWith(1, 2023);
    });

    it('should pass driver data to Gemini for processing', async () => {
      await service.getDriverBio(1);

      const callArgs = geminiService.generateJSON.mock.calls[0];
      expect(callArgs[0]).toBeTruthy(); // System prompt
      expect(callArgs[1]).toContain('Lewis Hamilton'); // User prompt should contain driver name
    });

    it('should increment quota after successful generation', async () => {
      await service.getDriverBio(1);

      expect(quotaService.increment).toHaveBeenCalledTimes(1);
    });

    it('should cache generated bio with correct TTL', async () => {
      await service.getDriverBio(1);

      expect(cacheService.set).toHaveBeenCalledWith(
        'bio:1:career',
        expect.objectContaining({
          driverId: 1,
          title: 'Lewis Hamilton - Formula 1 Legend',
          isFallback: false,
        }),
        172800, // 48 hours * 3600 seconds
      );
    });

    it('should include all fields in generated bio', async () => {
      const result = await service.getDriverBio(1);

      expect(result).toHaveProperty('driverId', 1);
      expect(result).toHaveProperty('season', null);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('teaser');
      expect(result).toHaveProperty('paragraphs');
      expect(result).toHaveProperty('highlights');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('isFallback', false);
    });
  });

  describe('getDriverBio - fallback scenarios', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
    });

    it('should return fallback when AI features are disabled', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_BIO_TTL_H') return 48;
        if (key === 'AI_FEATURES_ENABLED') return false; // Disabled
        return null;
      });

      const result = await service.getDriverBio(1);

      expect(result.isFallback).toBe(true);
      expect(result.title).toBe('Driver Biography');
      expect(result.teaser).toContain('temporarily unavailable');
      expect(driverStatsAdapter.getDriverData).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should return stale cache when quota is exhausted', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      const staleBio: AiDriverBioDto = {
        driverId: 1,
        season: null,
        title: 'Stale title',
        teaser: 'Stale teaser',
        paragraphs: ['Stale paragraph'],
        highlights: ['Stale highlight'],
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
      
      cacheService.get.mockImplementation((key: string, ignoreExpiry?: boolean) => {
        if (ignoreExpiry) return staleBio;
        return null;
      });

      const result = await service.getDriverBio(1);

      expect(result).toMatchObject({
        title: 'Stale title',
        isFallback: true,
      });
      expect(cacheService.get).toHaveBeenCalledWith('bio:1:career', true);
    });

    it('should return fallback when quota exhausted and no stale cache', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      cacheService.get.mockReturnValue(null);

      const result = await service.getDriverBio(1);

      expect(result.isFallback).toBe(true);
      expect(result.driverId).toBe(1);
    });

    it('should return stale cache on generation error', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockRejectedValue(new Error('API Error'));
      
      const staleBio: AiDriverBioDto = {
        driverId: 1,
        season: null,
        title: 'Stale title',
        teaser: 'Stale teaser',
        paragraphs: ['Stale paragraph'],
        highlights: ['Stale highlight'],
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
      
      cacheService.get.mockImplementation((key: string, ignoreExpiry?: boolean) => {
        if (ignoreExpiry) return staleBio;
        return null;
      });

      const result = await service.getDriverBio(1);

      expect(result).toMatchObject({
        title: 'Stale title',
        isFallback: true,
      });
    });

    it('should return fallback on error with no stale cache', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockRejectedValue(new Error('Data fetch error'));
      cacheService.get.mockReturnValue(null);

      const result = await service.getDriverBio(1);

      expect(result.isFallback).toBe(true);
      expect(result.driverId).toBe(1);
    });
  });

  describe('getDriverBio - season handling', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should generate career bio when no season provided', async () => {
      const result = await service.getDriverBio(1);

      expect(result.season).toBeNull();
      expect(cacheService.set).toHaveBeenCalledWith(
        'bio:1:career',
        expect.any(Object),
        expect.any(Number),
      );
    });

    it('should generate season-specific bio when season provided', async () => {
      const result = await service.getDriverBio(1, 2023);

      expect(result.season).toBe(2023);
      expect(cacheService.set).toHaveBeenCalledWith(
        'bio:1:2023',
        expect.any(Object),
        expect.any(Number),
      );
    });

    it('should pass season to driver data adapter', async () => {
      await service.getDriverBio(1, 2023);

      expect(driverStatsAdapter.getDriverData).toHaveBeenCalledWith(1, 2023);
    });
  });

  describe('getFallbackBio (private method via public paths)', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_BIO_TTL_H') return 48;
        if (key === 'AI_FEATURES_ENABLED') return false; // Trigger fallback
        return null;
      });
    });

    it('should return structured fallback response', async () => {
      const result = await service.getDriverBio(1);

      expect(result).toMatchObject({
        driverId: 1,
        season: null,
        title: 'Driver Biography',
        teaser: expect.stringContaining('temporarily unavailable'),
        paragraphs: expect.arrayContaining([
          expect.stringContaining('biography is being generated'),
        ]),
        highlights: expect.arrayContaining([
          expect.stringContaining('Biography generation in progress'),
        ]),
        isFallback: true,
      });
    });

    it('should include season in fallback when provided', async () => {
      const result = await service.getDriverBio(1, 2023);

      expect(result.driverId).toBe(1);
      expect(result.season).toBe(2023);
    });

    it('should include generatedAt timestamp in fallback', async () => {
      const result = await service.getDriverBio(1);

      expect(result.generatedAt).toBeTruthy();
      expect(new Date(result.generatedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
    });

    it('should handle driver data fetch errors gracefully', async () => {
      driverStatsAdapter.getDriverData.mockRejectedValue(new Error('Database error'));

      const result = await service.getDriverBio(1);

      expect(result.isFallback).toBe(true);
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should handle Gemini API errors gracefully', async () => {
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockRejectedValue(new Error('Gemini timeout'));

      const result = await service.getDriverBio(1);

      expect(result.isFallback).toBe(true);
    });

    it('should handle cache set errors without throwing', async () => {
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
      cacheService.set.mockRejectedValue(new Error('Cache write error'));

      const result = await service.getDriverBio(1);

      // Cache write errors cause the service to go into error path and return fallback
      expect(result.isFallback).toBe(true);
    });
  });

  describe('TTL configuration', () => {
    it('should use configured TTL from environment', async () => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
      
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_BIO_TTL_H') return 72; // 3 days
        if (key === 'AI_FEATURES_ENABLED') return true;
        return null;
      });

      const module2 = await Test.createTestingModule({
        providers: [
          BioService,
          { provide: GeminiService, useValue: geminiService },
          { provide: QuotaService, useValue: quotaService },
          { provide: PersistentCacheService, useValue: cacheService },
          { provide: DriverStatsAdapter, useValue: driverStatsAdapter },
          { provide: ConfigService, useValue: configService },
        ],
      }).compile();

      const service2 = module2.get<BioService>(BioService);
      await service2.getDriverBio(1);

      expect(cacheService.set).toHaveBeenCalledWith(
        'bio:1:career',
        expect.any(Object),
        259200, // 72 hours * 3600 seconds
      );
    });

    it('should use default TTL when not configured', async () => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      driverStatsAdapter.getDriverData.mockResolvedValue(mockDriverData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getDriverBio(1);

      expect(cacheService.set).toHaveBeenCalledWith(
        'bio:1:career',
        expect.any(Object),
        172800, // Default 48 hours * 3600 seconds
      );
    });
  });
});

