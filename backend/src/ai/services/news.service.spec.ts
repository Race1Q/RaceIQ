import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NewsService } from './news.service';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { NewsFeedAdapter } from '../adapters/news-feed.adapter';
import { AiResponseService } from './ai-response.service';
import { AiNewsDto } from '../dto/ai-news.dto';

describe('NewsService', () => {
  let service: NewsService;
  let geminiService: jest.Mocked<GeminiService>;
  let quotaService: jest.Mocked<QuotaService>;
  let cacheService: jest.Mocked<PersistentCacheService>;
  let newsFeedAdapter: jest.Mocked<NewsFeedAdapter>;
  let aiResponseService: jest.Mocked<AiResponseService>;
  let configService: jest.Mocked<ConfigService>;

  const mockArticles = [
    { title: 'Article 1', url: 'http://example.com/1', snippet: 'Content 1' },
    { title: 'Article 2', url: 'http://example.com/2', snippet: 'Content 2' },
  ];

  const mockGeminiResponse = {
    summary: 'F1 news summary',
    bullets: ['Point 1', 'Point 2'],
    citations: [
      { title: 'Source 1', url: 'http://example.com/1', source: 'Example' },
    ],
  };

  const mockNewsDto: AiNewsDto = {
    summary: 'F1 news summary',
    bullets: ['Point 1', 'Point 2'],
    citations: [
      { title: 'Source 1', url: 'http://example.com/1', source: 'Example' },
    ],
    generatedAt: expect.any(String),
    ttlSeconds: 3600,
    isFallback: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
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
          provide: NewsFeedAdapter,
          useValue: {
            fetchNews: jest.fn(),
          },
        },
        {
          provide: AiResponseService,
          useValue: {
            getLatestResponseIfValid: jest.fn(),
            deleteLatestResponse: jest.fn(),
            storeResponse: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AI_NEWS_TTL_MIN') return 60;
              if (key === 'AI_FEATURES_ENABLED') return true;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    geminiService = module.get(GeminiService);
    quotaService = module.get(QuotaService);
    cacheService = module.get(PersistentCacheService);
    newsFeedAdapter = module.get(NewsFeedAdapter);
    aiResponseService = module.get(AiResponseService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNews - valid cached response', () => {
    it('should return valid cached news when available', async () => {
      const cachedNews: AiNewsDto = {
        summary: 'Cached summary',
        bullets: ['Cached point'],
        citations: [],
        generatedAt: new Date().toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      aiResponseService.getLatestResponseIfValid.mockResolvedValue({
        data: cachedNews,
        isExpired: false,
      });

      const result = await service.getNews('f1');

      expect(result).toEqual(cachedNews);
      expect(aiResponseService.getLatestResponseIfValid).toHaveBeenCalledWith(
        'news',
        'general',
        0,
        3600, // TTL in seconds (60 minutes * 60)
        undefined,
        undefined,
      );
      expect(newsFeedAdapter.fetchNews).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
      expect(quotaService.increment).not.toHaveBeenCalled();
    });
  });

  describe('getNews - expired cached response', () => {
    it('should generate new response when cached response is expired', async () => {
      const expiredNews: AiNewsDto = {
        summary: 'Expired summary',
        bullets: ['Expired point'],
        citations: [],
        generatedAt: new Date(Date.now() - 10000000).toISOString(), // Old date
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      aiResponseService.getLatestResponseIfValid.mockResolvedValue({
        data: expiredNews,
        isExpired: true,
      });
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      const result = await service.getNews('f1');

      expect(result).toMatchObject({
        summary: 'F1 news summary',
        bullets: ['Point 1', 'Point 2'],
        isFallback: false,
      });
      expect(aiResponseService.deleteLatestResponse).toHaveBeenCalledWith(
        'news',
        'general',
        0,
        undefined,
        undefined,
      );
      expect(aiResponseService.storeResponse).toHaveBeenCalled();
      expect(quotaService.increment).toHaveBeenCalled();
    });

    it('should return expired cached response when API fails', async () => {
      const expiredNews: AiNewsDto = {
        summary: 'Expired summary',
        bullets: ['Expired point'],
        citations: [],
        generatedAt: new Date(Date.now() - 10000000).toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      aiResponseService.getLatestResponseIfValid.mockResolvedValue({
        data: expiredNews,
        isExpired: true,
      });
      newsFeedAdapter.fetchNews.mockRejectedValue(new Error('API Error'));

      const result = await service.getNews('f1');

      expect(result).toEqual(expiredNews);
      expect(aiResponseService.deleteLatestResponse).not.toHaveBeenCalled();
      expect(aiResponseService.storeResponse).not.toHaveBeenCalled();
    });
  });

  describe('getNews - AI generation path (no cached response)', () => {
    beforeEach(() => {
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null); // No cached response
      quotaService.hasQuota.mockReturnValue(true);
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 60;
        if (key === 'AI_FEATURES_ENABLED') return true;
        return null;
      });
    });

    it('should generate news when no cached response exists', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      const result = await service.getNews('f1');

      expect(result).toMatchObject({
        summary: 'F1 news summary',
        bullets: ['Point 1', 'Point 2'],
        isFallback: false,
      });
      expect(newsFeedAdapter.fetchNews).toHaveBeenCalledWith('f1', 10);
      expect(geminiService.generateJSON).toHaveBeenCalled();
      expect(quotaService.increment).toHaveBeenCalled();
      expect(aiResponseService.storeResponse).toHaveBeenCalled();
    });

    it('should fetch correct number of articles', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('f1');

      expect(newsFeedAdapter.fetchNews).toHaveBeenCalledWith('f1', 10);
    });

    it('should pass articles to Gemini for processing', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('f1');

      const callArgs = geminiService.generateJSON.mock.calls[0];
      expect(callArgs[0]).toBeTruthy(); // System prompt
      expect(callArgs[1]).toContain('Article 1'); // User prompt should contain article titles
    });

    it('should increment quota after successful generation', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('f1');

      expect(quotaService.increment).toHaveBeenCalledTimes(1);
    });

    it('should store generated news in database', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('f1');

      expect(aiResponseService.storeResponse).toHaveBeenCalledWith(
        'news',
        'general',
        0,
        expect.objectContaining({
          summary: 'F1 news summary',
          isFallback: false,
          ttlSeconds: 3600,
        }),
        undefined,
        undefined,
        false,
        'Powered by Gemini AI',
      );
    });
  });

  describe('getNews - fallback scenarios', () => {
    it('should return expired cached when AI features are disabled', async () => {
      const expiredNews: AiNewsDto = {
        summary: 'Expired summary',
        bullets: ['Expired point'],
        citations: [],
        generatedAt: new Date(Date.now() - 10000000).toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      aiResponseService.getLatestResponseIfValid.mockResolvedValue({
        data: expiredNews,
        isExpired: true,
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 60;
        if (key === 'AI_FEATURES_ENABLED') return false; // Disabled
        return null;
      });

      const result = await service.getNews('f1');

      expect(result).toEqual(expiredNews);
      expect(newsFeedAdapter.fetchNews).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should return fallback when AI features disabled and no cached response', async () => {
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 60;
        if (key === 'AI_FEATURES_ENABLED') return false;
        return null;
      });

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(result.summary).toContain('currently unavailable');
    });

    it('should return expired cached when quota is exhausted', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      const expiredNews: AiNewsDto = {
        summary: 'Expired summary',
        bullets: ['Expired point'],
        citations: [],
        generatedAt: new Date(Date.now() - 10000000).toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      aiResponseService.getLatestResponseIfValid.mockResolvedValue({
        data: expiredNews,
        isExpired: true,
      });

      const result = await service.getNews('f1');

      expect(result).toEqual(expiredNews);
    });

    it('should return fallback when quota exhausted and no cached response', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(result.summary).toContain('currently unavailable');
    });

    it('should return expired cached when no articles found', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      const expiredNews: AiNewsDto = {
        summary: 'Expired summary',
        bullets: ['Expired point'],
        citations: [],
        generatedAt: new Date(Date.now() - 10000000).toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      aiResponseService.getLatestResponseIfValid.mockResolvedValue({
        data: expiredNews,
        isExpired: true,
      });
      newsFeedAdapter.fetchNews.mockResolvedValue([]);

      const result = await service.getNews('f1');

      expect(result).toEqual(expiredNews);
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should return fallback when no articles found and no cached response', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);
      newsFeedAdapter.fetchNews.mockResolvedValue([]);

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should return expired cached on API generation error', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      const expiredNews: AiNewsDto = {
        summary: 'Expired summary',
        bullets: ['Expired point'],
        citations: [],
        generatedAt: new Date(Date.now() - 10000000).toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      aiResponseService.getLatestResponseIfValid.mockResolvedValue({
        data: expiredNews,
        isExpired: true,
      });
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockRejectedValue(new Error('API Error'));

      const result = await service.getNews('f1');

      expect(result).toEqual(expiredNews);
    });

    it('should return fallback on error with no stale cache', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockRejectedValue(new Error('Network error'));
      cacheService.get.mockReturnValue(null);

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(result.summary).toContain('temporarily unavailable');
      expect(result.ttlSeconds).toBe(300); // Fallback has 5 min TTL
    });
  });

  describe('getNews - different topics', () => {
    beforeEach(() => {
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should handle custom topic', async () => {
      await service.getNews('hamilton');

      expect(newsFeedAdapter.fetchNews).toHaveBeenCalledWith('hamilton', 10);
      expect(aiResponseService.getLatestResponseIfValid).toHaveBeenCalledWith(
        'news',
        'general',
        0,
        3600,
        undefined,
        undefined,
      );
    });

    it('should use default topic when not provided', async () => {
      await service.getNews();

      expect(newsFeedAdapter.fetchNews).toHaveBeenCalledWith('f1', 10);
    });
  });

  describe('getFallbackNews (private method via public paths)', () => {
    beforeEach(() => {
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 60;
        if (key === 'AI_FEATURES_ENABLED') return false; // Trigger fallback
        return null;
      });
    });

    it('should return structured fallback response', async () => {
      const result = await service.getNews('f1');

      expect(result).toMatchObject({
        summary: expect.stringContaining('currently unavailable'),
        bullets: expect.arrayContaining([
          expect.stringContaining('Data is being generated'),
        ]),
        citations: expect.arrayContaining([]),
        ttlSeconds: 300,
        isFallback: true,
      });
    });

    it('should include generatedAt timestamp in fallback', async () => {
      const result = await service.getNews('f1');

      expect(result.generatedAt).toBeTruthy();
      expect(new Date(result.generatedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);
      quotaService.hasQuota.mockReturnValue(true);
    });

    it('should handle news adapter errors gracefully', async () => {
      newsFeedAdapter.fetchNews.mockRejectedValue(new Error('Network timeout'));

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should handle Gemini API errors gracefully', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockRejectedValue(new Error('Gemini API error'));

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
    });

    it('should handle store response errors gracefully', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
      aiResponseService.storeResponse.mockRejectedValue(new Error('Database error'));

      const result = await service.getNews('f1');

      // Should still return the generated response even if storage fails
      expect(result).toMatchObject({
        summary: 'F1 news summary',
        isFallback: false,
      });
    });
  });

  describe('TTL configuration', () => {
    it('should use configured TTL from environment for expiration check', async () => {
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
      
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 120; // 2 hours
        if (key === 'AI_FEATURES_ENABLED') return true;
        return null;
      });

      // Create a new service instance with updated config
      const module2 = await Test.createTestingModule({
        providers: [
          NewsService,
          {
            provide: GeminiService,
            useValue: geminiService,
          },
          {
            provide: QuotaService,
            useValue: quotaService,
          },
          {
            provide: PersistentCacheService,
            useValue: cacheService,
          },
          {
            provide: NewsFeedAdapter,
            useValue: newsFeedAdapter,
          },
          {
            provide: AiResponseService,
            useValue: aiResponseService,
          },
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const service2 = module2.get<NewsService>(NewsService);
      await service2.getNews('f1');

      // Should use 7200 seconds (120 minutes * 60) for expiration check
      expect(aiResponseService.getLatestResponseIfValid).toHaveBeenCalledWith(
        'news',
        'general',
        0,
        7200,
        undefined,
        undefined,
      );
      expect(aiResponseService.storeResponse).toHaveBeenCalledWith(
        'news',
        'general',
        0,
        expect.objectContaining({
          ttlSeconds: 7200,
        }),
        undefined,
        undefined,
        false,
        'Powered by Gemini AI',
      );
    });

    it('should use default TTL when not configured', async () => {
      aiResponseService.getLatestResponseIfValid.mockResolvedValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('f1');

      // Should use 3600 seconds (60 minutes * 60) as default
      expect(aiResponseService.getLatestResponseIfValid).toHaveBeenCalledWith(
        'news',
        'general',
        0,
        3600,
        undefined,
        undefined,
      );
    });
  });
});

