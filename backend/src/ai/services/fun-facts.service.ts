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
      // Check database for latest response first
      const latestResponse = await this.aiResponseService.getLatestResponse<AiDriverFunFactsDto>(
        'fun_facts',
        'driver',
        driverId,
        season,
      );

      if (latestResponse) {
        this.logger.log(`Returning latest database response for driver ${driverId}${season ? `, season ${season}` : ''}`);
        return latestResponse;
      }

      // Check if AI features are enabled
      const aiEnabled = this.config.get<boolean>('AI_FEATURES_ENABLED');
      if (!aiEnabled) {
        this.logger.warn('AI features are disabled, returning fallback');
        return this.getFallbackFunFacts(driverId, season);
      }

      // Check quota
      if (!this.quotaService.hasQuota()) {
        this.logger.warn('Daily quota exceeded, using fallback');
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

      // Store the response in database
      await this.aiResponseService.storeResponse(
        'fun_facts',
        'driver',
        driverId,
        response,
        season,
      );
      this.logger.log(`Successfully generated and stored fun facts for driver ${driverId}`);

      return response;
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating driver fun facts: ${error.message}`, error.stack);

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
