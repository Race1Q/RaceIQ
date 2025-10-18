import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { DriverStatsAdapter } from '../adapters/driver-stats.adapter';
import { AiDriverBioDto } from '../dto/ai-bio.dto';
import { BIO_SYSTEM_PROMPT, BIO_USER_TEMPLATE } from '../prompts/bio.prompt';

@Injectable()
export class BioService {
  private readonly logger = new Logger(BioService.name);
  private readonly bioTTL: number;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly quotaService: QuotaService,
    private readonly cache: PersistentCacheService,
    private readonly driverStatsAdapter: DriverStatsAdapter,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 48 hours
    const ttlHours = this.config.get<number>('AI_BIO_TTL_H') || 48;
    this.bioTTL = ttlHours * 3600; // Convert hours to seconds
  }

  /**
   * Get AI-generated driver biography
   * @param driverId Driver ID
   * @param season Optional season year for season-specific bio
   */
  async getDriverBio(driverId: number, season?: number): Promise<AiDriverBioDto> {
    const cacheKey = `bio:${driverId}:${season || 'career'}`;

    try {
      // Check cache first
      const cached = this.cache.get<AiDriverBioDto>(cacheKey);
      if (cached) {
        this.logger.log(`Returning cached bio for driver ${driverId}${season ? `, season ${season}` : ''}`);
        return cached;
      }

      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        this.logger.warn('AI features are disabled, returning fallback');
        return this.getFallbackBio(driverId, season);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        this.logger.warn('Daily quota exceeded, trying stale cache or fallback');
        const stale = this.cache.get<AiDriverBioDto>(cacheKey, true);
        if (stale) {
          return { ...stale, isFallback: true };
        }
        return this.getFallbackBio(driverId, season);
      }

      // Fetch driver data
      this.logger.log(`Fetching driver data for bio generation: driver ${driverId}`);
      const driverData = await this.driverStatsAdapter.getDriverData(driverId, season);

      // Generate AI bio
      this.logger.log(`Generating AI bio for driver ${driverId}${season ? `, season ${season}` : ''}`);
      const userPrompt = BIO_USER_TEMPLATE(driverData, season);

      interface GeminiBioResponse {
        title: string;
        teaser: string;
        paragraphs: string[];
        highlights: string[];
      }

      const aiResponse = await this.geminiService.generateJSON<GeminiBioResponse>(
        BIO_SYSTEM_PROMPT,
        userPrompt
      );

      // Track quota usage
      this.quotaService.increment();

      // Build response
      const response: AiDriverBioDto = {
        driverId,
        season: season || null,
        title: aiResponse.title,
        teaser: aiResponse.teaser,
        paragraphs: aiResponse.paragraphs,
        highlights: aiResponse.highlights,
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };

      // Cache the response
      await this.cache.set(cacheKey, response, this.bioTTL);
      this.logger.log(`Successfully generated and cached bio for driver ${driverId}`);

      return response;
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating driver bio: ${error.message}`, error.stack);

      // Try to return stale cache on error
      const stale = this.cache.get<AiDriverBioDto>(cacheKey, true);
      if (stale) {
        this.logger.log('Returning stale cache due to error');
        return { ...stale, isFallback: true };
      }

      // Final fallback
      return this.getFallbackBio(driverId, season);
    }
  }

  /**
   * Fallback bio when AI generation fails
   */
  private getFallbackBio(driverId: number, season?: number): AiDriverBioDto {
    return {
      driverId,
      season: season || null,
      title: 'Driver Biography',
      teaser: 'AI-generated biography is temporarily unavailable.',
      paragraphs: [
        'This driver\'s comprehensive biography is being generated.',
        'Please check back in a few moments for AI-powered insights into their career, achievements, and racing history.',
      ],
      highlights: [
        'Biography generation in progress',
        'Visit the driver\'s statistics page for detailed performance data',
      ],
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }
}

