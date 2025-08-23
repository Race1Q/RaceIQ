// src/results/results.controller.ts
import { Controller, Post } from '@nestjs/common';
import { ResultsIngestService } from './results-ingest.service';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsIngestService: ResultsIngestService) {}

  @Post('ingest')
  async ingestAllRaceResults() {
    return this.resultsIngestService.ingestAllRaceResults();
  }
}
