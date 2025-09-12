// src/qualifying-results/qualifying-results.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';
import { QualifyingResultsService } from './qualifying-results.service';

@Controller('qualifying-results')
export class QualifyingResultsController {
  constructor(
    private readonly service: QualifyingResultsService,
  ) {}

  @Get('session/:sessionId')
  async getBySession(@Param('sessionId') sessionId: string) {
    return this.service.getBySessionId(parseInt(sessionId));
  }

}


