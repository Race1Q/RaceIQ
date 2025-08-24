// src/races/races-ingest.services.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { CircuitsService } from '../circuits/circuits.service';
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
      const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/races/?format=json`;
      this.logger.log(`Fetching races from API for season ${season}`);
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      
      const races = response.data.MRData.RaceTable.Races;
      this.logger.log(`Number of races received for season ${season}: ${races?.length || 0}`);
      
      return races || [];
    } catch (error) {
      this.logger.error(`Failed to fetch races for season ${season}`, error.message);
      throw new Error('Failed to fetch races data');
    }
  }

  async ingest2025Races(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    this.logger.log('Starting ingestion of 2025 races...');
    
    const allCircuits = await this.circuitsService.getAllCircuits();

    if (allCircuits.length === 0) {
      this.logger.error('No circuits found in the database. Please ingest circuits first.');
      throw new Error('No circuits found. Ingestion aborted.');
    }

    try {
      const apiRaces = await this.fetchRacesFromAPI('2025');
      
      if (!apiRaces || apiRaces.length === 0) {
        this.logger.error('No races found in API response for 2025 season');
        return { created, updated };
      }

      for (const apiRace of apiRaces) {
        try {
          const result = await this.processRace(apiRace, allCircuits, 2025);
          if (result === 'created') created++;
          if (result === 'updated') updated++;
        } catch (error) {
          this.logger.error(`Failed to process race ${apiRace.raceName}:`, error.message);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to ingest races for season 2025:`, error.message);
    }

    this.logger.log(`2025 races ingestion complete: ${created} created, ${updated} updated.`);
    return { created, updated };
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
        
        if (!apiRaces || apiRaces.length === 0) {
          this.logger.log(`No races found for season ${season.year}`);
          continue;
        }

        for (const apiRace of apiRaces) {
          try {
            const result = await this.processRace(apiRace, allCircuits, season.id!);
            if (result === 'created') created++;
            if (result === 'updated') updated++;
          } catch (error) {
            this.logger.error(`Failed to process race ${apiRace.raceName}:`, error.message);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to ingest races for season ${season.year}:`, error.message);
      }
    }

    this.logger.log(`All races ingestion complete: ${created} created, ${updated} updated.`);
    return { created, updated };
  }

  private async processRace(apiRace: ApiRace, allCircuits: Circuit[], seasonId: number): Promise<'created' | 'updated'> {
    this.logger.log(`Processing race: ${apiRace.raceName} (Round ${apiRace.round})`);

    // Use circuitId from API to find the circuit (more reliable than name matching)
    const circuit = allCircuits.find(c => {
      // Try to match by circuit ID or name
      const circuitIdMatch = c.name.toLowerCase().includes(apiRace.Circuit.circuitId.toLowerCase());
      const nameMatch = c.name.toLowerCase() === apiRace.Circuit.circuitName.toLowerCase();
      return circuitIdMatch || nameMatch;
    });

    if (!circuit) {
      this.logger.error(`Circuit not found for race '${apiRace.raceName}'. Circuit ID: ${apiRace.Circuit.circuitId}, Circuit Name: ${apiRace.Circuit.circuitName}`);
      throw new Error('Circuit not found.');
    }

    const raceData = {
      season_id: seasonId,
      circuit_id: circuit.id, 
      round: parseInt(apiRace.round),
      name: apiRace.raceName,
      date: apiRace.date,
      time: apiRace.time || '00:00:00Z', // Default time if not provided
    };

    this.logger.debug(`Race data: ${JSON.stringify(raceData)}`);
    
    // Check if the race exists first to correctly determine if it's a create or update
    const { data: existingRace, error: selectError } = await this.supabaseService.client
      .from('races')
      .select('id')
      .eq('season_id', raceData.season_id)
      .eq('round', raceData.round)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      this.logger.error(`Select error for race ${raceData.name}:`, selectError.message);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingRace) {
      // It's an update
      this.logger.log(`Updating existing race: ${raceData.name}`);
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
      this.logger.log(`Creating new race: ${raceData.name}`);
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
