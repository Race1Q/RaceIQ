import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiOkResponse, ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lap } from './laps.entity';

@ApiTags('Laps')
@Controller('laps')
export class LapsController {
  constructor(
    @InjectRepository(Lap)
    private readonly repo: Repository<Lap>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get lap information for a specific race', description: 'Returns detailed lap-by-lap data for a specific race, including lap times, positions, and driver information.' })
  @ApiQuery({ name: 'race_id', required: true, type: Number, description: 'The ID of the race to get lap data for' })
  @ApiQuery({ name: 'raceId', required: false, type: Number, description: 'Alternative parameter name for race ID' })
  @ApiOkResponse({ type: [Lap], description: 'List of laps for the specified race' })
  @ApiBadRequestResponse({ description: 'Missing or invalid race_id parameter' })
  async findByRaceId(@Query('race_id') race_id?: number, @Query('raceId') raceId?: number) {
    try {
      const id = race_id ?? raceId;
      if (!id || isNaN(Number(id))) {
        throw new Error('Missing or invalid race_id');
      }
      const laps = await this.repo.find({ where: { race_id: Number(id) } });
      return laps;
    } catch (err) {
      console.error('[LapsController] Error fetching laps for race_id:', race_id ?? raceId, err);
      throw err;
    }
  }
}
