import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { NewsFeedAdapter } from '../adapters/news-feed.adapter';
import { AiResponseService } from './ai-response.service';
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
    private readonly aiResponseService: AiResponseService,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 720 minutes (12 hours)
    this.newsTTL = (this.config.get<number>('AI_NEWS_TTL_MIN') || 720) * 60;
  }

  /**
   * Get AI-generated news summary with citations
   * @param topic News topic filter
   */
  async getNews(topic: string = 'f1'): Promise<AiNewsDto> {
    try {
      // 1. Check database for cached response with expiration check
      const cached = await this.aiResponseService.getLatestResponseIfValid<AiNewsDto>(
        'news',
        'general',
        0, // Use 0 for general news (no specific entity)
        this.newsTTL,
        undefined, // No season
        undefined, // No event
      );

      // 2. If found and valid, return cached response
      if (cached && !cached.isExpired) {
        this.logger.log(`Returning valid cached news response for topic: ${topic}`);
        return cached.data;
      }

      // 3. If found but expired, or not found - try to generate new response
      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('AI features disabled, returning expired cached news response');
          return cached.data;
        }
        return this.getFallbackNews(topic);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('Daily quota exceeded, returning expired cached news response');
          return cached.data;
        }
        return this.getFallbackNews(topic);
      }

      // 4. Try to generate new response
      try {
        // Fetch news articles
        this.logger.log(`Fetching news articles for topic: ${topic}`);
        const articles = await this.newsFeedAdapter.fetchNews(topic, 10);

        if (articles.length === 0) {
          // Return expired cached if available, otherwise fallback
          if (cached?.isExpired) {
            this.logger.warn('No articles found, returning expired cached news response');
            return cached.data;
          }
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

        // 5. If expired response existed, delete it before storing new one
        if (cached?.isExpired) {
          await this.aiResponseService.deleteLatestResponse(
            'news',
            'general',
            0,
            undefined,
            undefined,
          );
        }

        // 6. Store the new response in database
        await this.aiResponseService.storeResponse(
          'news',
          'general',
          0, // Use 0 for general news (no specific entity)
          response,
          undefined,
          undefined,
          false,
          'Powered by Gemini AI'
        );
        this.logger.log(`Successfully generated and stored news for topic: ${topic}`);

        return response;
      } catch (apiError) {
        // 7. API failed - return expired cached if available
        if (cached?.isExpired) {
          this.logger.warn(`API failed, returning expired cached news response: ${apiError.message}`);
          return cached.data;
        }
        // 8. No cached response - return fallback
        this.logger.error(`No cached response and API failed: ${apiError.message}`);
        return this.getFallbackNews(topic);
      }
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating news summary: ${error.message}`, error.stack);

      // Final fallback
      return this.getFallbackNews(topic);
    }
  }

  /**
   * Fallback news when AI generation fails and no cached response available
   */
  private getFallbackNews(topic: string): AiNewsDto {
    return {
      summary: 'F1 news data is currently unavailable. Please try again later.',
      bullets: [
        'Data is being generated',
        'Please check back shortly',
      ],
      citations: [],
      generatedAt: new Date().toISOString(),
      ttlSeconds: 300, // 5 minutes
      isFallback: true,
    };
  }
}

