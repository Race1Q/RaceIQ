import { Controller, Get, Param, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiParam, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { NewsService } from './services/news.service';
import { BioService } from './services/bio.service';
import { PreviewService } from './services/preview.service';
import { QuotaService } from './services/quota.service';
import { ConstructorInfoService } from './services/constructor-info.service';
import { StandingsAnalysisService } from './services/standings-analysis.service';
import { FunFactsService } from './services/fun-facts.service';
import { AiNewsDto } from './dto/ai-news.dto';
import { AiDriverBioDto } from './dto/ai-bio.dto';
import { AiTrackPreviewDto } from './dto/ai-preview.dto';
import { AiConstructorInfoDto } from './dto/ai-constructor-info.dto';
import { AiStandingsAnalysisDto } from './dto/ai-standings-analysis.dto';
import { AiDriverFunFactsDto } from './dto/ai-fun-facts.dto';

@ApiTags('AI')
@Controller('ai')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute per user
export class AiController {
  constructor(
    private readonly newsService: NewsService,
    private readonly bioService: BioService,
    private readonly previewService: PreviewService,
    private readonly quotaService: QuotaService,
    private readonly constructorInfoService: ConstructorInfoService,
    private readonly standingsAnalysisService: StandingsAnalysisService,
    private readonly funFactsService: FunFactsService,
  ) {}

  @Get('news')
  @Public()
  @ApiOperation({ summary: 'Get AI-generated F1 news summary with citations' })
  @ApiQuery({ name: 'topic', required: false, type: String, description: 'News topic filter (default: f1)' })
  @ApiOkResponse({ type: AiNewsDto })
  async getNews(@Query('topic') topic = 'f1'): Promise<AiNewsDto> {
    return this.newsService.getNews(topic);
  }

  @ApiExcludeEndpoint()
  @Get('driver/:driverId/bio')
  @Public()
  @ApiOperation({ summary: 'Get AI-generated driver biography' })
  @ApiParam({ name: 'driverId', type: Number, description: 'Driver ID' })
  @ApiQuery({ name: 'season', required: false, type: Number, description: 'Optional season year for season-specific bio' })
  @ApiOkResponse({ type: AiDriverBioDto })
  async getDriverBio(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query('season') season?: string,
  ): Promise<AiDriverBioDto> {
    const seasonNumber = season ? parseInt(season, 10) : undefined;
    return this.bioService.getDriverBio(driverId, seasonNumber);
  }

  @ApiExcludeEndpoint()
  @Get('track/:slug/preview')
  @Public()
  @ApiOperation({ summary: 'Get AI-generated track preview with strategy insights' })
  @ApiParam({ name: 'slug', type: String, description: 'Track slug identifier' })
  @ApiQuery({ name: 'eventId', required: false, type: Number, description: 'Optional event ID for event-specific preview' })
  @ApiOkResponse({ type: AiTrackPreviewDto })
  async getTrackPreview(
    @Param('slug') slug: string,
    @Query('eventId') eventId?: string,
  ): Promise<AiTrackPreviewDto> {
    const eventIdNumber = eventId ? parseInt(eventId, 10) : undefined;
    return this.previewService.getTrackPreview(slug, eventIdNumber);
  }

  @ApiExcludeEndpoint()
  @Get('constructor/:constructorId/info')
  @Public()
  @ApiOperation({ summary: 'Get AI-generated constructor team analysis' })
  @ApiParam({ name: 'constructorId', type: Number, description: 'Constructor ID' })
  @ApiQuery({ name: 'season', required: false, type: Number, description: 'Optional season year for season-specific analysis' })
  @ApiOkResponse({ type: AiConstructorInfoDto })
  async getConstructorInfo(
    @Param('constructorId', ParseIntPipe) constructorId: number,
    @Query('season') season?: string,
  ): Promise<AiConstructorInfoDto> {
    const seasonNumber = season ? parseInt(season, 10) : undefined;
    return this.constructorInfoService.getConstructorInfo(constructorId, seasonNumber);
  }

  @Get('standings/analysis')
  @Public()
  @ApiOperation({ summary: 'Get AI-generated standings analysis with championship insights' })
  @ApiQuery({ name: 'season', required: false, type: Number, description: 'Optional season year for analysis (default: current year)' })
  @ApiOkResponse({ type: AiStandingsAnalysisDto })
  async getStandingsAnalysis(
    @Query('season') season?: string,
  ): Promise<AiStandingsAnalysisDto> {
    const seasonNumber = season ? parseInt(season, 10) : undefined;
    return this.standingsAnalysisService.getStandingsAnalysis(seasonNumber);
  }

  @ApiExcludeEndpoint()
  @Get('driver/:driverId/fun-facts')
  @Public()
  @ApiOperation({ summary: 'Get AI-generated fun facts about a driver' })
  @ApiParam({ name: 'driverId', type: Number, description: 'Driver ID' })
  @ApiQuery({ name: 'season', required: false, type: Number, description: 'Optional season year for season-specific facts' })
  @ApiOkResponse({ type: AiDriverFunFactsDto })
  async getDriverFunFacts(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query('season') season?: string,
  ): Promise<AiDriverFunFactsDto> {
    const seasonNumber = season ? parseInt(season, 10) : undefined;
    
    // Add validation for season parameter
    if (season && (isNaN(seasonNumber!) || seasonNumber === undefined)) {
      throw new BadRequestException('Invalid season parameter. Must be a number.');
    }
    
    // Validate season range
    if (seasonNumber && (seasonNumber < 1950 || seasonNumber > new Date().getFullYear() + 1)) {
      throw new BadRequestException('Season must be between 1950 and next year');
    }
    
    return this.funFactsService.getDriverFunFacts(driverId, seasonNumber);
  }

  @Get('quota')
  @Public()
  @ApiOperation({ summary: 'Get remaining API quota for today' })
  @ApiOkResponse({ 
    schema: { 
      properties: { 
        remaining: { type: 'number' }, 
        limit: { type: 'number' },
        used: { type: 'number' }
      } 
    } 
  })
  async getQuota(): Promise<{ remaining: number; limit: number; used: number }> {
    const remaining = this.quotaService.getRemaining();
    const limit = 1500; // Free tier limit for Gemini Flash
    return {
      remaining,
      limit,
      used: limit - remaining,
    };
  }
}

