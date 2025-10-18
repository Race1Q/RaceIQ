import { Controller, Post, Logger, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ErgastService } from './ergast.service';
import { OpenF1Service } from './openf1.service';
import { ApiErrorDto } from '../common/dto/api-error.dto';

@Controller('ingestion')
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(
    private readonly ergastService: ErgastService,
    private readonly openf1Service: OpenF1Service,
  ) {}

  // ERGAST INGESTION

  @ApiExcludeEndpoint()
  @Get('test')
  getTest() {
    this.logger.log('--- Test endpoint was reached successfully! ---');
    return { status: 'ok', message: 'Ingestion controller is working!' };
  }

  @ApiExcludeEndpoint()
  @Post('circuits')
  async ingestCircuits() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Circuits ---');
    await this.ergastService.ingestCircuits();
    return { message: 'Circuit ingestion job started. Check server logs for progress.' };
  }

  @ApiExcludeEndpoint()
  @Post('constructors')
  async ingestConstructors() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Constructors ---');
    await this.ergastService.ingestConstructors();
    return { message: 'Constructor ingestion job started. Check server logs for progress.' };
  }

  @ApiExcludeEndpoint()
  @Post('drivers')
  async ingestDrivers() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Drivers ---');
    await this.ergastService.ingestDrivers();
    return { message: 'Driver ingestion job started. Check server logs for progress.' };
  }

  @ApiExcludeEndpoint()
  @Post('races-and-sessions')
  async ingestRacesAndSessions() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Races and Sessions ---');
    await this.ergastService.ingestRacesAndSessions();
    return { message: 'Race and session ingestion job started. Check server logs.' };
  }

  @ApiExcludeEndpoint()
  @Post('seasons')
  async ingestSeasons() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Seasons ---');
    await this.ergastService.ingestSeasons();
    return { message: 'Seasons ingestion job started. Check server logs.' };
  }

  @ApiExcludeEndpoint()
  @Post('results')
  async ingestAllResults() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting All Results ---');
    await this.ergastService.ingestAllResults();
    return { message: 'All results ingestion job started. This will take a long time. Check server logs.' };
  }

  @ApiExcludeEndpoint()
  @Post('standings')
  async ingestAllStandings() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting All Standings ---');
    await this.ergastService.ingestAllStandings();
    return { message: 'All standings ingestion job started. Check server logs.' };
  }

  // @Post('fix-race-times')
  // async fixRaceTimes() {
  //   this.logger.log('--- MANUAL TRIGGER: Fixing missing race times ---');
  //   await this.ergastService.fixMissingRaceTimes();
  //   return { message: 'Job to fix missing race times has started. Check logs.' };
  // }

  // OPEN F1 INGESTION

  @ApiExcludeEndpoint()
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year parameter is not a valid number).',
    type: ApiErrorDto,
  })
  @Post('openf1-sessions/:year')
  async ingestOpenF1Sessions(@Param('year') year: string) {
    this.logger.log(`--- MANUAL TRIGGER: Ingesting OpenF1 Sessions for ${year} ---`);
    await this.openf1Service.ingestSessionsAndWeather(parseInt(year, 10));
    return { message: `OpenF1 session ingestion for ${year} started. Check server logs.` };
  }

  @ApiExcludeEndpoint()
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year parameter is not a valid number).',
    type: ApiErrorDto,
  })
  @Post('openf1-granular/:year')
  async ingestOpenF1Granular(@Param('year') year: string) {
    this.logger.log(`--- MANUAL TRIGGER: Ingesting OpenF1 Granular Data for ${year} ---`);
    await this.openf1Service.ingestGranularData(parseInt(year, 10));
    return { message: `OpenF1 granular data ingestion for ${year} started. Check server logs.` };
  }

  @ApiExcludeEndpoint()
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year is not a number).',
    type: ApiErrorDto,
  })
  @Post('openf1/modern-results/:year')
  async ingestOpenF1ModernResults(@Param('year', ParseIntPipe) year: number) {
    this.logger.log(`--- MANUAL TRIGGER: Ingesting OpenF1 Modern Results, Laps, and Pit Stops for ${year} ---`);
    // CORRECT: Call the new function for results, laps, and pits
    this.openf1Service.ingestModernResultsAndLaps(year);
    return { message: `OpenF1 modern results, laps, and pit stops ingestion for ${year} started. Check server logs.` };
  }

  @ApiExcludeEndpoint()
  @Post('track-layouts')
  async ingestTrackLayouts() {
    this.logger.log('--- MANUAL TRIGGER: Ingesting Track Layouts ---');
    this.openf1Service.ingestTrackLayouts(); // Run without await
    return { message: 'Track layout ingestion started. This is a one-time script and will take a while. Check logs.' };
  }
}