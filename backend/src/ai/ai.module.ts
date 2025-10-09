import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiController } from './ai.controller';
import { GeminiService } from './services/gemini.service';
import { QuotaService } from './services/quota.service';
import { PersistentCacheService } from './cache/persistent-cache.service';
import { NewsService } from './services/news.service';
import { BioService } from './services/bio.service';
import { PreviewService } from './services/preview.service';
import { NewsFeedAdapter } from './adapters/news-feed.adapter';
import { DriverStatsAdapter } from './adapters/driver-stats.adapter';
import { TrackDataAdapter } from './adapters/track-data.adapter';
import { DriversModule } from '../drivers/drivers.module';
import { RacesModule } from '../races/races.module';
import { CircuitsModule } from '../circuits/circuits.module';
import { ConstructorsModule } from '../constructors/constructors.module';
import { ConstructorInfoService } from './services/constructor-info.service';
import { StandingsAnalysisService } from './services/standings-analysis.service';
import { StandingsModule } from '../standings/standings.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    ThrottlerModule,
    DriversModule,
    RacesModule,
    CircuitsModule,
    ConstructorsModule,
    StandingsModule,
  ],
  controllers: [AiController],
  providers: [
    GeminiService,
    QuotaService,
    PersistentCacheService,
    NewsService,
    BioService,
    PreviewService,
    ConstructorInfoService,
    StandingsAnalysisService,
    NewsFeedAdapter,
    DriverStatsAdapter,
    TrackDataAdapter,
  ],
  exports: [NewsService, BioService, PreviewService],
})
export class AiModule {}

