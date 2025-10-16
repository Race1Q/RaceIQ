import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NewsService } from './news.service';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { NewsFeedAdapter } from '../adapters/news-feed.adapter';
import { AiNewsDto } from '../dto/ai-news.dto';

describe('NewsService', () => {
  let service: NewsService;
  let geminiService: jest.Mocked<GeminiService>;
  let quotaService: jest.Mocked<QuotaService>;
  let cacheService: jest.Mocked<PersistentCacheService>;
  let newsFeedAdapter: jest.Mocked<NewsFeedAdapter>;
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
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNews - cache hit path', () => {
    it('should return cached news when available', async () => {
      const cachedNews: AiNewsDto = {
        summary: 'Cached summary',
        bullets: ['Cached point'],
        citations: [],
        generatedAt: new Date().toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      cacheService.get.mockReturnValue(cachedNews);

      const result = await service.getNews('f1');

      expect(result).toEqual(cachedNews);
      expect(cacheService.get).toHaveBeenCalledWith('news:f1');
      expect(newsFeedAdapter.fetchNews).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should use correct cache key for different topics', async () => {
      cacheService.get.mockReturnValue(null);
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('verstappen');

      expect(cacheService.get).toHaveBeenCalledWith('news:verstappen');
    });
  });

  describe('getNews - AI generation path', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null); // Cache miss
      quotaService.hasQuota.mockReturnValue(true);
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 60;
        if (key === 'AI_FEATURES_ENABLED') return true;
        return null;
      });
    });

    it('should generate news when cache is empty', async () => {
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
      expect(cacheService.set).toHaveBeenCalledWith('news:f1', expect.any(Object), 3600);
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

    it('should cache generated news with correct TTL', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('f1');

      expect(cacheService.set).toHaveBeenCalledWith(
        'news:f1',
        expect.objectContaining({
          summary: 'F1 news summary',
          isFallback: false,
        }),
        3600, // TTL in seconds
      );
    });
  });

  describe('getNews - fallback scenarios', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null); // Cache miss
    });

    it('should return fallback when AI features are disabled', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 60;
        if (key === 'AI_FEATURES_ENABLED') return false; // Disabled
        return null;
      });

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(result.summary).toContain('temporarily unavailable');
      expect(newsFeedAdapter.fetchNews).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should return stale cache when quota is exhausted', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      const staleNews: AiNewsDto = {
        summary: 'Stale summary',
        bullets: ['Stale point'],
        citations: [],
        generatedAt: new Date().toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      cacheService.get.mockImplementation((key: string, ignoreExpiry?: boolean) => {
        if (ignoreExpiry) return staleNews;
        return null;
      });

      const result = await service.getNews('f1');

      expect(result).toMatchObject({
        summary: 'Stale summary',
        isFallback: true,
      });
      expect(cacheService.get).toHaveBeenCalledWith('news:f1', true);
    });

    it('should return fallback when quota exhausted and no stale cache', async () => {
      quotaService.hasQuota.mockReturnValue(false);
      cacheService.get.mockReturnValue(null);

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(result.summary).toContain('temporarily unavailable');
    });

    it('should return fallback when no articles found', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockResolvedValue([]);

      const result = await service.getNews('f1');

      expect(result.isFallback).toBe(true);
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
      expect(quotaService.increment).not.toHaveBeenCalled();
    });

    it('should return stale cache on generation error', async () => {
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockRejectedValue(new Error('API Error'));
      
      const staleNews: AiNewsDto = {
        summary: 'Stale summary',
        bullets: ['Stale point'],
        citations: [],
        generatedAt: new Date().toISOString(),
        ttlSeconds: 3600,
        isFallback: false,
      };
      
      cacheService.get.mockImplementation((key: string, ignoreExpiry?: boolean) => {
        if (ignoreExpiry) return staleNews;
        return null;
      });

      const result = await service.getNews('f1');

      expect(result).toMatchObject({
        summary: 'Stale summary',
        isFallback: true,
      });
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
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should handle custom topic', async () => {
      await service.getNews('hamilton');

      expect(newsFeedAdapter.fetchNews).toHaveBeenCalledWith('hamilton', 10);
      expect(cacheService.get).toHaveBeenCalledWith('news:hamilton');
    });

    it('should use default topic when not provided', async () => {
      await service.getNews();

      expect(newsFeedAdapter.fetchNews).toHaveBeenCalledWith('f1', 10);
    });
  });

  describe('getFallbackNews (private method via public paths)', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_NEWS_TTL_MIN') return 60;
        if (key === 'AI_FEATURES_ENABLED') return false; // Trigger fallback
        return null;
      });
    });

    it('should return structured fallback response', async () => {
      const result = await service.getNews('f1');

      expect(result).toMatchObject({
        summary: expect.stringContaining('temporarily unavailable'),
        bullets: expect.arrayContaining([
          expect.stringContaining('news summaries'),
        ]),
        citations: expect.arrayContaining([
          expect.objectContaining({
            title: 'Formula 1 Official Website',
            url: 'https://www.formula1.com/en/latest.html',
          }),
        ]),
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
      cacheService.get.mockReturnValue(null);
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

    it('should handle cache set errors without throwing', async () => {
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
      cacheService.set.mockRejectedValue(new Error('Cache write error'));

      const result = await service.getNews('f1');

      // Cache write errors cause the service to go into error path and return fallback
      expect(result.isFallback).toBe(true);
    });
  });

  describe('TTL configuration', () => {
    it('should use configured TTL from environment', async () => {
      cacheService.get.mockReturnValue(null);
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
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const service2 = module2.get<NewsService>(NewsService);
      await service2.getNews('f1');

      expect(cacheService.set).toHaveBeenCalledWith(
        'news:f1',
        expect.any(Object),
        7200, // 120 minutes * 60 seconds
      );
    });

    it('should use default TTL when not configured', async () => {
      cacheService.get.mockReturnValue(null);
      quotaService.hasQuota.mockReturnValue(true);
      newsFeedAdapter.fetchNews.mockResolvedValue(mockArticles);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getNews('f1');

      expect(cacheService.set).toHaveBeenCalledWith(
        'news:f1',
        expect.any(Object),
        3600, // Default 60 minutes * 60 seconds
      );
    });
  });
});

