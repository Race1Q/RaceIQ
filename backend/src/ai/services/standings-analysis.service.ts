import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { StandingsService } from '../../standings/standings.service';
import { AiStandingsAnalysisDto } from '../dto/ai-standings-analysis.dto';

@Injectable()
export class StandingsAnalysisService {
  private readonly logger = new Logger(StandingsAnalysisService.name);
  private readonly CACHE_TTL_HOURS = 12; // 12 hours cache for standings analysis

  constructor(
    private readonly geminiService: GeminiService,
    private readonly cacheService: PersistentCacheService,
    private readonly standingsService: StandingsService,
  ) {}

  async getStandingsAnalysis(season?: number): Promise<AiStandingsAnalysisDto> {
    const currentSeason = season || new Date().getFullYear();
    const cacheKey = `standings-analysis-${currentSeason}`;
    
    // Check cache first
    const cached = this.cacheService.get<AiStandingsAnalysisDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for standings analysis: ${cacheKey}`);
      return cached;
    }

    this.logger.log(`Generating AI standings analysis for season: ${currentSeason}`);

    try {
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

      // Cache the result
      await this.cacheService.set(cacheKey, result, this.CACHE_TTL_HOURS * 3600);

      return result;

    } catch (error) {
      this.logger.error(`Error generating standings analysis: ${error.message}`, error.stack);
      
      // Return fallback data
      return {
        overview: `The ${currentSeason} Formula 1 season continues to deliver exciting championship battles across both driver and constructor standings.`,
        keyInsights: [
          'Championship battles are heating up as we approach the season midpoint',
          'Consistent point scoring has been key to championship success',
          'Midfield teams are showing increased competitiveness',
          'Development race is intensifying between top teams'
        ],
        driverAnalysis: {
          leader: 'The championship leader continues to show strong consistency and racecraft.',
          biggestRiser: 'Several drivers have shown impressive improvement in recent races.',
          biggestFall: 'Some drivers have faced challenges adapting to the current regulations.',
          midfieldBattle: 'The midfield battle remains incredibly tight with multiple drivers fighting for position.'
        },
        constructorAnalysis: {
          leader: 'The leading constructor has demonstrated superior car development and strategy.',
          competition: 'The constructor championship remains competitive with multiple teams in contention.',
          surprises: 'Some teams have exceeded expectations while others have faced unexpected challenges.'
        },
        trends: [
          'Increased competitiveness across the grid',
          'Strategic decisions playing crucial role in race outcomes',
          'Development race intensifying as season progresses'
        ],
        predictions: [
          'Championship battles likely to intensify in second half of season',
          'Midfield teams expected to continue closing gap to front runners',
          'Constructor championship could go down to the wire'
        ],
        generatedAt: new Date().toISOString(),
        isFallback: true,
      };
    }
  }
}
