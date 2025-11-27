import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { QuotaService } from './quota.service';
import { AiResponseService } from './ai-response.service';
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
    private readonly aiResponseService: AiResponseService,
    private readonly driverStatsAdapter: DriverStatsAdapter,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 720 hours (1 month)
    const ttlHours = this.config.get<number>('AI_FUN_FACTS_TTL_H') || 720; // 1 month
    this.funFactsTTL = ttlHours * 3600; // Convert hours to seconds
  }

  /**
   * Get AI-generated fun facts about a driver
   * @param driverId Driver ID
   * @param season Optional season year for season-specific facts
   */
  async getDriverFunFacts(driverId: number, season?: number): Promise<AiDriverFunFactsDto> {
    try {
      // 1. Check database for cached response with expiration check
      const cached = await this.aiResponseService.getLatestResponseIfValid<AiDriverFunFactsDto>(
        'fun_facts',
        'driver',
        driverId,
        this.funFactsTTL,
        season,
      );

      // 2. If found and valid, return cached response
      if (cached && !cached.isExpired) {
        this.logger.log(`Returning valid cached fun facts for driver ${driverId}${season ? `, season ${season}` : ''}`);
        return cached.data;
      }

      // 3. If found but expired, or not found - try to generate new response
      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('AI features disabled, returning expired cached fun facts');
          return cached.data;
        }
        return this.getFallbackFunFacts(driverId, season);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        // Return expired cached if available, otherwise fallback
        if (cached?.isExpired) {
          this.logger.warn('Daily quota exceeded, returning expired cached fun facts');
          return cached.data;
        }
        return this.getFallbackFunFacts(driverId, season);
      }

      // 4. Try to generate new response
      try {
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

        // 5. If expired response existed, delete it before storing new one
        if (cached?.isExpired) {
          await this.aiResponseService.deleteLatestResponse(
            'fun_facts',
            'driver',
            driverId,
            season,
          );
        }

        // 6. Store the new response in database
        await this.aiResponseService.storeResponse(
          'fun_facts',
          'driver',
          driverId,
          response,
          season,
        );
        this.logger.log(`Successfully generated and stored fun facts for driver ${driverId}`);

        return response;
      } catch (apiError) {
        // 7. API failed - return expired cached if available
        if (cached?.isExpired) {
          this.logger.warn(`API failed, returning expired cached fun facts: ${apiError.message}`);
          return cached.data;
        }
        // 8. No cached response - return fallback
        this.logger.error(`No cached response and API failed: ${apiError.message}`);
        return this.getFallbackFunFacts(driverId, season);
      }
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating driver fun facts: ${error.message}`, error.stack);

      // Final fallback
      return this.getFallbackFunFacts(driverId, season);
    }
  }

  /**
   * Fallback fun facts when AI generation fails and no cached response available
   */
  private getFallbackFunFacts(driverId: number, season?: number): AiDriverFunFactsDto {
    return {
      driverId,
      season: season || null,
      title: 'Driver Fun Facts',
      facts: [
        'Fun facts data is currently unavailable. Please try again later.',
        'Data is being generated',
        'Please check back shortly',
      ],
      generatedAt: new Date().toISOString(),
      isFallback: true,
      aiAttribution: 'Powered by Gemini AI',
    };
  }
}
