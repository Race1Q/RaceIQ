// src/circuits/circuit-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';

interface ApiCircuit {
  circuitId: string;
  circuitName: string;
  Location: {
    locality: string;
    country: string;
    lat: string;
    long: string;
  };
  url: string;
}

interface ApiResponse {
  MRData: {
    CircuitTable: {
      Circuits: ApiCircuit[];
    };
    total: string;
    limit: string;
    offset: string;
  };
}

@Injectable()
export class CircuitIngestService {
  private readonly logger = new Logger(CircuitIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async fetchAllCircuitsFromAPI(): Promise<ApiCircuit[]> {
    const allCircuits: ApiCircuit[] = [];
    let offset = 0;
    const limit = 30; // API returns 30 circuits per page
    let hasMore = true;

    try {
      while (hasMore) {
        const apiUrl = `https://api.jolpi.ca/ergast/f1/circuits/?format=json&offset=${offset}&limit=${limit}`;
        this.logger.log(`Fetching circuits from offset: ${offset}`);
        
        const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
        const circuits = response.data.MRData.CircuitTable.Circuits;
        
        this.logger.log(`Received ${circuits.length} circuits from offset ${offset}`);
        
        if (circuits.length > 0) {
          allCircuits.push(...circuits);
          
          // Check if we have more circuits to fetch
          const total = parseInt(response.data.MRData.total);
          const currentOffset = parseInt(response.data.MRData.offset);
          const currentLimit = parseInt(response.data.MRData.limit);
          
          if (currentOffset + currentLimit >= total) {
            hasMore = false;
          } else {
            offset += limit;
          }
        } else {
          hasMore = false;
        }

        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.logger.log(`Total circuits fetched: ${allCircuits.length}`);
      
      if (allCircuits.length > 0) {
        this.logger.log('First circuit:', allCircuits[0]);
        this.logger.log('Last circuit:', allCircuits[allCircuits.length - 1]);
      }
      
      return allCircuits;
    } catch (error) {
      this.logger.error('Failed to fetch circuits from API', error);
      throw new Error('Failed to fetch circuits data');
    }
  }

  private getCountryCode(country: string): string {
    // Map full country names to 3-letter country codes
    const countryMap: { [key: string]: string } = {
      'Australia': 'AUS',
      'Austria': 'AUT',
      'Azerbaijan': 'AZE',
      'Bahrain': 'BHR',
      'Belgium': 'BEL',
      'Canada': 'CAN',
      'China': 'CHN',
      'France': 'FRA',
      'Germany': 'DEU',
      'Hungary': 'HUN',
      'India': 'IND',
      'Italy': 'ITA',
      'Japan': 'JPN',
      'Malaysia': 'MYS',
      'Mexico': 'MEX',
      'Monaco': 'MCO',
      'Netherlands': 'NLD',
      'Portugal': 'PRT',
      'Russia': 'RUS',
      'Saudi Arabia': 'SAU',
      'Singapore': 'SGP',
      'Spain': 'ESP',
      'Turkey': 'TUR',
      'UAE': 'ARE',
      'UK': 'GBR',
      'USA': 'USA',
      'United States': 'USA',
      'United Kingdom': 'GBR',
      'United Arab Emirates': 'ARE',
      'South Africa': 'ZAF',
      'Argentina': 'ARG',
      'Morocco': 'MAR',
      'Sweden': 'SWE',
      'Korea': 'KOR',  // South Korea
      'San Marino': 'SMR',
      'Vietnam': 'VNM',
  
      // ✅ From your full circuits list (extra additions for uniqueness)
      'Brazil': 'BRA',
      'Qatar': 'QAT',
      'Europe': 'EUR', // Generic code for European circuits
    };
  
    return countryMap[country] || country.substring(0, 3).toUpperCase();
  }
  

  private async ensureCountryExists(countryCode: string, countryName: string): Promise<void> {
    try {
      // Check if country already exists
      const { data: existingCountry, error: selectError } = await this.supabaseService.client
        .from('countries')
        .select('iso3')
        .eq('iso3', countryCode)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // If country doesn't exist, create it
        this.logger.log(`Creating new country: ${countryCode} - ${countryName}`);
        
        const { error: insertError } = await this.supabaseService.client
          .from('countries')
          .insert({
            iso3: countryCode,
            country_name: countryName
          });

        if (insertError) {
          this.logger.error(`Failed to create country ${countryCode}:`, insertError);
          throw new Error(`Country creation failed: ${insertError.message}`);
        }

        this.logger.log(`Successfully created country: ${countryCode}`);
      } else if (!selectError) {
        this.logger.debug(`Country already exists: ${countryCode}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring country exists ${countryCode}:`, error);
      throw error;
    }
  }

  async ingestCircuits(): Promise<{ created: number; updated: number }> {
    const apiCircuits = await this.fetchAllCircuitsFromAPI();
    let created = 0;
    let updated = 0;

    this.logger.log(`Processing ${apiCircuits.length} circuits`);

    // First, ensure all required countries exist
    const uniqueCountries = new Map<string, string>();
    for (const apiCircuit of apiCircuits) {
      const countryCode = this.getCountryCode(apiCircuit.Location.country);
      uniqueCountries.set(countryCode, apiCircuit.Location.country);
    }

    this.logger.log(`Ensuring ${uniqueCountries.size} countries exist`);
    for (const [countryCode, countryName] of uniqueCountries) {
      try {
        await this.ensureCountryExists(countryCode, countryName);
      } catch (error) {
        this.logger.error(`Failed to ensure country ${countryCode} exists:`, error);
      }
    }

    // Then process circuits
    for (const apiCircuit of apiCircuits) {
      try {
        const result = await this.processCircuit(apiCircuit);
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (error) {
        this.logger.error(`Failed to process circuit ${apiCircuit.circuitName}:`, error);
        // Continue with next circuit even if one fails
      }
    }

    this.logger.log(`Ingested circuits: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  private async processCircuit(apiCircuit: ApiCircuit): Promise<'created' | 'updated'> {
    this.logger.log(`Processing circuit: ${apiCircuit.circuitName}`);

    // Convert full country name to 3-letter code
    const countryCode = this.getCountryCode(apiCircuit.Location.country);

    // Prepare circuit data for database with proper field lengths
    const circuitData = {
      name: apiCircuit.circuitName.substring(0, 100),
      location: apiCircuit.Location.locality.substring(0, 100),
      country_code: countryCode,
      map_url: apiCircuit.url.substring(0, 200)
    };

    this.logger.debug('Creating circuit with data:', circuitData);

    // Check if circuit exists by name
    const { data: existingCircuit, error: selectError } = await this.supabaseService.client
      .from('circuits')
      .select('*')
      .eq('name', circuitData.name)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      this.logger.error(`Select error for ${circuitData.name}:`, selectError);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingCircuit) {
      this.logger.log(`Updating existing circuit: ${circuitData.name}`);
      // Update existing circuit
      const { error } = await this.supabaseService.client
        .from('circuits')
        .update(circuitData)
        .eq('name', circuitData.name);

      if (error) {
        this.logger.error(`Failed to update circuit ${circuitData.name}`, error);
        throw new Error(`Update failed: ${error.message}`);
      }
      return 'updated';
    } else {
      this.logger.log(`Creating new circuit: ${circuitData.name}`);
      // Create new circuit
      const { error } = await this.supabaseService.client
        .from('circuits')
        .insert(circuitData);

      if (error) {
        this.logger.error(`Failed to create circuit ${circuitData.name}`, error);
        throw new Error(`Creation failed: ${error.message}`);
      }
      return 'created';
    }
  }
}