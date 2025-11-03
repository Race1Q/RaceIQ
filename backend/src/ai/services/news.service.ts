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
      // Check database for latest response first
      const latestResponse = await this.aiResponseService.getLatestResponse<AiNewsDto>(
        'news',
        'general',
        0, // Use 0 for general news (no specific entity)
        undefined, // No season
        undefined, // No event
      );

      if (latestResponse) {
        this.logger.log(`Returning latest database response for news topic: ${topic}`);
        return latestResponse;
      }

      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        this.logger.warn('AI features are disabled, returning fallback');
        return this.getFallbackNews(topic);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        this.logger.warn('Daily quota exceeded, using fallback');
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

      // Store the response in database
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
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating news summary: ${error.message}`, error.stack);

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

