import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Season } from '../seasons/seasons.entity';
import { Race } from '../races/races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';
import { DriverStandingDto, ConstructorStanding, StandingsResponseDto } from './dto/standings-response.dto';
import { DriverStandingMaterialized } from './driver-standings-materialized.entity';
import { FeaturedDriverDto } from './dto/featured-driver.dto';
import { DriversService } from '../drivers/drivers.service';
import { DriverCareerStatsMaterialized } from '../drivers/driver-career-stats-materialized.entity';

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(DriverStandingMaterialized)
    private readonly standingsViewRepository: Repository<DriverStandingMaterialized>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(ConstructorEntity)
    private readonly constructorRepository: Repository<ConstructorEntity>,
    @InjectRepository(DriverCareerStatsMaterialized)
    private readonly careerStatsViewRepo: Repository<DriverCareerStatsMaterialized>,
    private readonly driversService: DriversService,
  ) {}

  async getStandingsByYearAndRound(
    year: number,
    round: number,
  ): Promise<StandingsResponseDto> {
    // Query materialized view for this season
    const fromView = await this.standingsViewRepository.find({
      where: { seasonYear: year },
      order: { seasonPoints: 'DESC' as const },
    });

    const driverStandings: DriverStandingDto[] = fromView.map((row, index) => ({
      position: index + 1,
      points: Number(row.seasonPoints),
      wins: row.seasonWins,
      constructorName: row.constructorName,
      driverId: row.driverId,
      driverFullName: row.driverFullName,
      driverNumber: row.driverNumber ?? null,
      driverCountryCode: row.countryCode ?? null,
      driverProfileImageUrl: row.profileImageUrl ?? null,
    }));

    return {
      driverStandings,
      constructorStandings: [],
    };
  }

  async getFeaturedDriver(): Promise<FeaturedDriverDto> {
    const latestYearResult = await this.standingsViewRepository
      .createQueryBuilder('ds')
      .select('MAX(ds.seasonYear)', 'latestYear')
      .getRawOne<{ latestYear: number }>();

    if (!latestYearResult?.latestYear) {
      throw new NotFoundException('No standings data available to determine featured driver.');
    }

    const latestYear = latestYearResult.latestYear;

    // Get all drivers from the latest season
    const allDrivers = await this.standingsViewRepository.find({
      where: { seasonYear: latestYear },
      order: { seasonPoints: 'DESC' as const },
    });

    if (!allDrivers || allDrivers.length === 0) {
      throw new NotFoundException('Could not find any drivers for the latest season.');
    }

    // Calculate recent form for each driver and find the best
    let bestDriver: any = null;
    let bestFormScore = Infinity; // Start with highest possible average (worst form)
    let bestDriverRanking = Infinity;

    console.log(`\n=== FEATURED DRIVER CALCULATION DEBUG ===`);
    console.log(`Total drivers found: ${allDrivers.length}`);
    
    for (const driver of allDrivers) {
      try {
        const recentForm = await this.driversService.getDriverRecentForm(driver.driverId);
        
        // Calculate form score: lower average position = better form
        // Only consider last 5 races
        const last5Races = recentForm.slice(0, 5);
        if (last5Races.length === 0) {
          console.log(`${driver.driverFullName}: No recent form data`);
          continue;
        }
        
        const averagePosition = last5Races.reduce((sum, race) => sum + race.position, 0) / last5Races.length;
        const driverRanking = allDrivers.findIndex(d => d.driverId === driver.driverId) + 1;
        
        console.log(`${driver.driverFullName}: Last 5 races = [${last5Races.map(r => `P${r.position}`).join(', ')}] → Avg: ${averagePosition.toFixed(2)}, Ranking: ${driverRanking}`);
        
        if (averagePosition < bestFormScore || (averagePosition === bestFormScore && driverRanking < bestDriverRanking)) {
          bestFormScore = averagePosition;
          bestDriver = driver;
          bestDriverRanking = driverRanking;
          console.log(`  → NEW BEST: ${driver.driverFullName} (avg: ${averagePosition.toFixed(2)})`);
        }
      } catch (error) {
        // Skip drivers with no recent form data
        console.warn(`Could not get recent form for driver ${driver.driverId}:`, error);
        continue;
      }
    }
    
    console.log(`\n=== FINAL RESULT ===`);
    console.log(`Best driver: ${bestDriver?.driverFullName}`);
    console.log(`Best average position: ${bestFormScore.toFixed(2)}`);
    console.log(`Driver ranking: ${bestDriverRanking}`);
    console.log(`==========================================\n`);

    if (!bestDriver) {
      throw new NotFoundException('Could not find a driver with recent form data.');
    }

    const [careerStats, recentForm] = await Promise.all([
      this.careerStatsViewRepo.findOne({ where: { driverId: bestDriver.driverId } }),
      this.driversService.getDriverRecentForm(bestDriver.driverId),
    ]);

    return {
      id: bestDriver.driverId,
      fullName: bestDriver.driverFullName,
      driverNumber: bestDriver.driverNumber ?? null,
      countryCode: bestDriver.countryCode ?? null,
      teamName: bestDriver.constructorName,
      seasonPoints: Number(bestDriver.seasonPoints),
      seasonWins: bestDriver.seasonWins,
      position: bestDriverRanking,
      careerStats: {
        wins: (careerStats as any)?.totalWins ?? 0,
        podiums: (careerStats as any)?.totalPodiums ?? 0,
        poles: 0,
      },
      recentForm,
    };
  }

  async getFeaturedDriverDebug(): Promise<any> {
    const latestYearResult = await this.standingsViewRepository
      .createQueryBuilder('ds')
      .select('MAX(ds.seasonYear)', 'latestYear')
      .getRawOne<{ latestYear: number }>();

    if (!latestYearResult?.latestYear) {
      throw new NotFoundException('No standings data available to determine featured driver.');
    }

    const latestYear = latestYearResult.latestYear;

    // Get all drivers from the latest season
    const allDrivers = await this.standingsViewRepository.find({
      where: { seasonYear: latestYear },
      order: { seasonPoints: 'DESC' as const },
    });

    if (!allDrivers || allDrivers.length === 0) {
      throw new NotFoundException('Could not find any drivers for the latest season.');
    }

    const driverFormData: any[] = [];

    for (const driver of allDrivers) {
      try {
        const recentForm = await this.driversService.getDriverRecentForm(driver.driverId);
        const last5Races = recentForm.slice(0, 5);
        
        if (last5Races.length > 0) {
          const averagePosition = last5Races.reduce((sum, race) => sum + race.position, 0) / last5Races.length;
          const driverRanking = allDrivers.findIndex(d => d.driverId === driver.driverId) + 1;
          
          driverFormData.push({
            driverName: driver.driverFullName,
            driverId: driver.driverId,
            championshipRanking: driverRanking,
            seasonPoints: driver.seasonPoints,
            last5Races: last5Races.map(r => `P${r.position}`),
            averagePosition: parseFloat(averagePosition.toFixed(2)),
            recentForm: last5Races
          });
        }
      } catch (error) {
        console.warn(`Could not get recent form for driver ${driver.driverId}:`, error);
        continue;
      }
    }

    // Sort by average position (best form first)
    driverFormData.sort((a, b) => a.averagePosition - b.averagePosition);

    return {
      season: latestYear,
      totalDrivers: allDrivers.length,
      driversWithFormData: driverFormData.length,
      driverFormRankings: driverFormData,
      bestDriver: driverFormData[0] || null
    };
  }

  // Helper to dynamically add position numbers
  private addPositions(standings: any[]): any[] {
    return standings
      .sort((a, b) => b.points - a.points)
      .map((standing, index) => ({
        ...standing,
        position: index + 1,
      }));
  }

  // Removed complex joins in favor of materialized view lookup

  // ✅ New method: get standings by year (latest round)
  async getStandingsByYear(year: number): Promise<StandingsResponseDto> {
    const season = await this.seasonRepository.findOne({ where: { year } });
    if (!season) throw new NotFoundException(`Season ${year} not found`);

    // Get the latest round
    const latestRace = await this.raceRepository.findOne({
      where: { season: { id: season.id } },
      order: { round: 'DESC' },
    });

    if (!latestRace) return { driverStandings: [], constructorStandings: [] };

    // Reuse existing method
    return this.getStandingsByYearAndRound(year, latestRace.round);
  }

  // This function is now simpler: it just takes a list of session IDs
  private async calculateConstructorStandings(
    sessionIds: number[],
  ): Promise<Partial<ConstructorStanding>[]> {
    const standings = await this.raceResultRepository
      .createQueryBuilder('rr')
      .select('rr.constructor_id', 'teamId')
      .addSelect('SUM(rr.points)', 'points')
      .addSelect(
        'SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END)::int',
        'wins',
      )
      .where('rr.session_id IN (:...sessionIds)', { sessionIds })
      .groupBy('rr.constructor_id')
      .orderBy('points', 'DESC')
      .getRawMany();

    const constructors = await this.raceResultRepository.manager.find(
      ConstructorEntity,
      {
        where: { id: In(standings.map((s) => s.teamId)) },
      },
    );
    const constructorMap = new Map(constructors.map((c) => [c.id, c]));

    return standings.map((s) => ({
      team: constructorMap.get(s.teamId),
      points: parseFloat(s.points) || 0,
      wins: s.wins || 0,
    }));
  }
}


