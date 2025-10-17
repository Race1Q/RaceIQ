import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PreviewService } from './preview.service';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { TrackDataAdapter } from '../adapters/track-data.adapter';
import { AiTrackPreviewDto } from '../dto/ai-preview.dto';

describe('PreviewService', () => {
  let service: PreviewService;
  let geminiService: jest.Mocked<GeminiService>;
  let quotaService: jest.Mocked<QuotaService>;
  let cacheService: jest.Mocked<PersistentCacheService>;
  let trackDataAdapter: jest.Mocked<TrackDataAdapter>;
  let configService: jest.Mocked<ConfigService>;

  const mockTrackData = {
    slug: 'monaco',
    name: 'Circuit de Monaco',
    length: 3.337,
    corners: 19,
    lapRecord: '1:12.909',
  };

  const mockGeminiResponse = {
    intro: 'Monaco is the most prestigious race on the calendar',
    strategyNotes: [
      'Track position is crucial',
      'Tire management is key',
    ],
    weatherAngle: 'Mediterranean climate usually provides dry conditions',
    historyBlurb: 'Monaco has been part of F1 since 1950',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreviewService,
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
          provide: TrackDataAdapter,
          useValue: {
            getTrackData: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AI_TRACK_TTL_H') return 24;
              if (key === 'AI_FEATURES_ENABLED') return true;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PreviewService>(PreviewService);
    geminiService = module.get(GeminiService);
    quotaService = module.get(QuotaService);
    cacheService = module.get(PersistentCacheService);
    trackDataAdapter = module.get(TrackDataAdapter);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTrackPreview - cache hit path', () => {
    it('should return cached preview when available', async () => {
      const cachedPreview: AiTrackPreviewDto = {
        trackSlug: 'monaco',
        eventId: undefined,
        intro: 'Cached intro',
        strategyNotes: ['Cached note'],
        weatherAngle: 'Cached weather',
        historyBlurb: 'Cached history',
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
      
      cacheService.get.mockReturnValue(cachedPreview);

      const result = await service.getTrackPreview('monaco');

      expect(result).toEqual(cachedPreview);
      expect(cacheService.get).toHaveBeenCalledWith('preview:monaco:general');
      expect(trackDataAdapter.getTrackData).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should use correct cache key for general preview', async () => {
      cacheService.get.mockReturnValue(null);
      trackDataAdapter.getTrackData.mockResolvedValue(mockTrackData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getTrackPreview('monaco');

      expect(cacheService.get).toHaveBeenCalledWith('preview:monaco:general');
    });

    it('should use correct cache key for event-specific preview', async () => {
      cacheService.get.mockReturnValue(null);
      trackDataAdapter.getTrackData.mockResolvedValue(mockTrackData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getTrackPreview('monaco', 123);

      expect(cacheService.get).toHaveBeenCalledWith('preview:monaco:123');
    });
  });

  describe('getTrackPreview - AI generation path', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      trackDataAdapter.getTrackData.mockResolvedValue(mockTrackData);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should generate preview when cache is empty', async () => {
      const result = await service.getTrackPreview('monaco');

      expect(result).toMatchObject({
        trackSlug: 'monaco',
        intro: 'Monaco is the most prestigious race on the calendar',
        strategyNotes: expect.arrayContaining(['Track position is crucial']),
        isFallback: false,
      });
      expect(quotaService.increment).toHaveBeenCalled();
    });

    it('should fetch track data with eventId parameter', async () => {
      await service.getTrackPreview('monaco', 123);

      expect(trackDataAdapter.getTrackData).toHaveBeenCalledWith('monaco', 123);
    });

    it('should include optional fields in response', async () => {
      const result = await service.getTrackPreview('monaco');

      expect(result).toHaveProperty('weatherAngle');
      expect(result).toHaveProperty('historyBlurb');
    });

    it('should cache generated preview with correct TTL', async () => {
      await service.getTrackPreview('monaco');

      expect(cacheService.set).toHaveBeenCalledWith(
        'preview:monaco:general',
        expect.any(Object),
        86400, // 24 hours * 3600 seconds
      );
    });

    it('should set eventId in response when provided', async () => {
      const result = await service.getTrackPreview('monaco', 123);

      expect(result.eventId).toBe(123);
    });
  });

  describe('getTrackPreview - fallback scenarios', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
    });

    it('should return fallback when AI features are disabled', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_TRACK_TTL_H') return 24;
        if (key === 'AI_FEATURES_ENABLED') return false;
        return null;
      });

      const result = await service.getTrackPreview('monaco');

      expect(result.isFallback).toBe(true);
      expect(result.intro).toContain('temporarily unavailable');
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should return stale cache when quota is exhausted', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      const stalePreview: AiTrackPreviewDto = {
        trackSlug: 'monaco',
        eventId: undefined,
        intro: 'Stale intro',
        strategyNotes: ['Stale note'],
        weatherAngle: undefined,
        historyBlurb: undefined,
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
      
      cacheService.get.mockImplementation((key: string, ignoreExpiry?: boolean) => {
        if (ignoreExpiry) return stalePreview;
        return null;
      });

      const result = await service.getTrackPreview('monaco');

      expect(result).toMatchObject({
        intro: 'Stale intro',
        isFallback: true,
      });
    });

    it('should return fallback on error', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      trackDataAdapter.getTrackData.mockRejectedValue(new Error('Error'));
      cacheService.get.mockReturnValue(null);

      const result = await service.getTrackPreview('monaco');

      expect(result.isFallback).toBe(true);
      expect(result.trackSlug).toBe('monaco');
    });
  });

  describe('getFallbackPreview (private method via public paths)', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_TRACK_TTL_H') return 24;
        if (key === 'AI_FEATURES_ENABLED') return false;
        return null;
      });
    });

    it('should return structured fallback response', async () => {
      const result = await service.getTrackPreview('monaco');

      expect(result).toMatchObject({
        trackSlug: 'monaco',
        intro: expect.stringContaining('temporarily unavailable'),
        strategyNotes: expect.arrayContaining([
          expect.stringContaining('preview is being generated'),
        ]),
        isFallback: true,
      });
    });

    it('should include eventId in fallback when provided', async () => {
      const result = await service.getTrackPreview('monaco', 123);

      expect(result.trackSlug).toBe('monaco');
      expect(result.eventId).toBe(123);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
    });

    it('should handle track data fetch errors gracefully', async () => {
      trackDataAdapter.getTrackData.mockRejectedValue(new Error('DB error'));

      const result = await service.getTrackPreview('monaco');

      expect(result.isFallback).toBe(true);
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should handle Gemini API errors gracefully', async () => {
      trackDataAdapter.getTrackData.mockResolvedValue(mockTrackData);
      geminiService.generateJSON.mockRejectedValue(new Error('API error'));

      const result = await service.getTrackPreview('monaco');

      expect(result.isFallback).toBe(true);
    });
  });
});
