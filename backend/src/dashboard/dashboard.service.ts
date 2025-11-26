// backend/src/dashboard/dashboard.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull, Not } from 'typeorm';
import { Race } from '../races/races.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Driver } from '../drivers/drivers.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { RaceFastestLapMaterialized } from './race-fastest-laps-materialized.entity';
import { DashboardResponseDto, HeadToHeadDriverDto, ConstructorStandingsItemDto } from './dto/dashboard.dto';
import { ConstructorStandingMaterialized } from './constructor-standings-materialized.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Race) private readonly raceRepository: Repository<Race>,
    @InjectRepository(RaceResult) private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(DriverStandingMaterialized) private readonly standingsViewRepository: Repository<DriverStandingMaterialized>,
    @InjectRepository(RaceFastestLapMaterialized) private readonly fastestLapViewRepository: Repository<RaceFastestLapMaterialized>,
    @InjectRepository(ConstructorStandingMaterialized) private readonly constructorStandingsViewRepo: Repository<ConstructorStandingMaterialized>,
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
    console.log('🔍 [getDashboardData] Starting dashboard data fetch');
    
    // Determine latest season year with standings data
    const latestYearResult = await this.standingsViewRepository
      .createQueryBuilder('ds')
      .select('MAX(ds.seasonYear)', 'latestYear')
      .getRawOne();
    const latestYear: number = latestYearResult?.latestYear || new Date().getFullYear();
    
    console.log('✅ [getDashboardData] Latest year:', latestYear);

    const [
      nextRace,
      lastRace,
      championshipStandings,
      constructorStandings,
    ] = await Promise.all([
      this.getNextRace(),
      this.getLastRace(),
      this.getChampionshipStandings(latestYear),
      this.getConstructorStandings(latestYear),
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
      this.getHeadToHead(latestYear),
    ]);

    return {
      standingsYear: latestYear,
      nextRace,
      championshipStandings,
      constructorStandings,
      lastRacePodium,
      lastRaceFastestLap,
      headToHead,
    };
  }

  private async getConstructorStandings(year: number): Promise<ConstructorStandingsItemDto[]> {
    const standings = await this.constructorStandingsViewRepo.find({
      where: { seasonYear: year },
      order: { position: 'ASC' },
      take: 5,
    });
    return standings.map(s => ({
      position: s.position,
      constructorName: s.constructorName,
      points: Number(s.seasonPoints),
    }));
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
      driverHeadshotUrl: s.profileImageUrl || null,
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
        driverProfileImageUrl: r.driver.profile_image_url || null,
      })),
    };
  }

  private async getLastRaceFastestLap(raceId: number) {
    const fastestLap = await this.fastestLapViewRepository.findOne({
      where: { raceId },
    });
     // If no fastest lap is found (because data is not ingested yet),
    if (!fastestLap) {
      return {
        driverFullName: 'Data Pending',
        lapTime: '--:--.---',
        driverProfileImageUrl: null,
      };
    }
    
    // Fetch driver profile image URL from drivers table
    const driver = await this.raceResultRepository.manager.findOne(Driver, {
      where: { id: fastestLap.driverId },
      select: ['profile_image_url'],
    });
    
    return {
      driverFullName: fastestLap.driverFullName,
      lapTime: this.formatLapTime(fastestLap.lapTimeMs),
      driverProfileImageUrl: driver?.profile_image_url || null,
    };
  }
  
  private async getHeadToHead(year: number) {
    const topTwo = await this.standingsViewRepository.find({
      where: { seasonYear: year },
      order: { seasonPoints: 'DESC' },
      take: 2,
    });
  
    // If we don't have enough data yet, return a placeholder object
    if (topTwo.length < 2) {
      const placeholderDriver: HeadToHeadDriverDto = {
        fullName: 'Data Pending',
        headshotUrl: '',
        teamName: 'N/A',
        wins: 0,
        podiums: 0,
        points: 0,
      };
      return {
        driver1: placeholderDriver,
        driver2: placeholderDriver,
      };
    }
  
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
