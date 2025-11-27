import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { AiResponseService } from './ai-response.service';
import { StandingsService } from '../../standings/standings.service';
import { AiStandingsAnalysisDto } from '../dto/ai-standings-analysis.dto';

@Injectable()
export class StandingsAnalysisService {
  private readonly logger = new Logger(StandingsAnalysisService.name);
  private readonly CACHE_TTL_SECONDS: number;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly cacheService: PersistentCacheService,
    private readonly aiResponseService: AiResponseService,
    private readonly standingsService: StandingsService,
    private readonly config: ConfigService,
  ) {
    // Get TTL from config, default to 168 hours (1 week)
    const ttlHours = this.config.get<number>('AI_STANDINGS_TTL_H') || 168;
    this.CACHE_TTL_SECONDS = ttlHours * 3600; // Convert hours to seconds
  }

  async getStandingsAnalysis(season?: number): Promise<AiStandingsAnalysisDto> {
    const currentSeason = season || new Date().getFullYear();
    
    try {
      // 1. Check database for cached response with expiration check
      const cached = await this.aiResponseService.getLatestResponseIfValid<AiStandingsAnalysisDto>(
        'standings_analysis',
        'season',
        currentSeason,
        this.CACHE_TTL_SECONDS,
        currentSeason,
      );

      // 2. If found and valid, return cached response
      if (cached && !cached.isExpired) {
        this.logger.log(`Returning valid cached standings analysis for season ${currentSeason}`);
        return cached.data;
      }

      // 3. If found but expired, or not found - try to generate new response
      // 4. Try to generate new response
      try {
        this.logger.log(`Generating AI standings analysis for season: ${currentSeason}`);

        // Fetch current standings data
        const standingsData = await this.standingsService.getStandingsByYear(currentSeason);
        const driverStandings = standingsData.driverStandings;
        const constructorStandings = standingsData.constructorStandings;

        // Prepare data for Gemini
        const analysisData = {
          season: currentSeason,
          drivers: driverStandings.slice(0, 10).map(driver => ({
            position: driver.position,
            name: driver.driverFullName,
            constructor: driver.constructorName,
            points: driver.points,
            wins: driver.wins,
            podiums: 0, // Not available in current DTO
          })),
          constructors: constructorStandings.slice(0, 10).map(constructor => ({
            position: constructor.position,
            name: constructor.team.name,
            points: constructor.points,
            wins: constructor.wins,
            podiums: 0, // Not available in current DTO
          })),
        };

        const systemPrompt = `You are an expert F1 analyst and commentator. Generate comprehensive, engaging analysis of Formula 1 championship standings based on the current data. Focus on providing insightful commentary that would interest F1 fans, including championship battles, trends, surprises, and predictions.`;

        const userPrompt = `Generate detailed analysis of the ${analysisData.season} Formula 1 championship standings.

Current Driver Standings (Top 10):
${analysisData.drivers.map((d, i) => `${i + 1}. ${d.name} (${d.constructor}) - ${d.points} pts (${d.wins} wins, ${d.podiums} podiums)`).join('\n')}

Current Constructor Standings (Top 10):
${analysisData.constructors.map((c, i) => `${i + 1}. ${c.name} - ${c.points} pts (${c.wins} wins, ${c.podiums} podiums)`).join('\n')}

Please provide:
1. A compelling overview of the current championship situation
2. Key insights and highlights from the standings
3. Driver championship analysis (leader, biggest riser, biggest fall, midfield battle)
4. Constructor championship analysis (leader, competition, surprises)
5. Current trends and patterns you observe
6. Predictions for the remainder of the season

Format as JSON with these exact fields:
{
  "overview": "engaging 2-3 sentence overview of the championship situation",
  "keyInsights": ["insight1", "insight2", "insight3", "insight4"],
  "driverAnalysis": {
    "leader": "analysis of championship leader",
    "biggestRiser": "analysis of driver who has improved most",
    "biggestFall": "analysis of driver who has dropped most",
    "midfieldBattle": "analysis of midfield competition"
  },
  "constructorAnalysis": {
    "leader": "analysis of constructor championship leader",
    "competition": "analysis of competition for constructor title",
    "surprises": "analysis of surprising constructor performances"
  },
  "trends": ["trend1", "trend2", "trend3"],
  "predictions": ["prediction1", "prediction2", "prediction3"]
}

Make it engaging and informative for F1 fans, with specific insights about the current championship battles.`;

        const aiResponse = await this.geminiService.generateJSON<Omit<AiStandingsAnalysisDto, 'generatedAt' | 'isFallback'>>(
          systemPrompt,
          userPrompt
        );

        const result: AiStandingsAnalysisDto = {
          ...aiResponse,
          generatedAt: new Date().toISOString(),
          isFallback: false,
        };

        // 5. If expired response existed, delete it before storing new one
        if (cached?.isExpired) {
          await this.aiResponseService.deleteLatestResponse(
            'standings_analysis',
            'season',
            currentSeason,
            currentSeason,
          );
        }

        // 6. Store the new response in database
        await this.aiResponseService.storeResponse(
          'standings_analysis',
          'season',
          currentSeason,
          result,
          currentSeason,
          undefined,
          false,
          'Powered by Gemini AI'
        );

        return result;
      } catch (apiError) {
        // 7. API failed - return expired cached if available
        if (cached?.isExpired) {
          this.logger.warn(`API failed, returning expired cached standings analysis: ${apiError.message}`);
          return cached.data;
        }
        // 8. No cached response - return fallback
        this.logger.error(`No cached response and API failed: ${apiError.message}`);
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error generating standings analysis: ${error.message}`, error.stack);
      
      // Final fallback
      return {
        overview: `Standings analysis data is currently unavailable. Please try again later.`,
        keyInsights: [
          'Data is being generated',
          'Please check back shortly',
        ],
        driverAnalysis: {
          leader: 'Data is being generated.',
          biggestRiser: 'Data is being generated.',
          biggestFall: 'Data is being generated.',
          midfieldBattle: 'Data is being generated.'
        },
        constructorAnalysis: {
          leader: 'Data is being generated.',
          competition: 'Data is being generated.',
          surprises: 'Data is being generated.'
        },
        trends: [
          'Data is being generated',
          'Please check back shortly',
        ],
        predictions: [
          'Data is being generated',
          'Please check back shortly',
        ],
        generatedAt: new Date().toISOString(),
        isFallback: true,
      };
    }
  }
}
