import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { AiResponseService } from './ai-response.service';
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
    private readonly aiResponseService: AiResponseService,
    private readonly driverStatsAdapter: DriverStatsAdapter,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 4380 hours (6 months)
    const ttlHours = this.config.get<number>('AI_BIO_TTL_H') || 4380; // 6 months
    this.bioTTL = ttlHours * 3600; // Convert hours to seconds
  }

  /**
   * Get AI-generated driver biography
   * @param driverId Driver ID
   * @param season Optional season year for season-specific bio
   */
  async getDriverBio(driverId: number, season?: number): Promise<AiDriverBioDto> {
    try {
      // 1. Check database for cached response with expiration check
      const cached = await this.aiResponseService.getLatestResponseIfValid<AiDriverBioDto>(
        'bio',
        'driver',
        driverId,
        this.bioTTL,
        season,
      );

      // 2. If found and valid, return cached response
      if (cached && !cached.isExpired) {
        this.logger.log(`Returning valid cached bio for driver ${driverId}${season ? `, season ${season}` : ''}`);
        return cached.data;
      }

      // 3. If found but expired, or not found - try to generate new response
      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('AI features disabled, returning expired cached bio');
          return cached.data;
        }
        return this.getFallbackBio(driverId, season);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('Daily quota exceeded, returning expired cached bio');
          return cached.data;
        }
        return this.getFallbackBio(driverId, season);
      }

      // 4. Try to generate new response
      try {
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

        // 5. If expired response existed, delete it before storing new one
        if (cached?.isExpired) {
          await this.aiResponseService.deleteLatestResponse(
            'bio',
            'driver',
            driverId,
            season,
          );
        }

        // 6. Store the new response in database
        await this.aiResponseService.storeResponse(
          'bio',
          'driver',
          driverId,
          response,
          season,
        );
        this.logger.log(`Successfully generated and stored bio for driver ${driverId}`);

        return response;
      } catch (apiError) {
        // 7. API failed - return expired cached if available
        if (cached?.isExpired) {
          this.logger.warn(`API failed, returning expired cached bio: ${apiError.message}`);
          return cached.data;
        }
        // 8. No cached response - return fallback
        this.logger.error(`No cached response and API failed: ${apiError.message}`);
        return this.getFallbackBio(driverId, season);
      }
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating driver bio: ${error.message}`, error.stack);

      // Final fallback
      return this.getFallbackBio(driverId, season);
    }
  }

  /**
   * Fallback bio when AI generation fails and no cached response available
   */
  private getFallbackBio(driverId: number, season?: number): AiDriverBioDto {
    return {
      driverId,
      season: season || null,
      title: 'Driver Biography',
      teaser: 'Driver biography data is currently unavailable. Please try again later.',
      paragraphs: [
        'Data is being generated',
        'Please check back shortly',
      ],
      highlights: [
        'Data is being generated',
        'Please check back shortly',
      ],
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }
}

