// src/raceResults/raceResults.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RaceResult } from './race-results.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { Season } from '../seasons/seasons.entity';
import { Race } from '../races/races.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class RaceResultsService {
  private readonly logger = new Logger(RaceResultsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(DriverStandingMaterialized)
    private readonly driverStandingsRepo: Repository<DriverStandingMaterialized>,

    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,

    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,

    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,

    private readonly dataSource: DataSource,
  ) {}

  async getBySessionId(sessionId: number): Promise<RaceResult[]> {
    const { data, error } = await this.supabaseService.client
      .from('race_results')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      this.logger.error(`Failed to fetch race_results for session_id ${sessionId}`, error);
      throw new Error(`Failed to fetch race_results: ${error.message}`);
    }

    return data as RaceResult[];
  }

  async getByConstructor(constructorId: number): Promise<RaceResult[]> {
    const { data, error } = await this.supabaseService.client
      .from('race_results')
      .select('*')
      .eq('constructor_id', constructorId);

    if (error) {
      this.logger.error(`Failed to fetch race_results for constructor_id ${constructorId}`, error);
      throw new Error(`Failed to fetch race_results: ${error.message}`);
    }

    return data as RaceResult[];
  }

  async getConstructorStats(constructorId: number) {
    const results = await this.getByConstructor(constructorId);

    const totalRaces = results.length;
    const wins = results.filter(r => Number(r.position) === 1).length;
    const podiums = results.filter(r => Number(r.position) <= 3).length;
    const totalPoints = results.reduce((acc, r) => acc + Number(r.points), 0);

    return { totalRaces, wins, podiums, totalPoints };
  }

  async getPointsPerSeason(constructorId: number) {
    // Query the race_results table filtering by constructor_id
    const { data, error } = await this.supabaseService.client
      .from('race_results')
      .select('points, race_id')
      .eq('constructor_id', constructorId);
  
    if (error) throw new Error(error.message);
  
    // Fetch all races to get the season_id for each race
    const raceIds = data.map(r => r.race_id);
    const { data: races, error: racesError } = await this.supabaseService.client
      .from('races')
      .select('id, season_id')
      .in('id', raceIds);
  
    if (racesError) throw new Error(racesError.message);
  
    // Build a map from race_id to season
    const raceIdToSeason: Record<number, number> = {};
    races.forEach(r => { raceIdToSeason[r.id] = r.season_id; });
  
    // Aggregate points per season
    const pointsPerSeason: Record<number, number> = {};
    data.forEach(r => {
      const season = raceIdToSeason[r.race_id];
      if (!pointsPerSeason[season]) pointsPerSeason[season] = 0;
      pointsPerSeason[season] += r.points;
    });
  
    // Convert to array sorted by season
    return Object.entries(pointsPerSeason)
      .map(([season, points]) => ({ season: Number(season), points }))
      .sort((a, b) => a.season - b.season);
  }

  async getConstructorPointsPerSeason(constructorId: number) {
    // Fetch all race results for the constructor
    const { data: raceResults, error } = await this.supabaseService.client
      .from('race_results')
      .select('points, position, session_id')
      .eq('constructor_id', constructorId);
  
    if (error) throw new Error(error.message);
    if (!raceResults?.length) return [];
  
    // Fetch sessions for these session_ids
    const sessionIds = raceResults.map((r) => r.session_id);
    const { data: sessions, error: sessionsError } = await this.supabaseService.client
      .from('sessions')
      .select('id, race_id')
      .in('id', sessionIds);
  
    if (sessionsError) throw new Error(sessionsError.message);
  
    const raceIds = sessions.map((s) => s.race_id);
  
    // Fetch races to get season_id
    const { data: races, error: racesError } = await this.supabaseService.client
      .from('races')
      .select('id, season_id')
      .in('id', raceIds);
  
    if (racesError) throw new Error(racesError.message);
  
    // Map session_id → season_id
    const sessionToSeason: Record<number, number> = {};
    sessions.forEach((s) => {
      const race = races.find((r) => r.id === s.race_id);
      if (race) sessionToSeason[s.id] = race.season_id;
    });
  
    // Aggregate points per season
    const seasonMap: Record<number, any> = {};
    raceResults.forEach((r) => {
      const season = sessionToSeason[r.session_id];
      if (season === undefined) return;
  
      if (!seasonMap[season]) {
        seasonMap[season] = {
          season,
          points: 0,
          wins: 0,
          podiums: 0,
          totalRaces: 0,
        };
      }
  
      seasonMap[season].points += Number(r.points || 0);
      seasonMap[season].wins += r.position === 1 ? 1 : 0;
      seasonMap[season].podiums += r.position && r.position <= 3 ? 1 : 0;
      seasonMap[season].totalRaces += 1;
    });
  
    // --- Fill missing seasons ---
    const seasons = races.map((r) => r.season_id);
    const minSeason = Math.min(...seasons);
    const maxSeason = Math.max(...seasons);
  
    for (let s = minSeason; s <= maxSeason; s++) {
      if (!seasonMap[s]) {
        seasonMap[s] = {
          season: s,
          points: 0,
          wins: 0,
          podiums: 0,
          totalRaces: 0,
        };
      }
    }
  
    // Convert map to array sorted by season
    return Object.values(seasonMap).sort((a, b) => a.season - b.season);
  }
  
  

  async getConstructorPointsProgression(constructorId: number, seasonId: number) {
    // Fetch all race results for the constructor
    const { data: raceResults, error } = await this.supabaseService.client
      .from('race_results')
      .select('points, session_id')
      .eq('constructor_id', constructorId);
  
    if (error) throw new Error(error.message);
    if (!raceResults?.length) return [];
  
    // Fetch sessions for these results
    const sessionIds = raceResults.map(r => r.session_id);
    const { data: sessions, error: sessionsError } = await this.supabaseService.client
      .from('sessions')
      .select('id, race_id')
      .in('id', sessionIds);
  
    if (sessionsError) throw new Error(sessionsError.message);
  
    // Fetch races for those sessions (with season_id filter)
    const raceIds = sessions.map(s => s.race_id);
    const { data: races, error: racesError } = await this.supabaseService.client
      .from('races')
      .select('id, season_id, round, name')
      .in('id', raceIds)
      .eq('season_id', seasonId);
  
    if (racesError) throw new Error(racesError.message);
  
    // Map session → race
    const sessionToRace: Record<number, { round: number; name: string }> = {};
    sessions.forEach(s => {
      const race = races.find(r => r.id === s.race_id);
      if (race) {
        sessionToRace[s.id] = { round: race.round, name: race.name };
      }
    });
  
    // Aggregate points per race
    const racePoints: { round: number; raceName: string; points: number }[] = [];
    raceResults.forEach(r => {
      const raceInfo = sessionToRace[r.session_id];
      if (!raceInfo) return;
      let entry = racePoints.find(e => e.round === raceInfo.round);
      if (!entry) {
        entry = { round: raceInfo.round, raceName: raceInfo.name, points: 0 };
        racePoints.push(entry);
      }
      entry.points += Number(r.points || 0);
    });
  
    // Sort races by round and compute cumulative points
    racePoints.sort((a, b) => a.round - b.round);
    let cumulative = 0;
    const progression = racePoints.map(r => {
      cumulative += r.points;
      return {
        round: r.round,
        raceName: r.raceName,
        racePoints: r.points,
        cumulativePoints: cumulative,
      };
    });
  
    return progression;
  }


  async debugConstructorRaces(constructorId: number, seasonId: number) {
    // Get all races for the given season
    const { data: races, error: racesError } = await this.supabaseService.client
      .from('races')
      .select('id, name, season_id')
      .eq('season_id', seasonId);
  
    if (racesError) throw new Error(racesError.message);
  
    // Get sessions for those races
    const raceIds = races.map(r => r.id);
    const { data: sessions, error: sessionsError } = await this.supabaseService.client
      .from('sessions')
      .select('id, race_id')
      .in('race_id', raceIds);
  
    if (sessionsError) throw new Error(sessionsError.message);
  
    // Get race results for those sessions + constructor
    const sessionIds = sessions.map(s => s.id);
    const { data: results, error: resultsError } = await this.supabaseService.client
      .from('race_results')
      .select('id, session_id, constructor_id, position, points')
      .in('session_id', sessionIds)
      .eq('constructor_id', constructorId);
  
    if (resultsError) throw new Error(resultsError.message);
  
    // Merge for readability
    const detailedResults = results.map(r => {
      const session = sessions.find(s => s.id === r.session_id);
      const race = races.find(rc => rc.id === session?.race_id);
      return {
        season: race?.season_id,
        race: race?.name,
        position: r.position,
        points: r.points,
      };
    });
  
    this.logger.debug(`Constructor ${constructorId} in season ${seasonId}:`);
    this.logger.debug(detailedResults);
  
    return detailedResults;
  }
  
  async getAllConstructorsProgression(seasonId: number) {
    // First, get all races for this season
    const { data: races, error: racesError } = await this.supabaseService.client
      .from('races')
      .select('id')
      .eq('season_id', seasonId);
  
    if (racesError) throw new Error(racesError.message);
    if (!races?.length) return [];
  
    const raceIds = races.map(r => r.id);
  
    // Get sessions for these races
    const { data: sessions, error: sessionsError } = await this.supabaseService.client
      .from('sessions')
      .select('id')
      .in('race_id', raceIds);
  
    if (sessionsError) throw new Error(sessionsError.message);
    if (!sessions?.length) return [];
  
    const sessionIds = sessions.map(s => s.id);
  
    // Get unique constructor IDs that actually competed in this season
    const { data: raceResults, error: resultsError } = await this.supabaseService.client
      .from('race_results')
      .select('constructor_id')
      .in('session_id', sessionIds);
  
    if (resultsError) throw new Error(resultsError.message);
    if (!raceResults?.length) return [];
  
    // Get unique constructor IDs
    const uniqueConstructorIds = [...new Set(raceResults.map(r => r.constructor_id))];
  
    // Fetch constructor details for these IDs
    const { data: constructors, error: constructorsError } = await this.supabaseService.client
      .from('constructors')
      .select('id, name')
      .in('id', uniqueConstructorIds);
  
    if (constructorsError) throw new Error(constructorsError.message);
    if (!constructors?.length) return [];
  
    const results: { constructorId: number; constructorName: string; progression: { round: number; raceName: string; racePoints: number; cumulativePoints: number }[] }[] = [];
  
    for (const constructor of constructors) {
      const progression = await this.getConstructorPointsProgression(constructor.id, seasonId);
      results.push({
        constructorId: constructor.id,
        constructorName: constructor.name,
        progression,
      });
    }
    //console.log(results[0]);
    return results;
  }

async getDriversPointsProgression(seasonId: number) {
  // Fetch all active drivers
  const { data: drivers, error: driversError } = await this.supabaseService.client
    .from('drivers')
    .select('id, first_name, last_name')

  if (driversError) throw new Error(driversError.message);

  // Fetch all race_results for these drivers in the season
  const driverIds = drivers.map(d => d.id);

  const { data: raceResults, error: resultsError } = await this.supabaseService.client
    .from('race_results')
    .select('driver_id, points, session_id')
    .in('driver_id', driverIds);

  if (resultsError) throw new Error(resultsError.message);
  if (!raceResults?.length) return [];

  // Fetch sessions for season
  const sessionIds = raceResults.map(r => r.session_id);
  const { data: sessions, error: sessionsError } = await this.supabaseService.client
    .from('sessions')
    .select('id, race_id')
    .in('id', sessionIds);

  if (sessionsError) throw new Error(sessionsError.message);

  // Fetch races in season
  const raceIds = sessions.map(s => s.race_id);
  const { data: races, error: racesError } = await this.supabaseService.client
    .from('races')
    .select('id, season_id, round, name')
    .in('id', raceIds)
    .eq('season_id', seasonId);

  if (racesError) throw new Error(racesError.message);

  // Map session -> race
  const sessionToRace: Record<number, { round: number; name: string }> = {};
  sessions.forEach(s => {
    const race = races.find(r => r.id === s.race_id);
    if (race) sessionToRace[s.id] = { round: race.round, name: race.name };
  });

  // Aggregate points per driver per race
  const driverProgression: Array<{
    driverId: number;
    driverName: string;
    progression: { round: number; raceName: string; racePoints: number; cumulativePoints: number }[];
  }> = [];

  drivers.forEach(d => {
    const driverResults = raceResults.filter(r => r.driver_id === d.id);
    const progression: { round: number; raceName: string; racePoints: number; cumulativePoints: number }[] = [];

    driverResults.forEach(r => {
      const raceInfo = sessionToRace[r.session_id];
      if (!raceInfo) return;
      let entry = progression.find(e => e.round === raceInfo.round);
      if (!entry) {
        entry = { round: raceInfo.round, raceName: raceInfo.name, racePoints: 0, cumulativePoints: 0 };
        progression.push(entry);
      }
      entry.racePoints += Number(r.points || 0);
    });

    // Compute cumulative points
    progression.sort((a, b) => a.round - b.round);
    let cumulative = 0;
    progression.forEach(p => {
      cumulative += p.racePoints;
      p.cumulativePoints = cumulative;
    });

    driverProgression.push({
      driverId: d.id,
      driverName: `${d.first_name} ${d.last_name}`,
      progression,
    });
  });

  console.log(driverProgression[0]);
  return driverProgression;
}

async getDriversProgression(seasonId: number) {
  // 1. Look up the season year for the given seasonId
  const season = await this.seasonRepository.findOne({
    where: { id: seasonId },
    select: ['year'],
  });

  if (!season) {
    throw new Error(`Season with ID ${seasonId} not found`);
  }

  const seasonYear = season.year;

  // 2. Find all active drivers in that season
  const activeDrivers = await this.driverStandingsRepo.find({
    where: { seasonYear },
    select: ['driverId', 'driverFullName'],
  });

  const driverIds = activeDrivers.map((d) => d.driverId);

  if (driverIds.length === 0) {
    return [];
  }

  // 3. Use Supabase approach but filter by season properly
  const { data: raceResults, error: resultsError } = await this.supabaseService.client
    .from('race_results')
    .select('driver_id, points, session_id')
    .in('driver_id', driverIds);

  if (resultsError) throw new Error(resultsError.message);
  if (!raceResults?.length) return [];

  // 4. Fetch sessions for these race results
  const sessionIds = raceResults.map(r => r.session_id);
  const { data: sessions, error: sessionsError } = await this.supabaseService.client
    .from('sessions')
    .select('id, race_id')
    .in('id', sessionIds);

  if (sessionsError) throw new Error(sessionsError.message);

  // 5. Fetch races in the specific season
  const raceIds = sessions.map(s => s.race_id);
  const { data: races, error: racesError } = await this.supabaseService.client
    .from('races')
    .select('id, season_id, round, name')
    .in('id', raceIds)
    .eq('season_id', seasonId);

  if (racesError) throw new Error(racesError.message);

  // 6. Map session -> race
  const sessionToRace: Record<number, { round: number; name: string }> = {};
  sessions.forEach(s => {
    const race = races.find(r => r.id === s.race_id);
    if (race) sessionToRace[s.id] = { round: race.round, name: race.name };
  });

  // 7. Aggregate points per driver per race
  const driverProgression: Array<{
    driverId: number;
    driverName: string;
    progression: { round: number; raceName: string; racePoints: number; cumulativePoints: number }[];
  }> = [];

  activeDrivers.forEach(d => {
    const driverResults = raceResults.filter(r => r.driver_id === d.driverId);
    const progression: { round: number; raceName: string; racePoints: number; cumulativePoints: number }[] = [];

    driverResults.forEach(r => {
      const raceInfo = sessionToRace[r.session_id];
      if (!raceInfo) return;
      let entry = progression.find(e => e.round === raceInfo.round);
      if (!entry) {
        entry = { round: raceInfo.round, raceName: raceInfo.name, racePoints: 0, cumulativePoints: 0 };
        progression.push(entry);
      }
      entry.racePoints += Number(r.points || 0);
    });

    // Compute cumulative points
    progression.sort((a, b) => a.round - b.round);
    let cumulative = 0;
    progression.forEach(p => {
      cumulative += p.racePoints;
      p.cumulativePoints = cumulative;
    });

    driverProgression.push({
      driverId: d.driverId,
      driverName: d.driverFullName,
      progression,
    });
  });

  return driverProgression;
}

async getDriversPointsProgression3(seasonId?: number) {
  let seasonData;
  
  if (seasonId) {
    // Use the provided season ID
    const { data: season, error: seasonError } = await this.supabaseService.client
      .from('seasons')
      .select('id, year')
      .eq('id', seasonId)
      .single();

    if (seasonError || !season) throw new Error(seasonError?.message || `Season with ID ${seasonId} not found`);
    seasonData = season;
  } else {
    // Get the latest season
    const { data: latestSeasonData, error: seasonError } = await this.supabaseService.client
      .from('seasons')
      .select('id, year')
      .order('year', { ascending: false })
      .limit(1)
      .single();

    if (seasonError || !latestSeasonData) throw new Error(seasonError?.message || 'Latest season not found');
    seasonData = latestSeasonData;
  }

  const seasonIdToUse = seasonData.id;
  const seasonYear = seasonData.year;
  //console.log('Using season:', seasonData);

  // Step 2: Get all drivers with standings in the specified season
  const { data: drivers, error: driversError } = await this.supabaseService.client
    .from('driver_standings_materialized')
    .select('driverId, driverFullName, constructorName')
    .eq('seasonYear', seasonYear);

  if (driversError || !drivers?.length) return [];

  const driverIds = drivers.map(d => d.driverId);
  //console.log('Drivers in season:', drivers);

// Step 3: Fetch race results for these drivers in the specified season ONLY
const { data: raceResults, error: resultsError } = await this.supabaseService.client
  .from('race_results')
  .select('driver_id, points, session_id, sessions!inner(race_id, races!inner(season_id))')
  .in('driver_id', driverIds)
  .eq('sessions.races.season_id', seasonIdToUse); // Filter by season

if (resultsError || !raceResults?.length) return [];
//console.log('Race results fetched for drivers:', raceResults);
  


  // Step 4: Fetch sessions
  const sessionIds = raceResults.map(r => r.session_id);
  const { data: sessions, error: sessionsError } = await this.supabaseService.client
    .from('sessions')
    .select('id, race_id')
    .in('id', sessionIds);

  if (sessionsError) throw new Error(sessionsError.message);
  //console.log('Sessions fetched for season:', sessions);
  //console.log('Race IDs from sessions:', raceIds);

  // Step 5: Debug and fetch races
const raceIds = sessions.map(s => s.race_id);
//console.log('Race IDs to check:', raceIds.slice(0, 10));
//console.log('Latest season ID we\'re looking for:', latestSeasonId);

// Debug query - check what season_id values actually exist
const { data: debugRaces, error: debugError } = await this.supabaseService.client
  .from('races')
  .select('id, season_id, name')
  .in('id', raceIds);


// Now fetch all races (temporarily remove season filter)
const { data: races, error: racesError } = await this.supabaseService.client
  .from('races')
  .select('id, round, name, season_id')
  .in('id', raceIds);
  // .eq('season_id', latestSeasonId); // Commented out for debugging

if (racesError) throw new Error(racesError.message);
//console.log('Races fetched (no season filter):', races);


  // Step 6: Map session -> race
  const sessionToRace: Record<number, { round: number; name: string }> = {};
  sessions.forEach(s => {
    const race = races.find(r => r.id === s.race_id);
    if (race) sessionToRace[s.id] = { round: race.round, name: race.name };
  });

  //console.log('Session to race mapping:', sessionToRace);


  // Step 7: Aggregate points per driver
  const driverProgression: Array<{
    driverId: number;
    driverName: string;
    driverTeam: string;
    progression: { round: number; raceName: string; racePoints: number; cumulativePoints: number }[];
  }> = [];

  drivers.forEach(d => {
    const driverResults = raceResults.filter(r => r.driver_id === d.driverId);
    const progression: { round: number; raceName: string; racePoints: number; cumulativePoints: number }[] = [];

    driverResults.forEach(r => {
      const raceInfo = sessionToRace[r.session_id];
      if (!raceInfo) return;

      let entry = progression.find(e => e.round === raceInfo.round);
      if (!entry) {
        entry = { round: raceInfo.round, raceName: raceInfo.name, racePoints: 0, cumulativePoints: 0 };
        progression.push(entry);
      }
      entry.racePoints += Number(r.points || 0);
    });

    // Compute cumulative points
    progression.sort((a, b) => a.round - b.round);
    let cumulative = 0;
    progression.forEach(p => {
      cumulative += p.racePoints;
      p.cumulativePoints = cumulative;
    });

    driverProgression.push({
      driverId: d.driverId,
      driverName: d.driverFullName,
      driverTeam: d.constructorName,
      progression,
    });
  });

  return driverProgression;
}


}