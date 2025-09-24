import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RaceResult } from '../race-results/race-results.entity';
import { Lap } from '../laps/laps.entity';
import { RaceEvent } from '../race-events/race-events.entity';
import { Driver } from '../drivers/drivers.entity';

@Controller('race-summary')
export class RaceSummaryController {
  constructor(
    @InjectRepository(RaceResult)
    private readonly resultsRepo: Repository<RaceResult>,
    @InjectRepository(Lap)
    private readonly lapsRepo: Repository<Lap>,
    @InjectRepository(RaceEvent)
    private readonly eventsRepo: Repository<RaceEvent>,
    @InjectRepository(Driver)
    private readonly driversRepo: Repository<Driver>,
  ) {}

  @Get()
  async getSummary(@Query('race_id') raceId: number) {
    if (!raceId || isNaN(Number(raceId))) {
      throw new Error('Missing or invalid race_id');
    }
    // Podium
    const sessionIds = await this._getSessionIds(raceId);
    const podium = await this.resultsRepo.find({
      where: {
        position: In([1, 2, 3]),
        session_id: In(sessionIds),
      },
      relations: ['driver'],
      order: { position: 'ASC' },
    });
    // Fastest lap: use Supabase view
    const fastestLapRows = await this.lapsRepo.manager.query(
      'SELECT * FROM fastest_laps_by_race WHERE race_id = $1 LIMIT 1',
      [raceId]
    );
    let fastestLap: any = null;
    if (fastestLapRows.length) {
      const fl = fastestLapRows[0];
      const foundDriver = await this.driversRepo.findOne({ where: { id: fl.driver_id } });
      fastestLap = {
        driver_id: fl.driver_id,
        driver_name: foundDriver ? `${foundDriver.first_name} ${foundDriver.last_name}` : undefined,
        driver_picture: foundDriver?.profile_image_url,
        lap_number: fl.lap_number,
        time_ms: fl.total_time_ms,
      };
    }
  // Events: count red/yellow flags by type and metadata.colour
  const events = await this.eventsRepo.find({ where: { session_id: In(sessionIds) } });
  const flagEvents = events.filter(e => typeof e.type === 'string' && e.type.toLowerCase() === 'flag');
   const yellowFlags = flagEvents.filter(e => {
     const flag = e.metadata?.flag;
     return typeof flag === 'string' && flag.toLowerCase() === 'yellow';
   }).length;
   const redFlags = flagEvents.filter(e => {
     const flag = e.metadata?.flag;
     return typeof flag === 'string' && flag.toLowerCase() === 'red';
   }).length;
    return {
      podium: podium.map(r => ({
        driver_id: r.driver_id,
        driver_name: r.driver ? `${r.driver.first_name} ${r.driver.last_name}` : undefined,
        driver_picture: r.driver?.profile_image_url,
        position: r.position,
      })),
      fastestLap,
      events: { yellowFlags, redFlags },
    };
  }

  private async _getSessionIds(raceId: number): Promise<number[]> {
    const rows = await this.resultsRepo.manager.query('SELECT id FROM sessions WHERE race_id = $1', [raceId]);
    return rows.map((r: any) => r.id);
  }
}
