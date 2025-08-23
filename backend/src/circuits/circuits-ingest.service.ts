// src/circuits/circuit-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Circuit, ApiCircuit } from './circuits.entity';

@Injectable()
export class CircuitIngestService {
  private readonly logger = new Logger(CircuitIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Fetches all circuits from the Ergast API, handling pagination if necessary.
   * The Ergast API returns a maximum of 30 circuits per page.
   * @returns A promise of an array of ApiCircuit objects.
   */
  async fetchAllCircuitsFromAPI(): Promise<ApiCircuit[]> {
    const allCircuits: ApiCircuit[] = [];
    let offset = 0;
    const limit = 30; // API returns 30 circuits per page
    let hasMore = true;

    try {
      while (hasMore) {
        const apiUrl = `https://api.jolpi.ca/ergast/f1/circuits.json?limit=${limit}&offset=${offset}`;
        this.logger.log(`Fetching circuits from API with offset: ${offset}`);
        const response = await firstValueFrom(this.httpService.get(apiUrl));
        
        const apiResponse = response.data;
        const circuits = apiResponse.MRData.CircuitTable.Circuits;
        const total = parseInt(apiResponse.MRData.total, 10);
        
        this.logger.log(`Received ${circuits.length} circuits (Total: ${total})`);

        allCircuits.push(...circuits);
        offset += limit;
        hasMore = offset < total;
      }
      this.logger.log(`Successfully fetched all ${allCircuits.length} circuits.`);
      return allCircuits;
    } catch (error) {
      this.logger.error('Failed to fetch circuits', error.message);
      throw new Error('Failed to fetch circuits data from Ergast API');
    }
  }

  /**
   * Main method to ingest all circuits.
   * This is an idempotent function, meaning it will create new circuits or update existing ones.
   * @returns A promise of an object with the count of created and updated circuits.
   */
  async ingestCircuits(): Promise<{ created: number; updated: number }> {
    const apiCircuits = await this.fetchAllCircuitsFromAPI();
    let created = 0;
    let updated = 0;

    this.logger.log(`Processing ${apiCircuits.length} circuits`);
    
    for (const apiCircuit of apiCircuits) {
      try {
        const result = await this.processCircuit(apiCircuit);
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (error) {
        this.logger.error(`Failed to process circuit ${apiCircuit.circuitName}`, error.message);
        // Continue with the next circuit even if one fails
      }
    }

    this.logger.log(`Ingestion complete: ${created} created, ${updated} updated.`);
    return { created, updated };
  }

  /**
   * Processes a single circuit from the API, either creating or updating it in Supabase.
   * @param apiCircuit The circuit object from the API.
   * @returns A promise of either 'created' or 'updated'.
   */
  private async processCircuit(apiCircuit: ApiCircuit): Promise<'created' | 'updated'> {
    this.logger.log(`Processing circuit: ${apiCircuit.circuitName}`);

    // Map the API data to your Supabase schema
    const circuitData: Partial<Circuit> = {
      name: apiCircuit.circuitName,
      location: apiCircuit.Location.locality,
      country_code: apiCircuit.Location.country,
      map_url: apiCircuit.url.substring(0, 200) // Ensure URL fits within the column limit
    };

    // Check if circuit exists by name
    const { data: existingCircuit, error: selectError } = await this.supabaseService.client
      .from('circuits')
      .select('*')
      .eq('name', circuitData.name)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      this.logger.error(`Select error for ${circuitData.name}:`, selectError.message);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingCircuit) {
      this.logger.log(`Updating existing circuit: ${circuitData.name}`);
      const { error } = await this.supabaseService.client
        .from('circuits')
        .update(circuitData)
        .eq('id', existingCircuit.id);

      if (error) {
        this.logger.error(`Failed to update circuit ${circuitData.name}`, error.message);
        throw new Error(`Update failed: ${error.message}`);
      }
      return 'updated';
    } else {
      this.logger.log(`Creating new circuit: ${circuitData.name}`);
      const { error } = await this.supabaseService.client
        .from('circuits')
        .insert(circuitData);

      if (error) {
        this.logger.error(`Failed to create circuit ${circuitData.name}`, error.message);
        throw new Error(`Creation failed: ${error.message}`);
      }
      return 'created';
    }
  }
}
