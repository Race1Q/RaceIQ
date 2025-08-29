// src/qualifyingResults/qualifyingResults.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';
import { QualifyingResultsService } from './qualifyingResults.service';
import { QualifyingResultsIngestionService } from './qualifyingResults-ingestion.service';

@Controller('qualifying-results')
export class QualifyingResultsController {
  constructor(
    private readonly service: QualifyingResultsService,
    private readonly ingest: QualifyingResultsIngestionService,
  ) {}

  @Get('session/:sessionId')
  async getBySession(@Param('sessionId') sessionId: string) {
    return this.service.getBySessionId(parseInt(sessionId));
  }

  @Post('ingest')
  async ingestAll() {
    return this.ingest.ingestOnly2024And2025();
  }
}


