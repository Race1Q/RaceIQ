// backend/src/dashboard/dashboard.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull, Not } from 'typeorm';
import { Race } from '../races/races.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { RaceFastestLapMaterialized } from './race-fastest-laps-materialized.entity';
import { DashboardResponseDto, HeadToHeadDriverDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Race) private readonly raceRepository: Repository<Race>,
    @InjectRepository(RaceResult) private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(DriverStandingMaterialized) private readonly standingsViewRepository: Repository<DriverStandingMaterialized>,
    @InjectRepository(RaceFastestLapMaterialized) private readonly fastestLapViewRepository: Repository<RaceFastestLapMaterialized>,
  ) {}

  // Utility function to format lap time from milliseconds to M:SS.mmm
  private formatLapTime(ms: number): string {
    if (!ms || ms <= 0) return 'N/A';
    const date = new Date(ms);
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  }

  async getDashboardData(): Promise<DashboardResponseDto> {
    const currentYear = new Date().getFullYear();

    const [
      nextRace,
      lastRace,
      championshipStandings,
    ] = await Promise.all([
      this.getNextRace(),
      this.getLastRace(),
      this.getChampionshipStandings(currentYear),
    ]);

    if (!lastRace) {
      throw new NotFoundException('Could not determine the last completed race.');
    }

    const [
      lastRacePodium,
      lastRaceFastestLap,
      headToHead,
    ] = await Promise.all([
      this.getLastRacePodium(lastRace.id, lastRace.name),
      this.getLastRaceFastestLap(lastRace.id),
      this.getHeadToHead(currentYear),
    ]);

    return {
      nextRace,
      championshipStandings,
      lastRacePodium,
      lastRaceFastestLap,
      headToHead,
    };
  }

  private async getNextRace() {
    const race = await this.raceRepository.findOne({
      where: { date: MoreThan(new Date()) },
      order: { date: 'ASC' },
      relations: ['circuit'],
    });
    if (!race) throw new NotFoundException('Next race not found.');
    
    // Combine the date and time strings and then convert to a Date object
    const fullRaceDate = new Date(`${race.date}T${race.time || '00:00:00'}Z`);

    return {
      raceName: race.name,
      circuitName: race.circuit.name,
      raceDate: fullRaceDate.toISOString(), // Now this will work
    };
  }
  
  private async getLastRace() {
    return this.raceRepository.findOne({
      where: { date: LessThan(new Date()) },
      order: { date: 'DESC' },
    });
  }

  private async getChampionshipStandings(year: number) {
    const standings = await this.standingsViewRepository.find({
      where: { seasonYear: year },
      order: { seasonPoints: 'DESC' },
      take: 3,
    });
    return standings.map((s, index) => ({
      position: index + 1,
      driverFullName: s.driverFullName,
      constructorName: s.constructorName,
      points: Number(s.seasonPoints),
    }));
  }

  private async getLastRacePodium(raceId: number, raceName: string) {
    const results = await this.raceResultRepository.find({
      where: { 
        session: { race: { id: raceId } }, 
        position: LessThan(4) // Top 3 positions only (also excludes null)
      },
      order: { position: 'ASC' },
      relations: ['driver', 'team'],
      take: 3,
    });
    return {
      raceName,
      podium: results.map(r => ({
        position: r.position,
        driverFullName: `${r.driver.first_name} ${r.driver.last_name}`,
        constructorName: r.team.name,
      })),
    };
  }

  private async getLastRaceFastestLap(raceId: number) {
    const fastestLap = await this.fastestLapViewRepository.findOne({
      where: { raceId },
    });
    if (!fastestLap) throw new NotFoundException('Fastest lap not found for the last race.');
    return {
      driverFullName: fastestLap.driverFullName,
      lapTime: this.formatLapTime(fastestLap.lapTimeMs),
    };
  }
  
  private async getHeadToHead(year: number) {
    const topTwo = await this.standingsViewRepository.find({
      where: { seasonYear: year },
      order: { seasonPoints: 'DESC' },
      take: 2,
    });
    if (topTwo.length < 2) throw new NotFoundException('Not enough drivers for head-to-head.');

    const [driver1, driver2] = topTwo;

    const mapToDto = (driver: DriverStandingMaterialized): HeadToHeadDriverDto => ({
      fullName: driver.driverFullName,
      headshotUrl: driver.profileImageUrl || '',
      teamName: driver.constructorName,
      wins: driver.seasonWins,
      podiums: driver.seasonPodiums,
      points: Number(driver.seasonPoints),
    });

    return {
      driver1: mapToDto(driver1),
      driver2: mapToDto(driver2),
    };
  }
}
