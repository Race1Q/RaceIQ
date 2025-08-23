// src/races/races-ingest.services.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { CircuitsService } from '../circuits/circuits.service';
import { RacesService } from './races.service';
import { ApiRace, ApiResponse } from './races.entity';
import { firstValueFrom } from 'rxjs';
import { Circuit } from '../circuits/circuits.entity';
import { SeasonsService } from '../seasons/seasons.service';

@Injectable()
export class RaceIngestService {
  private readonly logger = new Logger(RaceIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly circuitsService: CircuitsService,
    private readonly seasonsService: SeasonsService,
  ) {}

  async fetchRacesFromAPI(season: string): Promise<ApiRace[]> {
    try {
      const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/races.json`;
      this.logger.log(`Fetching races from API for season ${season}`);
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      
      const races = response.data.MRData.RaceTable.Races;
      this.logger.log(`Number of races received: ${races.length}`);
      
      return races;
    } catch (error) {
      this.logger.error(`Failed to fetch races for season ${season}`, error.message);
      throw new Error('Failed to fetch races data');
    }
  }

  async ingestAllRaces(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    this.logger.log('Starting ingestion of all races...');
    
    const allCircuits = await this.circuitsService.getAllCircuits();
    const allSeasons = await this.seasonsService.getAllSeasons();

    if (allSeasons.length === 0) {
      this.logger.error('No seasons found in the database. Please ingest seasons first.');
      throw new Error('No seasons found. Ingestion aborted.');
    }

    if (allCircuits.length === 0) {
      this.logger.error('No circuits found in the database. Please ingest circuits first.');
      throw new Error('No circuits found. Ingestion aborted.');
    }

    for (const season of allSeasons) {
      this.logger.log(`Ingesting races for season: ${season.year}`);
      
      try {
        const apiRaces = await this.fetchRacesFromAPI(season.year.toString());
        
        for (const apiRace of apiRaces) {
          const result = await this.processRace(apiRace, allCircuits, season.id!);
          if (result === 'created') created++;
          if (result === 'updated') updated++;
        }
      } catch (error) {
        this.logger.error(`Failed to ingest races for season ${season.year}:`, error.message);
      }
    }

    this.logger.log(`Ingestion complete: ${created} created, ${updated} updated.`);
    return { created, updated };
  }

  private async processRace(apiRace: ApiRace, allCircuits: Circuit[], seasonId: number): Promise<'created' | 'updated'> {
    this.logger.log(`Processing race: ${apiRace.raceName}`);

    const circuit = allCircuits.find(c => c.name === apiRace.Circuit.circuitName);

    if (!circuit) {
      this.logger.error(`Circuit not found for race '${apiRace.raceName}'. Skipping ingestion.`);
      throw new Error('Circuit not found.');
    }

    const raceData = {
      season_id: seasonId,
      circuit_id: circuit.id, 
      round: parseInt(apiRace.round),
      name: apiRace.raceName,
      date: apiRace.date,
      time: apiRace.time,
    };
    
    // Check if the race exists first to correctly determine if it's a create or update
    const { data: existingRace, error: selectError } = await this.supabaseService.client
      .from('races')
      .select('id')
      .eq('season_id', raceData.season_id)
      .eq('round', raceData.round)
      .single();

    if (existingRace) {
      // It's an update
      const { error } = await this.supabaseService.client
        .from('races')
        .update(raceData)
        .eq('id', existingRace.id);

      if (error) {
        this.logger.error(`Failed to update race ${raceData.name}`, error.message);
        throw new Error(`Update failed: ${error.message}`);
      }
      return 'updated';
    } else {
      // It's a create
      const { error } = await this.supabaseService.client
        .from('races')
        .insert(raceData);

      if (error) {
        this.logger.error(`Failed to create race ${raceData.name}`, error.message);
        throw new Error(`Creation failed: ${error.message}`);
      }
      return 'created';
    }
  }
}
