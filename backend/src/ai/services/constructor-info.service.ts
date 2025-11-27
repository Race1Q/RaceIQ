import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { AiResponseService } from './ai-response.service';
import { ConstructorsService } from '../../constructors/constructors.service';
import { DriversService } from '../../drivers/drivers.service';
import { RacesService } from '../../races/races.service';
import { AiConstructorInfoDto } from '../dto/ai-constructor-info.dto';

@Injectable()
export class ConstructorInfoService {
  private readonly logger = new Logger(ConstructorInfoService.name);
  private readonly CACHE_TTL_SECONDS: number;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly cacheService: PersistentCacheService,
    private readonly aiResponseService: AiResponseService,
    private readonly constructorsService: ConstructorsService,
    private readonly driversService: DriversService,
    private readonly racesService: RacesService,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 4380 hours (6 months)
    const ttlHours = this.config.get<number>('AI_CONSTRUCTOR_INFO_TTL_H') || 4380;
    this.CACHE_TTL_SECONDS = ttlHours * 3600; // Convert hours to seconds
  }

  async getConstructorInfo(constructorId: number, season?: number): Promise<AiConstructorInfoDto> {
    try {
      // 1. Check database for cached response with expiration check
      const cached = await this.aiResponseService.getLatestResponseIfValid<AiConstructorInfoDto>(
        'constructor_info',
        'constructor',
        constructorId,
        this.CACHE_TTL_SECONDS,
        season,
      );

      // 2. If found and valid, return cached response
      if (cached && !cached.isExpired) {
        this.logger.log(`Returning valid cached constructor info for constructor ${constructorId}${season ? `, season ${season}` : ''}`);
        return cached.data;
      }

      // 3. If found but expired, or not found - try to generate new response
      // 4. Try to generate new response
      try {
        this.logger.log(`Generating AI constructor info for constructorId: ${constructorId}, season: ${season || 'all'}`);

      // Fetch constructor data
      const constructor = await this.constructorsService.findOne(constructorId);
      if (!constructor) {
        throw new Error(`Constructor with ID ${constructorId} not found`);
      }

      // Fetch drivers for this constructor (using existing method)
      const drivers = await this.driversService.findAll({ year: season || new Date().getFullYear() });
      const constructorDrivers = drivers.filter(driver => driver.constructorId === constructorId);
      
      // Fetch recent race results for context (simple approach)
      const recentResults: Array<{
        raceName: string;
        position: number;
        points: number;
        season: string;
      }> = [];

      // Prepare data for Gemini
      const constructorData = {
        name: constructor.name,
        nationality: constructor.nationality,
        drivers: constructorDrivers.map(driver => ({
          name: driver.name || driver.driverName,
          code: driver.code || driver.driverCode,
          nationality: driver.nationality || driver.driverNationality,
        })),
        recentResults: recentResults,
        season: season || new Date().getFullYear(),
      };

      const systemPrompt = `You are an expert F1 analyst and historian. Generate comprehensive, engaging information about F1 constructors (teams) based on their data and performance history. Focus on providing insightful analysis that would interest F1 fans.`;

      const userPrompt = `Generate detailed information about the F1 constructor "${constructorData.name}" (${constructorData.nationality}).

Current drivers: ${constructorData.drivers.map(d => `${d.name} (${d.code})`).join(', ')}

Recent results: No recent results available

Season context: ${constructorData.season}

Please provide:
1. A compelling overview of the team
2. Historical background and heritage
3. Current strengths (3-4 key points)
4. Current challenges (2-3 realistic challenges)
5. Notable achievements and milestones
6. Current season performance analysis with highlights and outlook

Format as JSON with these exact fields:
{
  "overview": "engaging 2-3 sentence overview",
  "history": "detailed historical background",
  "strengths": ["strength1", "strength2", "strength3"],
  "challenges": ["challenge1", "challenge2"],
  "notableAchievements": ["achievement1", "achievement2", "achievement3"],
  "currentSeason": {
    "performance": "season performance summary",
    "highlights": ["highlight1", "highlight2"],
    "outlook": "remaining season outlook"
  }
}

Make it engaging and informative for F1 fans.`;

      const aiResponse = await this.geminiService.generateJSON<Omit<AiConstructorInfoDto, 'generatedAt' | 'isFallback'>>(
        systemPrompt,
        userPrompt
      );

        const result: AiConstructorInfoDto = {
          ...aiResponse,
          generatedAt: new Date().toISOString(),
          isFallback: false,
        };

        // 5. If expired response existed, delete it before storing new one
        if (cached?.isExpired) {
          await this.aiResponseService.deleteLatestResponse(
            'constructor_info',
            'constructor',
            constructorId,
            season,
          );
        }

        // 6. Store the new response in database
        await this.aiResponseService.storeResponse(
          'constructor_info',
          'constructor',
          constructorId,
          result,
          season,
          undefined,
          false,
          'Powered by Gemini AI'
        );

        return result;
      } catch (apiError) {
        // 7. API failed - return expired cached if available
        if (cached?.isExpired) {
          this.logger.warn(`API failed, returning expired cached constructor info: ${apiError.message}`);
          return cached.data;
        }
        // 8. No cached response - return fallback
        this.logger.error(`No cached response and API failed: ${apiError.message}`);
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating constructor info: ${error.message}`, error.stack);
      
      // Final fallback
      const constructorData = await this.constructorsService.findOne(constructorId);
      return {
        overview: `Constructor information data is currently unavailable. Please try again later.`,
        history: 'Data is being generated.',
        strengths: ['Data is being generated'],
        challenges: ['Data is being generated'],
        notableAchievements: ['Data is being generated'],
        currentSeason: {
          performance: 'Data is being generated.',
          highlights: ['Data is being generated'],
          outlook: 'Data is being generated.'
        },
        generatedAt: new Date().toISOString(),
        isFallback: true,
      };
    }
  }
}
