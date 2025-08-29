// src/laps/laps.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LapsIngestService } from './laps-ingest.service';

@Controller('laps')
export class LapsController {
  constructor(private readonly lapsIngestService: LapsIngestService) {}

  @Post('ingest')
  async ingestLaps() {
    return this.lapsIngestService.ingestOnly2024And2025(); // ingest all 2024 & 2025 internally
  }
}





