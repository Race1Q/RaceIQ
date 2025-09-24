import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lap } from './laps.entity';

@Controller('laps')
export class LapsController {
  constructor(
    @InjectRepository(Lap)
    private readonly repo: Repository<Lap>,
  ) {}

  @Get()
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
