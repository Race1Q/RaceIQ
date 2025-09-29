// backend/src/races/race-summary.controller.ts

import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RaceResult } from '../race-results/race-results.entity';
import { Lap } from '../laps/laps.entity';
import { RaceEvent } from '../race-events/race-events.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';
import { Race } from './races.entity';

@Controller('race-summary')
export class RaceSummaryController {
  constructor(
    @InjectRepository(RaceResult)
    private readonly resultsRepo: Repository<RaceResult>,
    @InjectRepository(Lap)
    private readonly lapsRepo: Repository<Lap>,
    @InjectRepository(RaceEvent)
    private readonly eventsRepo: Repository<RaceEvent>,
    @InjectRepository(RaceFastestLapMaterialized)
    private readonly fastestLapViewRepo: Repository<RaceFastestLapMaterialized>,
    @InjectRepository(Race)
    private readonly raceRepo: Repository<Race>,
  ) {}

  @Get()
  async getSummary(@Query('race_id') raceId: number) {
    if (!raceId || isNaN(Number(raceId))) {
      throw new NotFoundException('Missing or invalid race_id');
    }

    // First, find the race to get the session IDs
    const race = await this.raceRepo.findOne({ where: { id: raceId }, relations: ['sessions'] });
    if (!race) throw new NotFoundException('Race not found');
    const sessionIds = race.sessions.map(s => s.id);

    // Fetch podium, fastest lap, and events in parallel
    const [podiumResults, fastestLapResult, events] = await Promise.all([
      this.resultsRepo.find({
        where: {
          position: In([1, 2, 3]),
          session: { id: In(sessionIds) },
        },
        // FIX: Eagerly load the 'team' (constructor) relation as well
        relations: ['driver', 'team'],
        order: { position: 'ASC' },
      }),
      // OPTIMIZATION: Use the new materialized view for a single, fast query
      this.fastestLapViewRepo.findOne({ where: { raceId } }),
      this.eventsRepo.find({ where: { session: { id: In(sessionIds) } } }),
    ]);

    // Process flags (this logic is fine)
    const flagEvents = events.filter(e => e.type === 'FLAG');
    const yellowFlags = flagEvents.filter(e => e.metadata?.flag?.toLowerCase() === 'yellow').length;
    const redFlags = flagEvents.filter(e => e.metadata?.flag?.toLowerCase() === 'red').length;

    return {
      podium: podiumResults.map(r => ({
        position: r.position,
        driver_id: r.driver_id,
        driver_name: r.driver ? `${r.driver.first_name} ${r.driver.last_name}` : 'N/A',
        driver_picture: r.driver?.profile_image_url,
        // FIX: Add the team name to the response
        team_name: r.team?.name || 'N/A',
      })),
      fastestLap: fastestLapResult ? {
        driver_id: fastestLapResult.driverId,
        driver_name: fastestLapResult.driverFullName,
        time_ms: fastestLapResult.lapTimeMs,
        // driver_picture and lap_number are not in this view, can be added if needed
      } : null,
      events: { yellowFlags, redFlags },
    };
  }
}
