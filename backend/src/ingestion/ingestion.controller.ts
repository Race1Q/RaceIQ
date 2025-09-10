import { Controller, Post, Logger, Get } from '@nestjs/common';
import { ErgastService } from './ergast.service';

@Controller('ingestion')
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(private readonly ergastService: ErgastService) {}

  @Get('test')
  getTest() {
    this.logger.log('--- Test endpoint was reached successfully! ---');
    return { status: 'ok', message: 'Ingestion controller is working!' };
  }

  @Post('circuits')
  async ingestCircuits() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Circuits ---');
    await this.ergastService.ingestCircuits();
    return { message: 'Circuit ingestion job started. Check server logs for progress.' };
  }

  @Post('constructors')
  async ingestConstructors() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Constructors ---');
    await this.ergastService.ingestConstructors();
    return { message: 'Constructor ingestion job started. Check server logs for progress.' };
  }

  @Post('drivers')
  async ingestDrivers() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Drivers ---');
    await this.ergastService.ingestDrivers();
    return { message: 'Driver ingestion job started. Check server logs for progress.' };
  }

  @Post('races-and-sessions')
  async ingestRacesAndSessions() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Races and Sessions ---');
    await this.ergastService.ingestRacesAndSessions();
    return { message: 'Race and session ingestion job started. Check server logs.' };
  }

  @Post('seasons')
  async ingestSeasons() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Seasons ---');
    await this.ergastService.ingestSeasons();
    return { message: 'Seasons ingestion job started. Check server logs.' };
  }

  @Post('results')
  async ingestAllResults() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting All Results ---');
    await this.ergastService.ingestAllResults();
    return { message: 'All results ingestion job started. This will take a long time. Check server logs.' };
  }

}