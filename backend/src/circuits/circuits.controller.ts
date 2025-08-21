// src/circuits/circuits.controller.ts
import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { CircuitsService } from './circuits.service';
import { CircuitIngestService } from './circuits-ingest.service';
import { Circuit } from './circuits.entity';

@Controller('circuits')
export class CircuitsController {
  constructor(
    private readonly circuitsService: CircuitsService,
    private readonly circuitIngestService: CircuitIngestService,
  ) {}

  @Post('ingest')
  async ingestCircuits() {
    return this.circuitIngestService.ingestCircuits();
  }

  @Get()
  async getAllCircuits(): Promise<Circuit[]> {
    return this.circuitsService.getAllCircuits();
  }

  @Get('test-connection')
  async testConnection() {
    const result = await this.circuitsService.testConnection();
    return { success: result };
  }

  @Get('search')
  async searchCircuits(@Query('q') query: string): Promise<Circuit[]> {
    return this.circuitsService.searchCircuits(query);
  }

  @Get('country/:countryCode')
  async getCircuitsByCountry(@Param('countryCode') countryCode: string): Promise<Circuit[]> {
    return this.circuitsService.getCircuitsByCountry(countryCode);
  }

  @Get('id/:id')
  async getCircuitById(@Param('id') id: number): Promise<Circuit | null> {
    return this.circuitsService.getCircuitById(id);
  }

  @Get('name/:name')
  async getCircuitByName(@Param('name') name: string): Promise<Circuit | null> {
    return this.circuitsService.getCircuitByName(name);
  }
}