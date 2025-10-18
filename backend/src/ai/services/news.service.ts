import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { NewsFeedAdapter } from '../adapters/news-feed.adapter';
import { AiNewsDto } from '../dto/ai-news.dto';
import { NEWS_SYSTEM_PROMPT, NEWS_USER_TEMPLATE } from '../prompts/news.prompt';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly newsTTL: number;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly quotaService: QuotaService,
    private readonly cache: PersistentCacheService,
    private readonly newsFeedAdapter: NewsFeedAdapter,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 60 minutes
    this.newsTTL = (this.config.get<number>('AI_NEWS_TTL_MIN') || 60) * 60;
  }

  /**
   * Get AI-generated news summary with citations
   * @param topic News topic filter
   */
  async getNews(topic: string = 'f1'): Promise<AiNewsDto> {
    const cacheKey = `news:${topic}`;

    try {
      // Check cache first
      const cached = this.cache.get<AiNewsDto>(cacheKey);
      if (cached) {
        this.logger.log(`Returning cached news for topic: ${topic}`);
        return cached;
      }

      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        this.logger.warn('AI features are disabled, returning fallback');
        return this.getFallbackNews(topic);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        this.logger.warn('Daily quota exceeded, trying stale cache or fallback');
        const stale = this.cache.get<AiNewsDto>(cacheKey, true); // Get even if expired
        if (stale) {
          return { ...stale, isFallback: true };
        }
        return this.getFallbackNews(topic);
      }

      // Fetch news articles
      this.logger.log(`Fetching news articles for topic: ${topic}`);
      const articles = await this.newsFeedAdapter.fetchNews(topic, 10);

      if (articles.length === 0) {
        this.logger.warn('No articles found, returning fallback');
        return this.getFallbackNews(topic);
      }

      // Generate AI summary
      this.logger.log(`Generating AI summary for ${articles.length} articles`);
      const userPrompt = NEWS_USER_TEMPLATE(articles);
      
      interface GeminiNewsResponse {
        summary: string;
        bullets: string[];
        citations: Array<{ title: string; url: string; source: string }>;
      }

      const aiResponse = await this.geminiService.generateJSON<GeminiNewsResponse>(
        NEWS_SYSTEM_PROMPT,
        userPrompt
      );

      // Track quota usage
      this.quotaService.increment();

      // Build response
      const response: AiNewsDto = {
        summary: aiResponse.summary,
        bullets: aiResponse.bullets,
        citations: aiResponse.citations,
        generatedAt: new Date().toISOString(),
        ttlSeconds: this.newsTTL,
        isFallback: false,
      };

      // Cache the response
      await this.cache.set(cacheKey, response, this.newsTTL);
      this.logger.log(`Successfully generated and cached news for topic: ${topic}`);

      return response;
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating news summary: ${error.message}`, error.stack);

      // Try to return stale cache on error
      const stale = this.cache.get<AiNewsDto>(cacheKey, true);
      if (stale) {
        this.logger.log('Returning stale cache due to error');
        return { ...stale, isFallback: true };
      }

      // Final fallback
      return this.getFallbackNews(topic);
    }
  }

  /**
   * Fallback news when AI generation fails
   */
  private getFallbackNews(topic: string): AiNewsDto {
    return {
      summary: 'F1 news is temporarily unavailable. AI-generated summaries will return shortly.',
      bullets: [
        'Live news summaries are being generated',
        'Visit Formula1.com for the latest updates',
        'Check back in a few minutes for AI-powered news',
      ],
      citations: [
        {
          title: 'Formula 1 Official Website',
          url: 'https://www.formula1.com/en/latest.html',
          source: 'Formula1.com',
        },
      ],
      generatedAt: new Date().toISOString(),
      ttlSeconds: 300, // 5 minutes
      isFallback: true,
    };
  }
}

