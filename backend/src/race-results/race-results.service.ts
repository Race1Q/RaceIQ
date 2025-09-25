// src/raceResults/raceResults.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RaceResult } from './race-results.entity';

@Injectable()
export class RaceResultsService {
  private readonly logger = new Logger(RaceResultsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

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
  
    // Fetch the sessions for these session_ids
    const sessionIds = raceResults.map((r) => r.session_id);
    const { data: sessions, error: sessionsError } = await this.supabaseService.client
      .from('sessions')
      .select('id, race_id')
      .in('id', sessionIds);
  
    if (sessionsError) throw new Error(sessionsError.message);
  
    const raceIds = sessions.map((s) => s.race_id);
  
    // Fetch races for those race_ids to get season_id
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
      if (!season) return;
  
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
  
  
  
  
}