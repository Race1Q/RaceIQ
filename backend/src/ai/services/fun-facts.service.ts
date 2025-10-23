import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { DriverStatsAdapter } from '../adapters/driver-stats.adapter';
import { AiDriverFunFactsDto } from '../dto/ai-fun-facts.dto';
import { FUN_FACTS_SYSTEM_PROMPT, FUN_FACTS_USER_TEMPLATE } from '../prompts/fun-facts.prompt';

@Injectable()
export class FunFactsService {
  private readonly logger = new Logger(FunFactsService.name);
  private readonly funFactsTTL: number;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly quotaService: QuotaService,
    private readonly cache: PersistentCacheService,
    private readonly driverStatsAdapter: DriverStatsAdapter,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 24 hours
    const ttlHours = this.config.get<number>('AI_FUN_FACTS_TTL_H') || 24; // 24 hours default
    this.funFactsTTL = ttlHours * 3600; // Convert hours to seconds
  }

  /**
   * Get AI-generated fun facts about a driver
   * @param driverId Driver ID
   * @param season Optional season year for season-specific facts
   */
  async getDriverFunFacts(driverId: number, season?: number): Promise<AiDriverFunFactsDto> {
    const cacheKey = `fun-facts:${driverId}:${season || 'career'}`;

    try {
      // Check cache first
      const cached = this.cache.get<AiDriverFunFactsDto>(cacheKey);
      if (cached) {
        this.logger.log(`Returning cached fun facts for driver ${driverId}${season ? `, season ${season}` : ''}`);
        return cached;
      }

      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        this.logger.warn('AI features are disabled, returning fallback');
        return this.getFallbackFunFacts(driverId, season);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        this.logger.warn('Daily quota exceeded, trying stale cache or fallback');
        const stale = this.cache.get<AiDriverFunFactsDto>(cacheKey, true);
        if (stale) {
          return { ...stale, isFallback: true };
        }
        return this.getFallbackFunFacts(driverId, season);
      }

      // Fetch driver data
      this.logger.log(`Fetching driver data for fun facts generation: driver ${driverId}`);
      const driverData = await this.driverStatsAdapter.getDriverData(driverId, season);

      // Generate AI fun facts
      this.logger.log(`Generating AI fun facts for driver ${driverId}${season ? `, season ${season}` : ''}`);
      const userPrompt = FUN_FACTS_USER_TEMPLATE(driverData, season);

      interface GeminiFunFactsResponse {
        title: string;
        facts: string[];
      }

      const aiResponse = await this.geminiService.generateJSON<GeminiFunFactsResponse>(
        FUN_FACTS_SYSTEM_PROMPT,
        userPrompt,
      );

      // Track quota usage
      this.quotaService.increment();

      // Build response
      const response: AiDriverFunFactsDto = {
        driverId,
        season: season || null,
        title: aiResponse.title,
        facts: aiResponse.facts,
        generatedAt: new Date().toISOString(),
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
      };

      // Cache the response
      await this.cache.set(cacheKey, response, this.funFactsTTL);
      this.logger.log(`Successfully generated and cached fun facts for driver ${driverId}`);

      return response;
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating driver fun facts: ${error.message}`, error.stack);

      // Try to return stale cache on error
      const stale = this.cache.get<AiDriverFunFactsDto>(cacheKey, true);
      if (stale) {
        this.logger.log('Returning stale cache due to error');
        return { ...stale, isFallback: true };
      }

      // Final fallback
      return this.getFallbackFunFacts(driverId, season);
    }
  }

  /**
   * Fallback fun facts when AI generation fails
   */
  private getFallbackFunFacts(driverId: number, season?: number): AiDriverFunFactsDto {
    return {
      driverId,
      season: season || null,
      title: 'Driver Fun Facts',
      facts: [
        'Fun facts are being generated for this driver.',
        'Check back in a few moments for interesting trivia and insights.',
        "Visit the driver's profile for detailed statistics and career information.",
      ],
      generatedAt: new Date().toISOString(),
      isFallback: true,
      aiAttribution: 'Powered by Gemini AI',
    };
  }
}
