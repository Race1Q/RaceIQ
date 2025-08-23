// src/seasons/seasons.controller.ts
import { Controller, Post } from '@nestjs/common';
import { SeasonIngestService } from './seasons-ingest.service';

@Controller('seasons')
export class SeasonsController {
  constructor(
    private readonly seasonIngestService: SeasonIngestService,
  ) {}

  /**
   * POST endpoint to trigger the ingestion of all seasons.
   * @returns A promise of the ingestion summary.
   */
  @Post('ingest')
  async ingestSeasons(): Promise<{ created: number; updated: number }> {
    return this.seasonIngestService.ingestSeasons();
  }
}
